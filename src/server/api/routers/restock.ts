import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import {db} from "~/server/db";

export const restockRouter = createTRPCRouter({
    getUnits: publicProcedure.query(async () => {
        try {
            const units = await db.unit.findMany({
                select: {name: true},
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
                name: z.string().min(1, "Unit name is required."),
            })
        )
        .mutation(async ({input}) => {
            const {name} = input;
            try {
                const result = await db.unit.create({
                    data: {name},
                });

                return result;
            } catch (error) {
                console.error("Error adding unit:", error);
                throw new Error(`Failed to add unit: ${error.message}`);
            }
        }),

    deleteUnit: publicProcedure
        .input(z.object({name: z.string().min(1, "Unit name is required.")}))
        .mutation(async ({input}) => {
            const {name} = input;
            try {
                const result = await db.unit.delete({
                    where: {name},
                });

                return result;
            } catch (error) {
                console.error("Error deleting unit:", error);
                throw new Error(`Failed to delete unit: ${error.message}`);
            }
        }),

    getBatchId: publicProcedure.query(async () => {
        try {
            const lastBatch = await db.batch.findFirst({
                orderBy: {batch_id: "desc"},
                select: {batch_id: true},
            });

            const nextBatchId = lastBatch ? lastBatch.batch_id + 1 : 1;
            return nextBatchId;
        } catch (error) {
            console.error("Error fetching batch_id:", error);
            throw new Error("Failed to fetch batch_id.");
        }
    }),

    getSuppliers: publicProcedure.query(async () => {
        try {
            const suppliers = await db.user_Role.findMany({
                where: {
                    Role: {
                        Role_name: "SUPPLIER",
                    },
                },
                select: {
                    id: true,
                    Personal_Details: {
                        select: {
                            company: true,
                        },
                    },
                },
            });

            return suppliers.map((supplier) => ({
                id: supplier.id,
                company: supplier.Personal_Details.company || null,
            }));
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            throw new Error("Failed to fetch suppliers.");
        }
    }),

    saveRestock: publicProcedure
        .input(
            z.object({
                selectedItems: z.array(
                    z.object({
                        variant_id: z.number(),
                        stockValue: z.number(), // Stock value (the value to be added to inventory)
                        totalStock: z.number(),
                        stockUnits: z.array(
                            z.object({
                                stock: z.number(),
                                price: z.number(),
                                unit: z.string(),
                                conversionQty: z.number(),
                                conversionUnit: z.string(),
                            })
                        ),
                        inventory_id: z.number(), // Ensure that inventory_id is passed in the input
                    })
                ),
                supplierId: z.string(),
                restockClerk: z.string(),
            })
        )
        .mutation(async ({input}) => {
            const {selectedItems, supplierId, restockClerk} = input;

            // Generate a 7-digit batch_number
            const generateBatchNumber = () => {
                return Math.floor(1000000 + Math.random() * 9000000); // Generates a 7-digit number
            };

            // Create a batch for the overall total stock quantity (using totalStock for batch creation)
            const batch = await db.batch.create({
                data: {
                    quantity: selectedItems.reduce((acc, item) => acc + item.totalStock, 0), // Total stock quantity across all variants
                    batch_number: generateBatchNumber(), // Generate a 7-digit batch number
                    restock_clerk: restockClerk, // Add restock_clerk
                },
            });

            // Loop through each selected item (variant)
            for (const item of selectedItems) {
                // Create a BatchVariant entry for each variant and link it to the batch
                const batchVariant = await db.batchVariant.create({
                    data: {
                        batch_id: batch.batch_id,
                        variant_id: item.variant_id,
                        quantity: item.totalStock, // Store total stock per variant in batchVariant
                    },
                });

                // Loop through stock units to save SupplierUnits
                for (const stockUnit of item.stockUnits) {
                    // Find the unit based on the unit name
                    const unit = await db.unit.findUnique({
                        where: {name: stockUnit.unit},
                    });

                    if (!unit) {
                        throw new Error(`Unit ${stockUnit.unit} not found.`);
                    }

                    // Create the SupplierUnit and associate it with the BatchVariant
                    const supplierUnit = await db.supplierUnit.create({
                        data: {
                            batch_variant_id: batchVariant.batch_variant_id, // Associate with BatchVariant
                            supplier_id: supplierId,
                            unit_id: unit.unit_id,
                            price: stockUnit.price,
                            quantity_per_unit: stockUnit.stock,
                            total_quantity: stockUnit.stock,
                        },
                    });

                    // If there's a conversion unit and quantity, create a ConversionRate
                    if (stockUnit.conversionUnit && stockUnit.conversionQty) {
                        const toUnit = await db.unit.findUnique({
                            where: {name: stockUnit.conversionUnit},
                        });

                        if (!toUnit) {
                            throw new Error(`Conversion unit ${stockUnit.conversionUnit} not found.`);
                        }

                        await db.conversionRate.create({
                            data: {
                                supplier_unit_id: supplierUnit.supplier_unit_id,
                                from_unit_id: unit.unit_id,
                                to_unit_id: toUnit.unit_id,
                                conversion_rate: stockUnit.conversionQty,
                            },
                        });
                    }
                }

                // Update the inventory stock by adding stockValue to the current quantity
                const inventory = await db.inventory.findUnique({
                    where: {inventory_id: item.inventory_id},
                });

                if (inventory) {
                    // Add the stockValue to the current inventory quantity
                    await db.inventory.update({
                        where: {
                            inventory_id: inventory.inventory_id,
                        },
                        data: {
                            quantity: inventory.quantity + item.totalStock, // Increment current quantity by stockValue
                        },
                    });
                } else {
                    // If inventory doesn't exist, create a new record with stockValue
                    await db.inventory.create({
                        data: {
                            variant_id: item.variant_id,
                            quantity: item.totalStock, // Set initial stock value as the stockValue
                        },
                    });
                }
            }

            return {message: "Restock data saved successfully!"};
        }),

    getRestockData: publicProcedure
        .input(z.object({clerkId: z.string().optional()}).optional())
        .query(async ({input}) => {
            try {
                const restocks = await db.batch.findMany({
                    where: input?.clerkId ? {restock_clerk: input.clerkId} : {},
                    include: {
                        batchVariants: {
                            include: {
                                variant: {
                                    include: {
                                        item: {
                                            include: {
                                                brand: true,
                                            },
                                        },
                                    },
                                },
                                SupplierUnit: {
                                    include: {
                                        unit: true,
                                        supplier: {
                                            include: {
                                                Personal_Details: true,
                                            },
                                        },
                                        ConversionRate: {
                                            include: {
                                                fromUnit: true,
                                                toUnit: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        Personal_Details: true,
                    },
                    orderBy: {created_at: "desc"},
                });

                const formattedRestocks = restocks.map((batch) => ({
                    restockId: batch.batch_number,
                    date: batch.created_at.toISOString().split("T")[0], // Format date to YYYY-MM-DD
                    supplier: batch.batchVariants[0]?.SupplierUnit[0]?.supplier?.Personal_Details
                        ? batch.batchVariants[0]?.SupplierUnit[0]?.supplier.Personal_Details.company
                        : "Unknown", // Get supplier's name from personal details
                    restockClerk: batch.Personal_Details
                        ? `${batch.Personal_Details.first_name} ${batch.Personal_Details.last_name}` // Get clerk's full name
                        : "Unknown", // Fallback if clerk details are missing
                    addedStock: batch.quantity,
                    restockItems: batch.batchVariants.map((batchVariant) => {
                        const unitConversions = batchVariant.SupplierUnit.flatMap((supplierUnit) =>
                            supplierUnit.ConversionRate.map((rate) => ({
                                from: rate.fromUnit.name,
                                count: rate.conversion_rate,
                                to: rate.toUnit.name,
                                price: supplierUnit.price,
                            }))
                        );

                        return {
                            variant: batchVariant.variant.name,
                            item: batchVariant.variant.item.name,
                            brand: batchVariant.variant.item.brand.name,
                            quantity: batchVariant.quantity,
                            price: batchVariant.SupplierUnit[0]?.price,
                            mainUnit: batchVariant.SupplierUnit[0]?.unit.name || "Unknown",
                            unitConversion: unitConversions,
                        };
                    }),
                }));

                return formattedRestocks;
            } catch (error) {
                console.error("Error fetching restock data:", error);
                throw new Error("Failed to fetch restock data.");
            }
        }),

});
