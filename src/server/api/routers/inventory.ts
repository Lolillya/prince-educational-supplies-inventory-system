// ~/server/api/inventory.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";


// Helper function to normalize input
const normalizeInput = (value: any) =>
    typeof value === "string" && value.trim() === "" ? null : value;

// Zod schema for item input validation
const itemSchema = z.object({
    name: z
        .string()
        .min(1, "Item name is required")
        .max(100, "Item name must be at most 100 characters long")
        .transform(normalizeInput),
    brandId: z.number().int().positive("Brand ID must be a positive integer"),
    categoryId: z
        .number()
        .int()
        .positive("Category ID must be a positive integer"),
    description: z
        .string()
        .max(500, "Description must be at most 500 characters long")
        .optional()
        .transform(normalizeInput),
});

// Zod schema for variant input validation
const variantSchema = z.object({
    itemId: z.number().int().positive("Item ID must be a positive integer"),
    name: z
        .string()
        .min(1, "Variant name is required")
        .max(100, "Variant name must be at most 100 characters long")
        .transform(normalizeInput),
    description: z
        .string()
        .max(500, "Description must be at most 500 characters long")
        .optional()
        .transform(normalizeInput),
});

// Zod schema for inventory input validation
const inventorySchema = z.object({
    variantId: z.number().int().positive("Variant ID must be a positive integer"),
    quantity: z.number().int().min(0, "Quantity must be at least 0"),
});

// export const inventoryRouter = createTRPCRouter({
//     listInventory: publicProcedure.query(async () => {
//         return db.inventory.findMany({
//             include: {
//                 variant: {
//                     include: {
//                         item: {
//                             include: {
//                                 brand: true,
//                                 category: true,
//                             },
//                         },
//                         BatchVariant: {
//                             include: {
//                                 batch: {
//                                     include: {
//                                         batchVariants: {
//                                             include: {
//                                                 SupplierUnit: {
//                                                     include: {
//                                                         supplier: {
//                                                             include: {
//                                                                 Personal_Details: true,
//                                                             },
//                                                         },
//                                                         unit: true,
//                                                         ConversionRate: {
//                                                             select: {
//                                                                 conversion_rate: true,
//                                                                 fromUnit: {
//                                                                     select: {
//                                                                         name: true,
//                                                                     },
//                                                                 },
//                                                                 toUnit: {
//                                                                     select: {
//                                                                         name: true,
//                                                                     },
//                                                                 },
//                                                             },
//                                                         },
//                                                     },
//                                                 },
//                                             },
//                                         },
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 },
//             },
//         });
//     }),

