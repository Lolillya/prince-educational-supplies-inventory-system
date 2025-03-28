import { createTRPCRouter, publicProcedure } from "../../trpc";

export const GetStockedIn = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const totalQuantity = await ctx.db.batch.aggregate({
      _sum: { quantity: true },
    });

    return totalQuantity._sum.quantity || 0;
  }),
});
