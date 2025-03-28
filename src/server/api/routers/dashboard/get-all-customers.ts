import { createTRPCRouter, publicProcedure } from "../../trpc";

export const GetAllCustomers = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.user_Role.count({
      where: { role_Id: 3 },
    });
    return count;
  }),
});
