import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const invoiceSchema = z.object({
  invoice_number: z.string(),
  customer_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  total_amount: z.number(),
  discount: z.number(),
  status: z.string(),
  payment_term_id: z.number(),
});

// TODO: INVOICE BACKEND CREATE FUNCTION

export const invoiceRouter = createTRPCRouter({
  getItems: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.inventory.findMany({
      include: {
        variant: {
          include: {
            item: {
              include: {
                brand: true,
                category: true,
              },
            },
            BatchVariant: {
              include: {
                SupplierUnit: true,
                batch: true,
              },
            },
          },
        },
      },
    });
  }),

  createInvoice: publicProcedure
    .input(
      z.object({
        invoice_number: z.string(),
        customer_id: z.string(),
        total_amount: z.number().optional(),
        discount: z.number().optional(),
        status: z.string(),
        payment_term_id: z.number(),
        line_items: z.array(
          z.object({
            variant_id: z.number(),
            quantity: z.number(),
            unit_price: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        invoice_number,
        customer_id,
        total_amount = 0.0,
        discount = 0.0,
        status,
        payment_term_id,
        line_items,
      } = input;

      // Calculate the total amount from line items if not provided
      const calculatedTotalAmount = line_items.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
      );

      const invoice = await ctx.db.invoice.create({
        data: {
          invoice_number,
          customer_id,
          total_amount: total_amount || calculatedTotalAmount,
          discount,
          status,
          payment_term_id,
          line_items: {
            create: line_items.map((item) => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.quantity * item.unit_price,
            })),
          },
        },
        include: {
          line_items: true,
        },
      });

      return invoice;
    }),
});