export const inventoryRouter = createTRPCRouter({
    listInventory: publicProcedure.query(async () => {
        const inventory = await db.inventory.findMany({
            include: {
                variant: {
                    include: {
                        item: {
                            include: {
                                brand: true,
                                category: true,
                            },
                        },
                        BatchVariant: {
                            include: {
                                batch: {
                                    include: {
                                        batchVariants: {
                                            include: {
                                                SupplierUnit: {
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
                        },
                        StockLevel: true, // Ensure StockLevel is included in the query
                    },
                },
            },
        });
        console.log(inventory);  // Log the result to check if StockLevel is returned
        return inventory;
    }),


    getInventoryItem: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            // Fetch the inventory record and include related data
            const inventoryRecord = await db.inventory.findUnique({
                where: { inventory_id: input.id },
                include: {
                    variant: {
                        include: {
                            item: {
                                include: {
                                    variants: true, // Fetch all variants linked to the item
                                },
                            },
                        },
                    },
                },
            });

            // If no inventory record is found, return null
            if (!inventoryRecord || !inventoryRecord.variant) {
                return null;
            }

            // Step 2: Get the item_id from the associated variant
            const itemId = inventoryRecord.variant.item_id;

            // Step 3: Fetch all variants associated with the item_id
            const variants = await db.variant.findMany({
                where: { item_id: itemId }, // Use the item_id to fetch all variants
                include: {
                    item: {
                        include: {
                            brand: true,
                            category: true,
                        },
                    },
                    StockLevel: true,
                    BatchVariant: {
                        include: {
                            batch: {
                                include: {
                                    batchVariants: {
                                        include: {
                                            SupplierUnit: {
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
                    },
                },
            });

            // If no variants are found, return null
            if (!variants || variants.length === 0) {
                return null;
            }

            // Return the variants associated with the item
            return variants;
        }),


    // getInventoryItem: publicProcedure
    //     .input(z.object({ id: z.number() })) // Using zod for validation
    //     .query(async ({ input }) => {
    //         return db.inventory.findUnique({
    //             where: { inventory_id: input.id },
    //             include: {
    //                 variant: {
    //                     include: {
    //                         item: {
    //                             include: {
    //                                 brand: true,
    //                                 category: true,
    //                             },
    //                         },
    //                         StockLevel: true,
    //                         BatchVariant: {
    //                             include: {
    //                                 batch: {
    //                                     include: {
    //                                         batchVariants: {
    //                                             include: {
    //                                                 SupplierUnit: {
    //                                                     include: {
    //                                                         supplier: {
    //                                                             include: {
    //                                                                 Personal_Details: true,
    //                                                             },
    //                                                         },
    //                                                         unit: true,
    //                                                         ConversionRate: {
    //                                                             select: {
    //                                                                 conversion_rate: true,
    //                                                                 fromUnit: {
    //                                                                     select: {
    //                                                                         name: true,
    //                                                                     },
    //                                                                 },
    //                                                                 toUnit: {
    //                                                                     select: {
    //                                                                         name: true,
    //                                                                     },
    //                                                                 },
    //                                                             },
    //                                                         },
    //                                                     },
    //                                                 },
    //                                             },
    //                                         },
    //                                     },
    //                                 },
    //                             },
    //                         },
    //                     },
    //                 },
    //             },
    //         });
    //     }),



    listAllData: publicProcedure.query(async () => {
        try {
            const [brands, categories, units, items] = await Promise.all([
                db.brand.findMany(),
                db.category.findMany(),
                db.unit.findMany(),
                db.item.findMany({ include: { variants: true } }),
            ]);

            const variants = items.flatMap((item) =>
                item.variants.map((variant) => ({
                    variant_id: variant.variant_id,
                    name: variant.name,
                    item_id: item.item_id,
                    description: item.description,
                })),
            );

            return { brands, categories, units, items, variants };
        } catch (error) {
            console.error("Error listing all data:", error);
            throw new Error("Failed to retrieve data.");
        }
    }),


    createBrand: publicProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input }) => {
            const brand = await db.brand.create({
                data: { name: input.name },
            });
            return brand;
        }),

    createCategory: publicProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input }) => {
            const category = await db.category.create({
                data: { name: input.name },
            });
            return category;
        }),

    createItem: publicProcedure
        .input(
            z.object({
                name: z.string(),
                brand_id: z.number(),
                category_id: z.number(),
                description: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const item = await db.item.create({
                data: {
                    name: input.name,
                    brand_id: input.brand_id,
                    category_id: input.category_id,
                    description: input.description,
                },
            });
            return item;
        }),

    updateItem: publicProcedure
        .input(
            z.object({
                item_id: z.number(),
                name: z.string().optional(),
                brand_id: z.number().optional(),
                category_id: z.number().optional(),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { item_id, name, brand_id, category_id, description } = input;

            const updatedItem = await db.item.update({
                where: {
                    item_id: item_id,
                },
                data: {
                    name: name ?? undefined,
                    brand_id: brand_id ?? undefined,
                    category_id: category_id ?? undefined,
                    description: description ?? undefined,
                },
            });

            return updatedItem;
        }),


    createVariant: publicProcedure
        .input(
            z.object({
                item_id: z.number(),
                name: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { item_id, name } = input;

            // Create a new variant for the given item
            const variant = await db.variant.create({
                data: {
                    item_id,
                    name,
                },
            });

            return variant;
        }),

    createStockLevel: publicProcedure
        .input(
            z.object({
                variant_id: z.number(),
                low_stock: z.number(),
                very_low_stock: z.number(),
            })
        )
        .mutation(async ({ input }) => {
            const stockLevel = await db.stockLevel.create({
                data: {
                    variant_id: input.variant_id,
                    low_stock: input.low_stock,
                    very_low_stock: input.very_low_stock,
                },
            });
            return stockLevel;
        }),

    createInventory: publicProcedure
        .input(
            z.object({
                variant_id: z.number(),
                quantity: z.number(),
            })
        )
        .mutation(async ({ input }) => {
            const inventory = await db.inventory.create({
                data: {
                    variant_id: input.variant_id,
                    quantity: input.quantity,
                },
            });
            return inventory;
        }),

    editItem: publicProcedure
        .input(
            z.object({
                inventoryId: z.number(),
                name: z.string(),
                brand: z.string(),
                category: z.string(),
                description: z.string().optional(),
                variants: z.array(
                    z.object({
                        id: z.number(),
                        name: z.string(),
                        lowStock: z.number(),
                        veryLowStock: z.number(),
                    })
                ),
            })
        )
        .mutation(async ({ input }) => {
            const { inventoryId, name, brand, category, description, variants } = input;

            const variant = await prisma.variant.findUnique({
                where: { variant_id: inventoryId },
                include: {
                    item: {
                        include: {
                            brand: true,
                            category: true,
                        },
                    },
                },
            });

            if (!variant) {
                throw new Error("Variant not found");
            }

            const itemId = variant.item.item_id;
            const currentBrand = variant.item.brand;
            const currentCategory = variant.item.category;

            // Update Brand if necessary
            const updatedBrand = currentBrand.name !== brand ? await prisma.brand.update({
                where: { brand_id: currentBrand.brand_id },
                data: { name: brand },
            }) : currentBrand;

            // Update Category if necessary
            const updatedCategory = currentCategory.name !== category ? await prisma.category.update({
                where: { category_id: currentCategory.category_id },
                data: { name: category },
            }) : currentCategory;

            // Update Item
            const updatedItem = await prisma.item.update({
                where: { item_id: itemId },
                data: {
                    name,
                    description,
                    brand_id: updatedBrand.brand_id,
                    category_id: updatedCategory.category_id,
                },
                include: {
                    brand: true,
                    category: true,
                },
            });

            // Update Variants
            const updatedVariants = await Promise.all(
                variants.map((variantData) =>
                    prisma.variant.update({
                        where: { variant_id: variantData.id },
                        data: {
                            name: variantData.name,
                            StockLevel: {
                                upsert: {
                                    create: {
                                        low_stock: variantData.lowStock,
                                        very_low_stock: variantData.veryLowStock,
                                    },
                                    update: {
                                        low_stock: variantData.lowStock,
                                        very_low_stock: variantData.veryLowStock,
                                    },
                                },
                            },
                        },
                    })
                )
            );

            return { updatedItem, updatedVariants };
        }),

    deleteItem: publicProcedure
        .input(
            z.object({
                inventoryId: z.number(),
            })
        )
        .mutation(async ({ input }) => {
            const { inventoryId } = input;

            // Fetch the variant associated with the inventoryId
            const variant = await prisma.variant.findUnique({
                where: { variant_id: inventoryId },
                include: {
                    item: true, // Include the related item to access its ID
                },
            });

            if (!variant) {
                throw new Error("Variant not found");
            }

            const itemId = variant.item?.item_id;

            if (!itemId) {
                throw new Error("Associated item not found");
            }

            // Delete the Item and rely on cascading deletes for related records
            await prisma.item.delete({
                where: { item_id: itemId },
            });

            return { message: "Item and all related records deleted successfully." };
        }),

    deleteVariant: publicProcedure
        .input(
            z.object({
                variantId: z.number(),
            })
        )
        .mutation(async ({ input }) => {
            const { variantId } = input;

            // Delete the Variant; related records will be deleted due to cascading deletes
            await prisma.variant.delete({
                where: { variant_id: variantId },
            });

            return { message: "Variant and all related records deleted successfully." };
        }),

    // it return different variant_id value error creating new variant on edit-item
    // editItem: publicProcedure
    //     .input(
    //         z.object({
    //             inventoryId: z.number(),
    //             name: z.string(),
    //             brand: z.string(),
    //             category: z.string(),
    //             description: z.string().optional(),
    //             variants: z.array(
    //                 z.object({
    //                     id: z.number().optional(), // Optional, will be set only when updating
    //                     name: z.string(),
    //                     lowStock: z.number(),
    //                     veryLowStock: z.number(),
    //                 })
    //             ),
    //         })
    //     )
    //     .mutation(async ({ input }) => {
    //         const { inventoryId, name, brand, category, description, variants } = input;
    //
    //         console.log("Input received:", input); // Log the input for inspection
    //
    //         const variant = await prisma.variant.findUnique({
    //             where: { variant_id: inventoryId },
    //             include: {
    //                 item: {
    //                     include: {
    //                         brand: true,
    //                         category: true,
    //                     },
    //                 },
    //             },
    //         });
    //
    //         if (!variant) {
    //             throw new Error("Variant not found");
    //         }
    //
    //         const itemId = variant.item.item_id;
    //         const currentBrand = variant.item.brand;
    //         const currentCategory = variant.item.category;
    //
    //         // Log the item and its current brand/category for debugging
    //         console.log("Found item:", variant.item);
    //         console.log("Current brand:", currentBrand);
    //         console.log("Current category:", currentCategory);
    //
    //         // Update Brand if necessary
    //         const updatedBrand = currentBrand.name !== brand ? await prisma.brand.update({
    //             where: { brand_id: currentBrand.brand_id },
    //             data: { name: brand },
    //         }) : currentBrand;
    //
    //         // Update Category if necessary
    //         const updatedCategory = currentCategory.name !== category ? await prisma.category.update({
    //             where: { category_id: currentCategory.category_id },
    //             data: { name: category },
    //         }) : currentCategory;
    //
    //         // Update Item
    //         const updatedItem = await prisma.item.update({
    //             where: { item_id: itemId },
    //             data: {
    //                 name,
    //                 description,
    //                 brand_id: updatedBrand.brand_id,
    //                 category_id: updatedCategory.category_id,
    //             },
    //             include: {
    //                 brand: true,
    //                 category: true,
    //             },
    //         });
    //
    //         // Log the updated item
    //         console.log("Updated item:", updatedItem);
    //
    //         // Separate logic for creating and updating variants
    //         const updatedVariants = await Promise.all(
    //             variants.map(async (variantData) => {
    //                 console.log("Processing variant data:", variantData); // Log the variant data
    //
    //                 let variantRecord;
    //
    //                 if (variantData.id) {
    //                     // Update existing variant
    //                     console.log("Updating existing variant with ID:", variantData.id); // Log the ID being used for update
    //                     variantRecord = await prisma.variant.update({
    //                         where: { variant_id: variantData.id },
    //                         data: {
    //                             name: variantData.name,
    //                             StockLevel: {
    //                                 upsert: {
    //                                     create: {
    //                                         low_stock: variantData.lowStock,
    //                                         very_low_stock: variantData.veryLowStock,
    //                                     },
    //                                     update: {
    //                                         low_stock: variantData.lowStock,
    //                                         very_low_stock: variantData.veryLowStock,
    //                                     },
    //                                 },
    //                             },
    //                         },
    //                     });
    //                 } else {
    //                     // Create new variant (do not pass id)
    //                     console.log("Creating new variant:", variantData.name); // Log new variant creation
    //                     variantRecord = await prisma.variant.create({
    //                         data: {
    //                             name: variantData.name,
    //                             item_id: itemId,
    //                             StockLevel: {
    //                                 create: {
    //                                     low_stock: variantData.lowStock,
    //                                     very_low_stock: variantData.veryLowStock,
    //                                 },
    //                             },
    //                         },
    //                     });
    //                 }
    //
    //                 return variantRecord;
    //             })
    //         );
    //
    //         console.log("Updated variants:", updatedVariants); // Log updated variants after processing
    //         return { updatedItem, updatedVariants };
    //     }),

});

export default inventoryRouter;


