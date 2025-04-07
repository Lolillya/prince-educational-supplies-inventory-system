// server/api/routers/payment.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PaymentMethod } from "@prisma/client";

export const paymentRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        amount: z.number().positive(),
        method: z.nativeEnum(PaymentMethod),
        reference: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.$transaction(async (tx) => {
          // 1. Create the payment
          const payment = await tx.payment.create({
            data: {
              amount: input.amount,
              payment_method: input.method,
              reference: input.method === "CASH" ? null : input.reference,
              invoice_id: input.invoiceId,
              payment_date: new Date(),
            },
          });

          // 2. Get invoice with all payments
          const invoice = await tx.invoice.findUniqueOrThrow({
            where: { invoice_id: input.invoiceId },
            include: { Payment: true },
          });

          // 3. Calculate total paid amount
          const totalPaid = invoice.Payment.reduce(
            (sum, p) => sum + p.amount,
            0,
          );

          // 4. Check if full amount is paid
          if (totalPaid + input.amount >= invoice.total_amount) {
            await tx.invoice.update({
              where: { invoice_id: input.invoiceId },
              data: { status: "PAID" },
            });
          }

          return payment;
        });
      } catch (error) {
        console.error("Payment creation error:", error);
        throw new Error("Failed to create payment");
      }
    }),

  getByInvoiceId: publicProcedure
    .input(
      z.object({
        invoiceId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.payment.findMany({
          where: {
            invoice_id: input.invoiceId,
          },
          include: {
            invoice: {
              select: {
                invoice_number: true,
              },
            },
            PaymentLog: {
              select: {
                status: true,
                timestamp: true,
              },
              orderBy: {
                timestamp: "desc",
              },
            },
          },
          orderBy: {
            payment_date: "desc",
          },
        });
      } catch (error) {
        console.error("Error fetching payments:", error);
        throw new Error("Failed to fetch payments");
      }
    }),

  refund: publicProcedure
    .input(
      z.object({
        paymentId: z.number(),
        personalDetailsId: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Verify admin password
        const authRecord = await ctx.db.authentication.findUnique({
          where: { personal_details_id: input.personalDetailsId },
        });

        if (!authRecord) {
          throw new Error("User not found");
        }

        if (authRecord.password !== input.password) {
          throw new Error("Incorrect password");
        }

        // 2. Get user role to verify admin status
        const userRole = await ctx.db.user_Role.findFirst({
          where: { Personal_Details_Id: input.personalDetailsId },
          include: {
            Role: {
              select: {
                Role_name: true,
              },
            },
          },
        });

        if (!userRole || userRole.Role.Role_name !== "ADMIN") {
          throw new Error("Only ADMIN users can process refunds");
        }

        // 3. Process the refund
        return await ctx.db.$transaction(async (tx) => {
          // Get the payment record
          const payment = await tx.payment.findUnique({
            where: { payment_id: input.paymentId },
            include: { invoice: true },
          });

          if (!payment) {
            throw new Error("Payment not found");
          }

          // Create a payment log entry for the refund
          await tx.payment_Log.create({
            data: {
              payment_id: input.paymentId,
              invoice_id: payment.invoice_id,
              status: "REFUNDED",
              timestamp: new Date(),
            },
          });

          // Update invoice status to PENDING when a refund occurs
          // This ensures the amount goes back to unpaid
          await tx.invoice.update({
            where: { invoice_id: payment.invoice_id },
            data: { status: "PENDING" },
          });

          return { success: true };
        });
      } catch (error) {
        console.error("Refund error:", error);
        throw error instanceof Error
          ? error
          : new Error("Failed to process refund");
      }
    }),
});
