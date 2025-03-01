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
        invoice: invoiceSchema, // Schema for invoice input
        lineItems: z.array(LineItemSchema), // Schema for line items
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { invoice, lineItems } = input;

      const result = await ctx.db.$transaction(async (prisma) => {
        // Step 1: Validate stock availability
        for (const item of lineItems) {
          const supplierUnit = await prisma.supplierUnit.findFirst({
            where: {
              batchVariant: { variant_id: item.variant_id },
              unit_id: item.unit_id,
            },
          });

          if (!supplierUnit) {
            throw new Error(
              `Supplier unit not found for variant ID: ${item.variant_id}`,
            );
          }

          // Ensure there is enough stock
          if (supplierUnit.total_quantity < item.quantity) {
            throw new Error(
              `Insufficient stock for variant ID: ${item.variant_id}. Available: ${supplierUnit.total_quantity}, Required: ${item.quantity}`,
            );
          }
        }

        // Step 2: Create Invoice
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

        // Step 3: Create Line Items & Deduct Stock
        const createdLineItems = await Promise.all(
          lineItems.map(async (item) => {
            // Deduct stock
            await prisma.supplierUnit.updateMany({
              where: {
                batchVariant: { variant_id: item.variant_id },
                unit_id: item.unit_id,
              },
              data: { quantity_per_unit: { decrement: item.quantity } },
            });

            return prisma.line_Item.create({
              data: {
                invoice_id: invoiceId,
                variant_id: item.variant_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                unit_id: item.unit_id,
              },
            });
          }),
        );

        return { createdInvoice, createdLineItems };
      });

      return result;
    }),
});
