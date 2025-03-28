import { createTRPCRouter, publicProcedure } from "../../trpc";

export const GetCategoryList = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.category.findMany({
      select: {
        name: true,
      },
    });
  }),
});
