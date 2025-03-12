// server/api/routers/payment.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PaymentMethod } from '@prisma/client';

export const paymentRouter = createTRPCRouter({
    create: publicProcedure
        .input(z.object({
            invoiceId: z.number(),
            amount: z.number().positive(),
            method: z.nativeEnum(PaymentMethod),
            reference: z.string().nullish()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.$transaction(async (tx) => {
                    // 1. Create the payment
                    const payment = await tx.payment.create({
                        data: {
                            amount: input.amount,
                            payment_method: input.method,
                            reference: input.method === 'CASH' ? null : input.reference,
                            invoice_id: input.invoiceId,
                            payment_date: new Date(),
                        }
                    });

                    // 2. Get invoice with all payments
                    const invoice = await tx.invoice.findUniqueOrThrow({
                        where: { invoice_id: input.invoiceId },
                        include: { Payment: true }
                    });

                    // 3. Calculate total paid amount
                    const totalPaid = invoice.Payment.reduce(
                        (sum, p) => sum + p.amount,
                        0
                    );

                    // 4. Check if full amount is paid
                    if (totalPaid + input.amount >= invoice.total_amount) {
                        await tx.invoice.update({
                            where: { invoice_id: input.invoiceId },
                            data: { status: 'PAID' }
                        });
                    }

                    return payment;
                });
            } catch (error) {
                console.error("Payment creation error:", error);
                throw new Error("Failed to create payment");
            }
        }),
});