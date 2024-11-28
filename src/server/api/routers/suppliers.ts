import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const supplierRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const suppliers = await ctx.db.user_Role.findMany({
      where: { role_Id: 4 },
      include: { Personal_Details: true },
    });
    // console.log(suppliers);
    return suppliers ?? null;
  }),

  secret: publicProcedure.query(() => {
    return "secret";
  }),
});
