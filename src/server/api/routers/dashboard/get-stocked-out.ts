import { createTRPCRouter, publicProcedure } from "../../trpc";

export const GetStockedOut = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const totalQuantity = await ctx.db.line_Item.aggregate({
      _sum: { quantity: true },
    });

    return totalQuantity._sum.quantity || 0;
  }),
});
