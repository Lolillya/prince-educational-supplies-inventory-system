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
//
// export const inventoryRouter = createTRPCRouter({
//   listInventory: publicProcedure.query(async () => {
//     return db.inventory.findMany({
//       include: {
//         variant: {
//           include: {
//             item: {
//               include: {
//                 brand: true,
//                 category: true,
//               },
//             },
//
//             Batch: {
//               include: {
//                 supplierUnits: {
//                   include: {
//                     supplier: {
//                       include: {
//                         Personal_Details: true,
//                       },
//                     },
//                     unit: true,
//                     ConversionRate: {
//                       select: {
//                         conversion_rate: true,
//                         fromUnit: {
//                           select: {
//                             name: true,
//                           },
//                         },
//                         toUnit: {
//                           select: {
//                             name: true,
//                           },
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });
//   }),
//
//   getInventoryItem: publicProcedure
//     .input(z.object({ id: z.number() })) // Using zod for validation
//     .query(async ({ input }) => {
//       return db.inventory.findUnique({
//         where: { inventory_id: input.id }, // Ensure inventory_id is the correct field
//         include: {
//           variant: {
//             include: {
//               item: {
//                 include: {
//                   brand: true,
//                   category: true,
//                 },
//               },
//
//               Batch: {
//                 include: {
//                   supplierUnits: {
//                     include: {
//                       supplier: {
//                         include: {
//                           Personal_Details: true,
//                         },
//                       },
//                       unit: true,
//                       ConversionRate: {
//                         select: {
//                           conversion_rate: true,
//                           fromUnit: {
//                             select: {
//                               name: true,
//                             },
//                           },
//                           toUnit: {
//                             select: {
//                               name: true,
//                             },
//                           },
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       });
//     }),
//
//   listAllData: publicProcedure.query(async () => {
//     try {
//       const [brands, categories, units, items] = await Promise.all([
//         db.brand.findMany(),
//         db.category.findMany(),
//         db.unit.findMany(),
//         db.item.findMany({ include: { variants: true } }),
//       ]);
//
//       const variants = items.flatMap((item) =>
//           item.variants.map((variant) => ({
//             variant_id: variant.variant_id,
//             name: variant.name,
//             item_id: item.item_id,
//             description: item.description,
//           })),
//       );
//
//       return { brands, categories, units, items, variants };
//     } catch (error) {
//       console.error("Error listing all data:", error);
//       throw new Error("Failed to retrieve data.");
//     }
//   }),

export const inventoryRouter = createTRPCRouter({
  listInventory: publicProcedure.query(async () => {
    return db.inventory.findMany({
      include: {
        variant: {
          include: {
            item: true,
            BatchVariant: {
              include: {
                SupplierUnit: true,
                batch: true,
              },
            },
          },
        },
      },
    });
  }),

  getInventoryItem: publicProcedure
    .input(z.object({ id: z.number() })) // Using zod for validation
    .query(async ({ input }) => {
      return db.inventory.findUnique({
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
          },
        },
      });
    }),

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
      }),
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
      }),
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
      }),
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
      }),
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
      }),
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
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { inventoryId, name, brand, category, description, variants } =
        input;

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

      const updatedBrand =
        currentBrand.name !== brand
          ? await prisma.brand.update({
              where: { brand_id: currentBrand.brand_id },
              data: { name: brand },
            })
          : currentBrand;

      const updatedCategory =
        currentCategory.name !== category
          ? await prisma.category.update({
              where: { category_id: currentCategory.category_id },
              data: { name: category },
            })
          : currentCategory;

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

      const updatedVariants = await Promise.all(
        variants.map((variant) =>
          prisma.variant.update({
            where: { variant_id: variant.id },
            data: {
              name: variant.name,
              StockLevel: {
                upsert: {
                  create: {
                    low_stock: variant.lowStock,
                    very_low_stock: variant.veryLowStock,
                  },
                  update: {
                    low_stock: variant.lowStock,
                    very_low_stock: variant.veryLowStock,
                  },
                },
              },
            },
          }),
        ),
      );

      return { updatedItem, updatedVariants };
    }),
});

export default inventoryRouter;
