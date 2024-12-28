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

// Define the inventory router
// export const inventoryRouter = createTRPCRouter({
//     listInventory: publicProcedure.query(async () => {
//         return prisma.inventory.findMany({
//             include: {
//                 variant: {
//                     include: {
//                         item: {
//                             include: {
//                                 brand: true,
//                                 category: true,
//                             },
//                         },
//                         variantAttributes: {
//                             include: {
//                                 attributeValue: {
//                                     select: {
//                                         value: true,
//                                     },
//                                 },
//                             },
//                         },
//                         Batch: {
//                             include: {
//                                 supplierUnits: {
//                                     include: {
//                                         supplier: {
//                                             include: {
//                                                 personal_details: true,
//                                             },
//                                         },
//                                         unit: true,
//                                         ConversionRate: {
//                                             select: {
//                                                 conversion_rate: true,
//                                                 fromUnit: {
//                                                     select: {
//                                                         name: true,
//                                                     },
//                                                 },
//                                                 toUnit: {
//                                                     select: {
//                                                         name: true,
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
//
export const inventoryRouter = createTRPCRouter({
  listInventory: publicProcedure.query(async () => {
    return db.inventory.findMany({
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
                batch: true,
                SupplierUnit: true,
              },
            },
          },
        },
      },
    });
  }),
});

// getInventoryItem: publicProcedure
//   .input(z.object({ id: z.number() })) // Using zod for validation
//   .query(async ({ input }) => {
//     return db.inventory.findUnique({
//       where: { inventory_id: input.id }, // Ensure inventory_id is the correct field
//       include: {
//         variant: {
//           include: {
//             item: {
//               include: {
//                 brand: true,
//                 category: true,
//               },
//             },

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

// listAllData: publicProcedure.query(async () => {
//     const brands = await prisma.brand.findMany();
//     const categories = await prisma.category.findMany();
//     const units = await prisma.unit.findMany();
//     const items = await prisma.item.findMany({
//         include: {
//             variants: true, // Include variants associated with each item
//         },
//     });
//     const attributes = await prisma.attribute.findMany({
//         include: {
//             attributeValues: true, // Include attribute values
//         },
//     });
//
//     // Extract all variants into a flat list
//     const variants = items.flatMap(item =>
//         item.variants.map(variant => ({
//             variant_id: variant.variant_id,
//             name: variant.name,
//             item_id: item.item_id, // Include item_id for reference
//         }))
//     );
//
//     return {
//         brands,
//         categories,
//         units,
//         items,
//         variants, // Return the flat list of variants
//         attributes, // Return attributes data
//     };
// }),

// Create a new item
// createItem: publicProcedure.input(itemSchema).mutation(async ({ input }) => {
//   const { name, brandId, categoryId, description } = input;

//   const newItem = await db.item.create({
//     data: {
//       name,
//       brand_id: brandId,
//       category_id: categoryId,
//       description,
//     },
//   });

//   return newItem;
// }),

// Create a new variant
//   createVariant: publicProcedure
//     .input(variantSchema)
//     .mutation(async ({ input }) => {
//       const { itemId, name, description } = input;

//       const newVariant = await db.variant.create({
//         data: {
//           item_id: itemId,
//           name,
//           description,
//         },
//       });

//       return newVariant;
//     }),

//   // Create a new inventory record
//   createInventory: publicProcedure
//     .input(inventorySchema)
//     .mutation(async ({ input }) => {
//       const { variantId, quantity } = input;

//       const newInventory = await db.inventory.create({
//         data: {
//           variant_id: variantId,
//           quantity,
//         },
//       });

//       return newInventory;
//     }),

//   // Other CRUD operations (placeholders for now)
//   // Update item, variant, and inventory, delete operations, etc. can be added here
// });

// Exporting the router
export default inventoryRouter;

//
// // Create a new batch
// createBatch: publicProcedure.input(z.object({
//     variantId: z.number().int().positive("Variant ID must be a positive integer"),
//     quantity: z.number().int().min(1, "Quantity must be at least 1"),
// })).mutation(async ({ input }) => {
//     const { variantId, quantity } = input;
//
//     const newBatch = await prisma.batch.create({
//         data: {
//             variant_id: variantId,
//             quantity,
//         },
//     });
//
//     // Optionally, update inventory based on batch creation
//     await prisma.inventory.upsert({
//         where: { variant_id: variantId },
//         update: { quantity: { increment: quantity } },
//         create: { variant_id: variantId, quantity },
//     });
//
//     return newBatch;
// }),
//
// // Update inventory for a variant
//     updateInventory: publicProcedure.input(inventorySchema).mutation(async ({ input }) => {
//     const { variantId, quantity } = input;
//
//     const inventory = await prisma.inventory.findUnique({
//         where: { variant_id: variantId },
//     });
//
//     if (!inventory) {
//         throw new Error("Inventory not found for the given variant ID.");
//     }
//
//     const updatedInventory = await prisma.inventory.update({
//         where: { variant_id: variantId },
//         data: { quantity },
//     });
//
//     return updatedInventory;
// }),
