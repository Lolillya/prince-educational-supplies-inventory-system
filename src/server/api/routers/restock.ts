import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const restockRouter = createTRPCRouter({
    getUnits: publicProcedure.query(async () => {
        try {
            const units = await db.unit.findMany({
                select: { name: true },
            });
            return units;
        } catch (error) {
            console.error("Error fetching units:", error);
            throw new Error("Failed to fetch units.");
        }
    }),

    addUnit: publicProcedure
        .input(
            z.object({
                name: z.string().min(0, "Unit name is required."),
            })
        )
        .mutation(async ({ input }) => {
            const { name } = input;
            try {
                const result = await db.unit.create({
                    data: { name },
                });

                return result;
            } catch (error) {
                console.error("Error adding unit:", error);
                throw new Error(`Failed to add unit: ${error.message}`);
            }
        }),

    deleteUnit: publicProcedure
        .input(z.object({ name: z.string().min(1, "Unit name is required.") }))
        .mutation(async ({ input }) => {
            const { name } = input;
            try {
                const result = await db.unit.delete({
                    where: { name },
                });

                return result;
            } catch (error) {
                console.error("Error deleting unit:", error);
                throw new Error(`Failed to delete unit: ${error.message}`);
            }
        }),
    getBatchId: publicProcedure.query(async () => {
        try {
            // Find the maximum batch_id in the database
            const lastBatch = await db.batch.findFirst({
                orderBy: { batch_id: "desc" },
                select: { batch_id: true },
            });

            // If there's no batch yet, return 1 as the starting batch_id
            const nextBatchId = lastBatch ? lastBatch.batch_id + 1 : 1;
            return nextBatchId;
        } catch (error) {
            console.error("Error fetching batch_id:", error);
            throw new Error("Failed to fetch batch_id.");
        }
    }),

    getSuppliers: publicProcedure.query(async () => {
        try {
            // Query suppliers based on their role
            const suppliers = await db.user_Role.findMany({
                where: {
                    Role: {
                        Role_name: "SUPPLIER", // Role must be SUPPLIER
                    },
                },
                select: {
                    Personal_Details: {
                        select: {
                            company: true, // Only select the company name
                        },
                    },
                },
            });

            // Format the result to a simple array of supplier companies
            return suppliers.map((supplier) => ({
                company: supplier.Personal_Details.company || null,
            }));
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            throw new Error("Failed to fetch suppliers.");
        }
    }),

});
