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
                name: z.string().min(1, "Unit name is required."),
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
            const lastBatch = await db.batch.findFirst({
                orderBy: { batch_id: "desc" },
                select: { batch_id: true },
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

    // saveRestock: publicProcedure
    //     .input(
    //         z.object({
    //             selectedItems: z.array(
    //                 z.object({
    //                     variant_id: z.number(),
    //                     totalStock: z.number(),
    //                     stockUnits: z.array(
    //                         z.object({
    //                             stock: z.number(),
    //                             price: z.number(),
    //                             unit: z.string(),
    //                             conversionQty: z.number(),
    //                             conversionUnit: z.string(),
    //                         })
    //                     ),
    //                 })
    //             ),
    //             supplierId: z.string(),
    //         })
    //     )
    //     .mutation(async ({ input }) => {
    //         const { selectedItems, supplierId } = input;
    //
    //         // Create a batch for the overall total stock quantity
    //         const batch = await db.batch.create({
    //             data: {
    //                 quantity: selectedItems.reduce((acc, item) => acc + item.totalStock, 0), // Total stock quantity across all variants
    //             },
    //         });
    //
    //         // Loop through each selected item (variant)
    //         for (const item of selectedItems) {
    //             // Create a BatchVariant entry for each variant and link it to the batch
    //             const batchVariant = await db.batchVariant.create({
    //                 data: {
    //                     batch_id: batch.batch_id,
    //                     variant_id: item.variant_id,
    //                     quantity: item.totalStock, // Store total stock per variant
    //                 },
    //             });
    //
    //             // Loop through stock units to save SupplierUnits
    //             for (const stockUnit of item.stockUnits) {
    //                 // Find the unit based on the unit name
    //                 const unit = await db.unit.findUnique({
    //                     where: { name: stockUnit.unit },
    //                 });
    //
    //                 if (!unit) {
    //                     throw new Error(`Unit ${stockUnit.unit} not found.`);
    //                 }
    //
    //                 // Create the SupplierUnit and associate it with the BatchVariant
    //                 const supplierUnit = await db.supplierUnit.create({
    //                     data: {
    //                         batch_variant_id: batchVariant.batch_variant_id, // Associate with BatchVariant
    //                         supplier_id: supplierId,
    //                         unit_id: unit.unit_id,
    //                         price: stockUnit.price,
    //                         quantity_per_unit: stockUnit.stock,
    //                         total_quantity: item.totalStock,
    //                     },
    //                 });
    //
    //                 // If there's a conversion unit and quantity, create a ConversionRate
    //                 if (stockUnit.conversionUnit && stockUnit.conversionQty) {
    //                     const toUnit = await db.unit.findUnique({
    //                         where: { name: stockUnit.conversionUnit },
    //                     });
    //
    //                     if (!toUnit) {
    //                         throw new Error(`Conversion unit ${stockUnit.conversionUnit} not found.`);
    //                     }
    //
    //                     await db.conversionRate.create({
    //                         data: {
    //                             supplier_unit_id: supplierUnit.supplier_unit_id,
    //                             from_unit_id: unit.unit_id,
    //                             to_unit_id: toUnit.unit_id,
    //                             conversion_rate: stockUnit.conversionQty,
    //                         },
    //                     });
    //                 }
    //             }
    //         }
    //
    //         return { message: "Restock data saved successfully!" };
    //     }),

    // saveRestock: publicProcedure
    //     .input(
    //         z.object({
    //             selectedItems: z.array(
    //                 z.object({
    //                     inventory_id: z.number(), // Inventory ID for the item
    //                     variant_id: z.number(),
    //                     stockValue: z.number(), // Stock value (the value to be saved to inventory)
    //                     stockUnits: z.array(
    //                         z.object({
    //                             stock: z.number(),
    //                             price: z.number(),
    //                             unit: z.string(),
    //                             conversionQty: z.number(),
    //                             conversionUnit: z.string(),
    //                         })
    //                     ),
    //                 })
    //             ),
    //             supplierId: z.string(),
    //         })
    //     )
    //     .mutation(async ({ input }) => {
    //         const { selectedItems, supplierId } = input;
    //
    //         // Create a batch for the overall total stock quantity
    //         const batch = await db.batch.create({
    //             data: {
    //                 quantity: selectedItems.reduce((acc, item) => acc + item.stockValue, 0), // Total stock value
    //             },
    //         });
    //
    //         for (const item of selectedItems) {
    //             const batchVariant = await db.batchVariant.create({
    //                 data: {
    //                     batch_id: batch.batch_id,
    //                     variant_id: item.variant_id,
    //                     quantity: item.stockValue, // Use stockValue here instead of totalStock
    //                 },
    //             });
    //
    //             // Loop through stock units to save SupplierUnits
    //             for (const stockUnit of item.stockUnits) {
    //                 const unit = await db.unit.findUnique({
    //                     where: { name: stockUnit.unit },
    //                 });
    //
    //                 if (!unit) {
    //                     throw new Error(`Unit ${stockUnit.unit} not found.`);
    //                 }
    //
    //                 const supplierUnit = await db.supplierUnit.create({
    //                     data: {
    //                         batch_variant_id: batchVariant.batch_variant_id,
    //                         supplier_id: supplierId,
    //                         unit_id: unit.unit_id,
    //                         price: stockUnit.price,
    //                         quantity_per_unit: stockUnit.stock,
    //                         total_quantity: item.stockValue, // Use stockValue instead of totalStock
    //                     },
    //                 });
    //
    //                 if (stockUnit.conversionUnit && stockUnit.conversionQty) {
    //                     const toUnit = await db.unit.findUnique({
    //                         where: { name: stockUnit.conversionUnit },
    //                     });
    //
    //                     if (!toUnit) {
    //                         throw new Error(`Conversion unit ${stockUnit.conversionUnit} not found.`);
    //                     }
    //
    //                     await db.conversionRate.create({
    //                         data: {
    //                             supplier_unit_id: supplierUnit.supplier_unit_id,
    //                             from_unit_id: unit.unit_id,
    //                             to_unit_id: toUnit.unit_id,
    //                             conversion_rate: stockUnit.conversionQty,
    //                         },
    //                     });
    //                 }
    //             }
    //
    //             // Update the inventory stock with stockValue (not totalStock)
    //             const inventory = await db.inventory.findUnique({
    //                 where: { inventory_id: item.inventory_id },
    //             });
    //
    //             if (inventory) {
    //                 // Update inventory stock value to match stockValue
    //                 await db.inventory.update({
    //                     where: {
    //                         inventory_id: inventory.inventory_id,
    //                     },
    //                     data: {
    //                         quantity: item.stockValue, // Set quantity as the stock value
    //                     },
    //                 });
    //             } else {
    //                 // If inventory doesn't exist, create a new record with stockValue
    //                 await db.inventory.create({
    //                     data: {
    //                         variant_id: item.variant_id,
    //                         quantity: item.stockValue, // Set initial stock value as the stockValue
    //                     },
    //                 });
    //             }
    //         }
    //
    //         return { message: "Restock data saved successfully!" };
    //     }),

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
            })
        )
        .mutation(async ({ input }) => {
            const { selectedItems, supplierId } = input;

            // Create a batch for the overall total stock quantity (using totalStock for batch creation)
            const batch = await db.batch.create({
                data: {
                    quantity: selectedItems.reduce((acc, item) => acc + item.totalStock, 0), // Total stock quantity across all variants
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
                        where: { name: stockUnit.unit },
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
                            total_quantity: item.totalStock, // Store total stock per variant for the supplier unit
                        },
                    });

                    // If there's a conversion unit and quantity, create a ConversionRate
                    if (stockUnit.conversionUnit && stockUnit.conversionQty) {
                        const toUnit = await db.unit.findUnique({
                            where: { name: stockUnit.conversionUnit },
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
                    where: { inventory_id: item.inventory_id },
                });

                if (inventory) {
                    // Add the stockValue to the current inventory quantity
                    await db.inventory.update({
                        where: {
                            inventory_id: inventory.inventory_id,
                        },
                        data: {
                            quantity: inventory.quantity + item.stockValue, // Increment current quantity by stockValue
                        },
                    });
                } else {
                    // If inventory doesn't exist, create a new record with stockValue
                    await db.inventory.create({
                        data: {
                            variant_id: item.variant_id,
                            quantity: item.stockValue, // Set initial stock value as the stockValue
                        },
                    });
                }
            }

            return { message: "Restock data saved successfully!" };
        }),



    // getRestockData: publicProcedure.query(async () => {
    //     try {
    //         const restocks = await db.batch.findMany({
    //             include: {
    //                 batchVariants: {
    //                     include: {
    //                         variant: {
    //                             include: {
    //                                 item: {
    //                                     include: {
    //                                         brand: true,
    //                                         category: true,
    //                                     },
    //                                 },
    //                                 discount: true,
    //                             },
    //                         },
    //                         SupplierUnit: {
    //                             include: {
    //                                 unit: true,
    //                                 ConversionRate: {
    //                                     include: {
    //                                         fromUnit: true,
    //                                         toUnit: true,
    //                                     },
    //                                 },
    //                                 supplier: true, // Make sure you include the supplier information
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //             orderBy: { created_at: "desc" },
    //         });
    //
    //         const formattedRestocks = restocks.map((batch) => ({
    //             restockId: batch.batch_id,
    //             date: batch.created_at.toISOString().split("T")[0], // Date formatted as YYYY-MM-DD
    //             addedStock: batch.quantity,
    //             restockItems: batch.batchVariants.map((batchVariant) => ({
    //                 variant: batchVariant.variant.name,
    //                 item: batchVariant.variant.item.name,
    //                 brand: batchVariant.variant.item.brand.name,
    //                 quantity: batchVariant.quantity,
    //                 mainUnit: batchVariant.SupplierUnit[0]?.unit.name || "Unknown",
    //                 supplier: batchVariant.SupplierUnit[0]?.supplier?.name || "Unknown Supplier", // Fetch supplier name here
    //                 unitConversion: batchVariant.SupplierUnit[0]?.ConversionRate.map((rate) => ({
    //                     from: rate.fromUnit.name,
    //                     count: rate.conversion_rate,
    //                     to: rate.toUnit.name,
    //                 })) || [],
    //             })),
    //         }));
    //
    //         return formattedRestocks;
    //     } catch (error) {
    //         console.error("Error fetching restock data:", error);
    //         throw new Error("Failed to fetch restock data.");
    //     }
    // }),

    getRestockData: publicProcedure.query(async () => {
        try {
            const restocks = await db.batch.findMany({
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
                                            Personal_Details: true, // Ensure supplier's personal details are fetched
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
                },
                orderBy: { created_at: "desc" },
            });

            const formattedRestocks = restocks.map((batch) => ({
                restockId: batch.batch_id,
                date: batch.created_at.toISOString().split("T")[0], // Format date to YYYY-MM-DD
                supplier: batch.batchVariants[0]?.SupplierUnit[0]?.supplier?.Personal_Details
                    ? `${batch.batchVariants[0]?.SupplierUnit[0]?.supplier.Personal_Details.first_name} ${batch.batchVariants[0]?.SupplierUnit[0]?.supplier.Personal_Details.last_name}`
                    : "Unknown", // Get supplier's name from personal details
                addedStock: batch.quantity,
                restockItems: batch.batchVariants.map((batchVariant) => {
                    const unitConversions = batchVariant.SupplierUnit.flatMap((supplierUnit) =>
                        supplierUnit.ConversionRate.map((rate) => ({
                            from: rate.fromUnit.name,
                            count: rate.conversion_rate,
                            to: rate.toUnit.name,
                        }))
                    );

                    return {
                        variant: batchVariant.variant.name,
                        item: batchVariant.variant.item.name,
                        brand: batchVariant.variant.item.brand.name,
                        quantity: batchVariant.quantity,
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
