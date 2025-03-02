import { SupplierUnit } from "@prisma/client";
import { resolve } from "path";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const invoiceSchema = z.object({
  // invoice_number: z.number(),
  customer_id: z.string(),
  invoice_clerk: z.string(),
  total_amount: z.number(),
  discount: z.number(),
  status: z.string(),
  payment_term_id: z.number(),
});

const LineItemSchema = z.object({
  supplier_unit_id: z.number(),
  variant_id: z.number(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
  unit_id: z.number(),
});

// TODO: INVOICE BACKEND CREATE FUNCTION

export const invoiceRouter = createTRPCRouter({
  getItems: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.inventory.findMany({
      select: {
        inventory_id: true,
        variant: {
          select: {
            name: true,
            variant_id: true,
            item: {
              select: {
                name: true,
                brand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            BatchVariant: {
              select: {
                batch_variant_id: true,
                quantity: true,
                batch: {
                  select: {
                    quantity: true,
                  },
                },
                SupplierUnit: {
                  select: {
                    supplier_unit_id: true,
                    price: true,
                    quantity_per_unit: true,
                    unit_id: true,
                    unit: {
                      select: {
                        name: true,
                        unit_id: true,
                      },
                    },
                    ConversionRate: {
                      select: {
                        conversion_rate: true,
                        toUnit: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }),

  getInvoiceId: publicProcedure.query(async ({ ctx }) => {
    try {
      const lastBatch = await ctx.db.invoice.findFirst({
        orderBy: { invoice_number: "desc" },
        select: { invoice_number: true },
      });

      const nextInvoiceId = lastBatch ? lastBatch.invoice_number + 1 : 1;
      return nextInvoiceId;
    } catch (error) {
      console.error("Error fetching batch_id:", error);
      throw new Error("Failed to fetch batch_id.");
    }
  }),

  getInvoice: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.invoice.findMany({
      select: {
        invoice_number: true,
        created_at: true,
        total_amount: true,
        discount: true,
        invoiceClerk: {
          select: {
            Personal_Details: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },

        customer: {
          include: {
            Personal_Details: {
              select: {
                first_name: true,
                last_name: true,
                company: true,
              },
            },
          },
        },
        line_items: {
          select: {
            quantity: true,
            unit_price: true,
            total_price: true,
            discount: true,
            unit: {
              select: {
                name: true,
              },
            },
            variant: {
              select: {
                name: true,
                item: {
                  select: {
                    name: true,
                    brand: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }),

  getCustomers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user_Role.findMany({
      where: {
        role_Id: 3,
      },
      select: {
        Personal_Details: {
          select: {
            company: true,
            personal_details_id: true,
          },
        },
      },
    });
  }),

  createInvoiceWithLineItems: publicProcedure
    .input(
      z.object({
        invoice: invoiceSchema,
        lineItems: z.array(LineItemSchema),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { invoice, lineItems } = input;

      console.log(lineItems);

      const result = await ctx.db.$transaction(async (prisma) => {
        // Step 1: Create Invoice
        // const createdInvoice = await prisma.invoice.create({
        //   data: {
        //     customer_id: invoice.customer_id,
        //     invoice_clerk: invoice.invoice_clerk,
        //     total_amount: invoice.total_amount,
        //     discount: invoice.discount,
        //     status: invoice.status,
        //     payment_term_id: invoice.payment_term_id,
        //   },
        // });

        // const invoiceId = createdInvoice.invoice_id;

        // Step 2: Process each Line Item
        const createdLineItems = await Promise.all(
          lineItems.map(async (item) => {
            let invoiceItemQty = item.quantity;
            let unitId = item.unit_id;
            let supplier_unit_id = item.supplier_unit_id;

            // Step 3: Fetch the SupplierUnit for the selected unit
            const supplierUnit = await ctx.db.supplierUnit.findFirst({
              where: {
                supplier_unit_id: supplier_unit_id,
                unit_id: unitId,
              },
            });

            if (!supplierUnit) {
              throw new Error(
                `Supplier unit not found for variant ID: ${item.variant_id}`,
              );
            }

            const supplierUnitList = await ctx.db.supplierUnit.findMany({
              where: {
                batch_variant_id: supplierUnit.batch_variant_id,
              },
              orderBy: {
                supplier_unit_id: "desc",
              },
            });

            const conversionList = await ctx.db.conversionRate.findMany({
              where: {
                supplier_unit_id: {
                  in: supplierUnitList.map((unit) => unit.supplier_unit_id),
                },
              },
            });

            console.log("Selected Item:", item);
            console.log("Supplier Unit Found:", supplierUnit);
            console.log("SupplierUnitList:", supplierUnitList);
            console.log("ConversionList:", conversionList);

            // while (remainingQty > 0) {
            while (supplierUnit.quantity_per_unit - invoiceItemQty < 0) {
              if (supplierUnit.quantity_per_unit >= invoiceItemQty) {
                // Deduct from the current unit
                await ctx.db.supplierUnit.update({
                  where: { supplier_unit_id: supplierUnit.supplier_unit_id },
                  data: { quantity_per_unit: { decrement: invoiceItemQty } },
                });
                invoiceItemQty = 0;
              } else {
                // Not enough stock in current unit, find higher unit to convert from
                const conversion = conversionList.find(
                  (c) => c.to_unit_id === supplierUnit.unit_id,
                );

                if (!conversion) {
                  throw new Error(
                    `Insufficient stock and no higher unit available for variant ID: ${item.variant_id}`,
                  );
                }

                const higherUnit = supplierUnitList.find(
                  (su) => su.unit_id === conversion.from_unit_id,
                );

                if (!higherUnit || higherUnit.quantity_per_unit <= 0) {
                  throw new Error(
                    `Insufficient stock in higher unit for variant ID: ${item.variant_id}`,
                  );
                }

                // Calculate how many higher units need to be deducted
                const higherUnitQtyToDeduct = Math.ceil(
                  invoiceItemQty / conversion.conversion_rate,
                );

                console.log(
                  `Converting ${invoiceItemQty} ${supplierUnit.unit_id} -> ${higherUnitQtyToDeduct} ${higherUnit.unit_id}`,
                );

                // Deduct from the higher unit
                // await ctx.db.supplierUnit.update({
                //   where: { supplier_unit_id: higherUnit.supplier_unit_id },
                //   data: {
                //     quantity_per_unit: { decrement: higherUnitQtyToDeduct },
                //   },
                // });

                // Update invoiceItemQty after conversion
                supplierUnit.quantity_per_unit += conversion.conversion_rate;
                // invoiceItemQty =
                //   supplierUnit.quantity_per_unit +
                //   higherUnitQtyToDeduct * conversion.conversion_rate -
                //   invoiceItemQty;
                console.log("UpdatedQuantity:", supplierUnit.quantity_per_unit);
              }
              console.log(
                `Remaining quantity after conversion: ${supplierUnit.quantity_per_unit - invoiceItemQty}`,
              );
            }
          }),
        );

        // return { createdInvoice, createdLineItems };
      });

      return result;
    }),
});
