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
        const createdInvoice = await prisma.invoice.create({
          data: {
            customer_id: invoice.customer_id,
            invoice_clerk: invoice.invoice_clerk,
            total_amount: invoice.total_amount,
            discount: invoice.discount,
            status: invoice.status,
            payment_term_id: invoice.payment_term_id,
          },
        });

        const invoiceId = createdInvoice.invoice_id;

        // Step 2: Process each Line Item
        const createdLineItems = await Promise.all(
          lineItems.map(async (item) => {
            let remainingQty = item.quantity;
            let unitId = item.unit_id;
            let supplier_unit_id = item.supplier_unit_id;

            // Step 3: Fetch the SupplierUnit for the selected unit
            const supplierUnit = await prisma.supplierUnit.findFirst({
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

            console.log("Selected Item:", item);
            console.log("Supplier Unit Found:", supplierUnit);

            if (supplierUnit.quantity_per_unit >= remainingQty) {
              // Deduct directly if enough stock is available in the requested unit
              await prisma.supplierUnit.update({
                where: { supplier_unit_id: supplierUnit.supplier_unit_id },
                data: { quantity_per_unit: { decrement: remainingQty } },
              });
            } else {
              // Step 4: Not enough stock in the lowest unit (unit_id = 1 -> pieces)
              if (supplierUnit.unit_id === 1) {
                console.log(
                  "Not enough stock in pieces. Checking higher units...",
                );

                // Reverse conversion: to_unit_id → from_unit_id
                const conversion = await prisma.conversionRate.findFirst({
                  where: {
                    to_unit_id: supplierUnit.unit_id, // From pieces -> higher unit
                  },
                });

                console.log("Conversion:", conversion);

                if (!conversion) {
                  throw new Error(
                    `Insufficient stock and no reverse conversion found for unit ID: ${unitId}`,
                  );
                }

                // Find the higher unit supplier
                const higherUnit = await prisma.supplierUnit.findFirst({
                  where: {
                    batchVariant: { variant_id: item.variant_id },
                    unit_id: conversion.from_unit_id, // Higher unit
                  },
                });

                if (!higherUnit || higherUnit.quantity_per_unit <= 0) {
                  throw new Error(
                    `Insufficient stock in higher unit for variant ID: ${item.variant_id}`,
                  );
                }

                // Calculate how many higher units need to be deducted
                const higherUnitQtyToDeduct = Math.ceil(
                  remainingQty / conversion.conversion_rate,
                );

                console.log(
                  `Converting ${remainingQty} pieces -> ${higherUnitQtyToDeduct} higher unit(s)`,
                );

                // Deduct from the higher unit's `quantity_per_unit`
                await prisma.supplierUnit.update({
                  where: { supplier_unit_id: higherUnit.supplier_unit_id },
                  data: {
                    quantity_per_unit: { decrement: higherUnitQtyToDeduct },
                  },
                });

                // Calculate remaining quantity in the current unit (pieces)
                console.log(
                  `Remaining pieces before conversion: ${remainingQty}`,
                );
                remainingQty =
                  supplierUnit.quantity_per_unit +
                  conversion.conversion_rate -
                  remainingQty;

                console.log(
                  `Remaining pieces after conversion: ${remainingQty}`,
                );

                // Deduct remaining pieces if any
                if (remainingQty > 0) {
                  await prisma.supplierUnit.update({
                    where: { supplier_unit_id: supplierUnit.supplier_unit_id },
                    data: { quantity_per_unit: remainingQty },
                  });
                }
              }
            }

            // Step 5: Create Line Item
            return prisma.line_Item.create({
              data: {
                invoice_id: invoiceId,
                variant_id: item.variant_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                unit_id: unitId,
              },
            });
          }),
        );

        return { createdInvoice, createdLineItems };
      });

      return result;
    }),
});
