import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const customerRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    const customers = ctx.db.user_Role.findMany({
      where: { role_Id: 3 },
      include: {
        Personal_Details: {
          include: { location: true },
        },
      },
    });
    return customers ?? null;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      const { id } = input;
      const customerData = ctx.db.personal_Details.findFirst({
        where: { personal_details_id: id },
        include: {
          location: true,
        },
      });
      return customerData;
    }),
});
