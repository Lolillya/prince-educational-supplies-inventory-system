import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const employeeRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) => {
    const employees = ctx.db.user_Role.findMany({
      where: { role_Id: 2 },
      include: {
        Personal_Details: {
          include: { location: true },
        },
      },
    });
    return employees ?? null;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;
      const employeeData = ctx.db.personal_Details.findFirst({
        where: { personal_details_id: id },
        include: { location: true },
      });
      return employeeData ?? null;
    }),
});
