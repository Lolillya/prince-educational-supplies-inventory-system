import { publicProcedure, createTRPCRouter } from "../trpc";
import { prisma } from "~/server/db";

export const staffRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const staff = await prisma.personal_Details.findMany({
      include: {
        User_Role: {
          select: {
            Role: {
              select: {
                Role_name: true,
              },
            },
          },
        },
      },
    });
    return staff;
  }),
});
