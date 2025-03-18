import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const invoiceSchema = z.object({
  // invoice_number: z.number(),
  customerNotes: z.string(),
  customer_id: z.string(),
  invoice_clerk: z.string(),
  total_amount: z.number(),
  discount: z.number(),
  status: z.string(),
  payment_term_id: z.number(),
  isAutoRestock: z.boolean(),
  isBatchAutoRestock: z.boolean(),
});

const LineItemSchema = z.object({
  supplier_unit_id: z.number().optional(),
  variant_id: z.number(),
  quantity: z.number(),
  available: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
  unit_id: z.number(),
});

const notesSchema = z.object({
  invoice_number: z.number(),
  invoice_id: z.number(),
  notes: z.string(),
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

  getInvoice: publicProcedure
    .input(
      z
        .object({
          clerkId: z.string().optional(),
          customerId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.invoice.findMany({
        where: {
          ...(input?.clerkId && { invoice_clerk: input.clerkId }),
          ...(input?.customerId && { customer_id: input.customerId }),
        },
        select: {
          invoice_number: true,
          invoice_id: true,
          created_at: true,
          total_amount: true,
          discount: true,
          notes: true,
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
        orderBy: { created_at: "desc" },
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

  getUnits: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.unit.findMany({
      select: {
        unit_id: true,
        name: true,
      },
    });
  }),

  saveNotes: publicProcedure
    .input(z.object({ notes: notesSchema }))
    .mutation(async ({ ctx, input }) => {
      const { notes } = input;

      const result = await ctx.db.$transaction(async () => {
        await ctx.db.invoice.update({
          where: {
            invoice_id: notes.invoice_id,
            invoice_number: notes.invoice_number,
          },
          data: {
            notes: notes.notes,
          },
        });
      });

      return result;
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

      console.log("Processing Invoice:", invoice);

      const result = await ctx.db.$transaction(async () => {
        // Step 1: Create Invoice
        const createdInvoice = await ctx.db.invoice.create({
          data: {
            customer_id: invoice.customer_id,
            invoice_clerk: invoice.invoice_clerk,
            total_amount: invoice.total_amount,
            discount: invoice.discount,
            status: invoice.status,
            payment_term_id: invoice.payment_term_id,
            notes: invoice.customerNotes,
          },
        });

        const invoiceId = createdInvoice.invoice_id;

        // Step 2: If isBatchAutoRestock is TRUE, directly create line items and return
        if (invoice.isBatchAutoRestock) {
          console.log("Batch Auto-Restock Enabled - Skipping stock logic");

          const createdLineItems = await ctx.db.line_Item.createMany({
            data: lineItems.map((item) => ({
              invoice_id: invoiceId,
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              unit_id: item.unit_id,
            })),
          });

          const generateBatchNumber = () => {
            return Math.floor(1000000 + Math.random() * 9000000);
          };

          const batch = await ctx.db.batch.create({
            data: {
              quantity: lineItems[0]?.quantity ?? 0,
              batch_number: generateBatchNumber(),
              restock_clerk: invoice.invoice_clerk,
            },
          });

          let batchVariant;

          if (lineItems[0]?.variant_id !== undefined) {
            batchVariant = await ctx.db.batchVariant.create({
              data: {
                batch_id: batch.batch_id,
                variant_id: lineItems[0].variant_id, // Safe because we checked for undefined
                quantity: lineItems[0].quantity ?? 0,
              },
            });
          } else {
            console.warn(
              "Skipping batchVariant creation due to undefined variant_id",
            );
          }

          return { createdInvoice, createdLineItems, batch, batchVariant };
        }

        else if (invoice.isAutoRestock) { 
          console.log("Auto Restock triggered!")

          const createdLineItems = await ctx.db.line_Item.createMany({
            data: lineItems.map((item) => ({
              invoice_id: invoiceId,
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              unit_id: item.unit_id,
            })),
          });

          const generateBatchNumber = () => {
            return Math.floor(1000000 + Math.random() * 9000000);
          }

          const batch = await ctx.db.batch.create({
            data: {
              quantity: (lineItems[0]?.quantity ?? 0) - (lineItems[0]?.available ?? 0),
              batch_number: generateBatchNumber(),
              restock_clerk: invoice.invoice_clerk,
            },
          });

          let batchVariant;

          if (lineItems[0]?.variant_id !== undefined) {
            batchVariant = await ctx.db.batchVariant.create({
              data: {
                batch_id: batch.batch_id,
                variant_id: lineItems[0].variant_id, // Safe because we checked for undefined
                quantity: (lineItems[0]?.quantity - lineItems[0]?.available),
              },
            });
          } else {
            console.warn(
              "Skipping batchVariant creation due to undefined variant_id",
            );
          }

          return { createdInvoice, createdLineItems, batch, batchVariant };


        }

        // Step 3: Process each Line Item when isBatchAutoRestock is FALSE
        const createdLineItems = await Promise.all(
          lineItems.map(async (item) => {
            let invoiceItemQty = item.quantity;
            const unitId = item.unit_id;
            const supplier_unit_id = item.supplier_unit_id;

            // Find the Supplier Unit
            const supplierUnit = await ctx.db.supplierUnit.findFirst({
              where: { supplier_unit_id, unit_id: unitId },
            });

            if (!supplierUnit) {
              throw new Error(
                `Supplier unit not found for variant ID: ${item.variant_id}`,
              );
            }

            const supplierUnitList = await ctx.db.supplierUnit.findMany({
              where: { batch_variant_id: supplierUnit.batch_variant_id },
              orderBy: { supplier_unit_id: "desc" },
            });

            const conversionList = await ctx.db.conversionRate.findMany({
              where: {
                supplier_unit_id: {
                  in: supplierUnitList.map((unit) => unit.supplier_unit_id),
                },
              },
            });

            console.log("Processing Item:", item);

            if (invoice.isAutoRestock) {
              await ctx.db.supplierUnit.update({
                where: { supplier_unit_id: supplierUnit.supplier_unit_id },
                data: { quantity_per_unit: 0 },
              });
            } else {
              while (supplierUnit.quantity_per_unit - invoiceItemQty < 0) {
                if (supplierUnit.quantity_per_unit >= invoiceItemQty) {
                  await ctx.db.supplierUnit.update({
                    where: { supplier_unit_id: supplierUnit.supplier_unit_id },
                    data: { quantity_per_unit: { decrement: invoiceItemQty } },
                  });
                  invoiceItemQty = 0;
                } else {
                  // Find conversion for higher unit
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

                  // Deduct from higher unit
                  await ctx.db.supplierUnit.update({
                    where: { supplier_unit_id: higherUnit.supplier_unit_id },
                    data: { quantity_per_unit: { decrement: 1 } },
                  });

                  // Convert quantity and update supplierUnit
                  supplierUnit.quantity_per_unit += conversion.conversion_rate;
                }
              }

              await ctx.db.supplierUnit.update({
                where: { supplier_unit_id: supplierUnit.supplier_unit_id },
                data: {
                  quantity_per_unit:
                    supplierUnit.quantity_per_unit - invoiceItemQty,
                },
              });
            }

            const allZeroQuantity =
              (await ctx.db.supplierUnit.count({
                where: {
                  batch_variant_id: supplierUnit.batch_variant_id,
                  quantity_per_unit: { gt: 0 },
                },
              })) === 0;

            if (allZeroQuantity) {
              await ctx.db.batchVariant.delete({
                where: { batch_variant_id: supplierUnit.batch_variant_id },
              });
            }

            // Create Line Item
            // return ctx.db.line_Item.create({
            //   data: {
            //     invoice_id: invoiceId,
            //     variant_id: item.variant_id,
            //     quantity: item.quantity,
            //     unit_price: item.unit_price,
            //     total_price: item.total_price,
            //     unit_id: unitId,
            //   },
            // });
          }),
        );

        return { createdInvoice, createdLineItems };
      });

      return result;
    }),
});
