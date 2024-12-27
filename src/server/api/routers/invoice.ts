import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const invoiceRouter = createTRPCRouter({
  getInventoryItem: publicProcedure
    .input(z.object({ id: z.number() })) // Using zod for validation
    .query(async ({ input }) => {
      return db.inventory.findUnique({
        where: { inventory_id: input.id }, // Ensure inventory_id is the correct field
        include: {
          variant: {
            include: {
              item: {
                include: {
                  brand: true,
                  category: true,
                },
              },

              Batch: {
                include: {
                  supplierUnits: {
                    include: {
                      supplier: {
                        include: {
                          Personal_Details: true,
                        },
                      },
                      unit: true,
                      ConversionRate: {
                        select: {
                          conversion_rate: true,
                          fromUnit: {
                            select: {
                              name: true,
                            },
                          },
                          toUnit: {
                            select: {
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }),
});
