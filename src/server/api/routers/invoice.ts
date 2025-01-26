import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const invoiceSchema = z.object({
  invoice_number: z.string(),
  customer_id: z.string(),
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
                  },
                },
              },
            },
          },
        },
      },
    });
  }),

  getSuppliers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user_Role.findMany({
      where: {
        role_Id: 4,
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
        const createdInvoice = await prisma.invoice.create({
          data: {
            invoice_number: invoice.invoice_number,
            customer_id: invoice.customer_id,
            total_amount: invoice.total_amount,
            discount: invoice.discount,
            status: invoice.status,
            payment_term_id: invoice.payment_term_id,
          },
        });

        const invoiceId = createdInvoice.invoice_id;

        const createdLineItems = await Promise.all(
          lineItems.map((item) =>
            prisma.line_Item.create({
              data: {
                invoice_id: invoiceId,
                variant_id: item.variant_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.quantity * item.unit_price,
              },
            }),
          ),
        );

        console.log(createdInvoice);
        console.log(createdLineItems);

        return { createdInvoice, createdLineItems };
      });

      return result;
    }),
});
