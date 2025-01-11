import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const invoiceSchema = z.object({
  invoice_number: z.string(),
  customer_id: z.string(),
  total_amount: z.number().optional(),
  discount: z.number().optional(),
  status: z.string(),
  payment_term_id: z.number(),
  // line_items: z.object({
  //   variant_id: z.number(),
  //   quantity: z.number(),
  //   unit_price: z.number(),
  // }),
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

  createInvoice: publicProcedure
    .input(invoiceSchema)
    .mutation(async ({ input, ctx }) => {
      const createdInvoice = await ctx.db.invoice.create({
        data: {
          invoice_number: input.invoice_number,
          customer_id: input.customer_id,
          total_amount: input.total_amount,
          discount: input.discount,
          status: input.status,
          payment_term_id: input.payment_term_id,
          // line_items: {
          //   variant_id: input.line_items.variant_id,
          //   quantity: input.line_items.quantity,
          //   unit_price: input.line_items.unit_price,
          // }
        },
      });
      return createdInvoice;
    }),
});
