import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const listsRouter = createTRPCRouter({
    listInventory: publicProcedure.query(async () => {
        try {
            const inventory = await db.inventory.findMany({
                include: {
                    variant: {
                        include: {
                            item: {
                                select: {
                                    name: true,
                                    brand: {
                                        select: {
                                            name: true, // Get brand name
                                        },
                                    },
                                },
                            },
                            Unit: {
                                select: {
                                    name: true, // Get unit name from Unit model
                                },
                            },
                            Batch: {
                                include: {
                                    supplierUnits: {
                                        select: {
                                            price: true, // Get price from SupplierUnit
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            return inventory;
        } catch (error) {
            console.error("Error fetching inventory list:", error);
            throw new Error("Failed to fetch inventory list.");
        }
    }),

    getInventoryItem: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            try {
                const inventoryItem = await db.inventory.findUnique({
                    where: { inventory_id: input.id },
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
                                                unit: {
                                                    select: {
                                                        name: true, // Fetch the unit name
                                                    },
                                                },
                                                price: true, // Fetch the price per product
                                                supplier: {
                                                    include: {
                                                        Personal_Details: true,
                                                    },
                                                },
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

                if (!inventoryItem) {
                    throw new Error("Inventory item not found.");
                }

                return inventoryItem;
            } catch (error) {
                console.error("Error fetching inventory item:", error);
                throw new Error("Failed to fetch inventory item.");
            }
        }),
});
