import { prisma } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const inventoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const items = await prisma.item.findMany({
      include: {
        brand: true,
      },
    });
    return items;
  }),
});
