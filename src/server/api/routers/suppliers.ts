import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const supplierRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const suppliers = await db.user_Role.findMany({
      where: { role_Id: 4 },
      include: {
        Personal_Details: {
          include: { location: true },
        },
      },
    });
    return suppliers ?? null;
  }),
});
