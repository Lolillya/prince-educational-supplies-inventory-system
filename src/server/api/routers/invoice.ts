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
  supplier_unit_id: z.number(),
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
                  orderBy: { supplier_unit_id: "asc" },
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
                      orderBy: { conversion_id: "asc" },
                      select: {
                        conversion_rate: true,
                        from_unit_id: true,
                        to_unit_id: true,
                        toUnit: {
                          select: {
                            name: true,
                            unit_id: true,
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
          status: true,
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

      try {
        const result = await ctx.db.$transaction(async (tx) => {
          // Step 1: Create Invoice
          const createdInvoice = await tx.invoice.create({
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

          // Step 2: Handle Auto-Restock cases
          if (invoice.isBatchAutoRestock || invoice.isAutoRestock) {
            console.log(
              invoice.isBatchAutoRestock
                ? "Batch Auto-Restock Enabled - Skipping stock logic"
                : "Auto Restock triggered!",
            );

            const createdLineItems = await tx.line_Item.createMany({
              data: lineItems.map((item) => ({
                supplier_unit_id: item.supplier_unit_id,
                invoice_id: invoiceId,
                variant_id: item.variant_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                unit_id: item.unit_id,
              })),
            });

            const generateBatchNumber = () =>
              Math.floor(1000000 + Math.random() * 9000000);

            const batchQuantity = invoice.isBatchAutoRestock
              ? (lineItems[0]?.quantity ?? 0)
              : (lineItems[0]?.quantity ?? 0) - (lineItems[0]?.available ?? 0);

            const batch = await tx.batch.create({
              data: {
                quantity: batchQuantity,
                batch_number: generateBatchNumber(),
                restock_clerk: invoice.invoice_clerk,
              },
            });

            if (lineItems[0]?.variant_id !== undefined) {
              const batchVariant = await tx.batchVariant.create({
                data: {
                  batch_id: batch.batch_id,
                  variant_id: lineItems[0].variant_id,
                  quantity: batchQuantity,
                },
              });

              return { createdInvoice, createdLineItems, batch, batchVariant };
            } else {
              console.warn(
                "Skipping batchVariant creation due to undefined variant_id",
              );
              return { createdInvoice, createdLineItems, batch };
            }
          }

          // Step 3: Process Line Items when no auto-restock
          const createdLineItems = await Promise.all(
            lineItems.map(async (item) => {
              let invoiceItemQty = item.quantity;
              const unitId = item.unit_id;
              const supplier_unit_id = item.supplier_unit_id;

              const supplierUnit = await tx.supplierUnit.findFirst({
                where: { supplier_unit_id, unit_id: unitId },
              });

              if (!supplierUnit) {
                throw new Error(
                  `Supplier unit not found for variant ID: ${item.variant_id}`,
                );
              }

              const supplierUnitList = await tx.supplierUnit.findMany({
                where: { batch_variant_id: supplierUnit.batch_variant_id },
                orderBy: { supplier_unit_id: "desc" },
              });

              const conversionList = await tx.conversionRate.findMany({
                where: {
                  supplier_unit_id: {
                    in: supplierUnitList.map((unit) => unit.supplier_unit_id),
                  },
                },
              });

              console.log("Processing Item:", item);

              if (invoice.isAutoRestock) {
                await tx.supplierUnit.update({
                  where: { supplier_unit_id: supplierUnit.supplier_unit_id },
                  data: { quantity_per_unit: 0 },
                });
              } else {
                while (supplierUnit.quantity_per_unit - invoiceItemQty < 0) {
                  if (supplierUnit.quantity_per_unit >= invoiceItemQty) {
                    await tx.supplierUnit.update({
                      where: {
                        supplier_unit_id: supplierUnit.supplier_unit_id,
                      },
                      data: {
                        quantity_per_unit: { decrement: invoiceItemQty },
                      },
                    });
                    invoiceItemQty = 0;
                  } else {
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

                    await tx.supplierUnit.update({
                      where: { supplier_unit_id: higherUnit.supplier_unit_id },
                      data: { quantity_per_unit: { decrement: 1 } },
                    });

                    supplierUnit.quantity_per_unit +=
                      conversion.conversion_rate;
                  }
                }

                await tx.supplierUnit.update({
                  where: { supplier_unit_id: supplierUnit.supplier_unit_id },
                  data: {
                    quantity_per_unit:
                      supplierUnit.quantity_per_unit - invoiceItemQty,
                  },
                });
              }

              const allZeroQuantity =
                (await tx.supplierUnit.count({
                  where: {
                    batch_variant_id: supplierUnit.batch_variant_id,
                    quantity_per_unit: { gt: 0 },
                  },
                })) === 0;

              if (allZeroQuantity) {
                await tx.batchVariant.delete({
                  where: { batch_variant_id: supplierUnit.batch_variant_id },
                });
              }

              return tx.line_Item.create({
                data: {
                  supplier_unit_id: supplier_unit_id,
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
      } catch (error) {
        console.error("Transaction failed, rolling back:", error);
        throw new Error("Invoice creation failed. Please try again.");
      }
    }),

  voidInvoice: publicProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.$transaction(async (prisma) => {
          // Find the invoice
          const invoice = await prisma.invoice.findFirst({
            where: { invoice_id: input },
          });

          if (!invoice) {
            throw new Error("Invoice not found.");
          }

          // Find all line items for the invoice
          const line_items = await prisma.line_Item.findMany({
            where: { invoice_id: input },
          });

          if (line_items.length === 0) {
            throw new Error("No line items found for the invoice.");
          }

          // Update supplier units
          const supplierUnits = await Promise.all(
            line_items.map((item) =>
              prisma.supplierUnit.update({
                where: {
                  supplier_unit_id: item.supplier_unit_id,
                  unit_id: item.unit_id,
                },
                data: {
                  quantity_per_unit: item.quantity,
                },
              }),
            ),
          );

          // Update invoice status
          const updatedInvoice = await prisma.invoice.update({
            where: { invoice_id: input },
            data: {
              status: "VOIDED",
            },
          });

          return { updatedInvoice, supplierUnits };
        });

        console.log("Transaction successful:", result);
        return result.updatedInvoice;
      } catch (error) {
        console.error("Transaction failed:", error);

        if (error instanceof Error) {
          throw new Error(`Transaction failed: ${error.message}`);
        } else {
          throw new Error("Transaction failed due to an unknown error.");
        }
      }
    }),
});
