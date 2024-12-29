// import { z } from "zod";
// import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// import { db } from "~/server/db";
// export const inventoryDataRouter = createTRPCRouter({
//     listAllData: publicProcedure.query(async () => {
//         try {
//             const [brands, categories, units, items] = await Promise.all([
//                 db.brand.findMany(),
//                 db.category.findMany(),
//                 db.unit.findMany(),
//                 db.item.findMany({ include: { variants: true } }),
//             ]);
//
//             const variants = items.flatMap((item) =>
//                 item.variants.map((variant) => ({
//                     variant_id: variant.variant_id,
//                     name: variant.name,
//                     item_id: item.item_id,
//                     description: item.description,
//                 })),
//             );
//
//             return { brands, categories, units, items, variants };
//         } catch (error) {
//             console.error("Error listing all data:", error);
//             throw new Error("Failed to retrieve data.");
//         }
//     }),
//
//     createBrand: publicProcedure
//         .input(z.object({ name: z.string() }))
//         .mutation(async ({ input }) => {
//             const { name } = input;
//             const existingBrand = await db.brand.findUnique({ where: { name } });
//             if (existingBrand) {
//                 return existingBrand; // Return existing brand if found
//             }
//             const brand = await db.brand.create({
//                 data: { name },
//             });
//             return brand; // Make sure the created brand object is returned
//         }),
//
//     createCategory: publicProcedure
//         .input(z.object({ name: z.string() }))
//         .mutation(async ({ input }) => {
//             const { name } = input;
//             const existingCategory = await db.category.findUnique({ where: { name } });
//             if (existingCategory) {
//                 return existingCategory; // Return existing category if found
//             }
//             const category = await db.category.create({
//                 data: { name },
//             });
//             return category; // Return the created category object
//         }),
//
//     createItem: publicProcedure
//         .input(z.object({
//             name: z.string(),
//             description: z.string().optional(),
//             brandId: z.number(),
//             categoryId: z.number(),
//         }))
//         .mutation(async ({ input }) => {
//             const { name, description, brandId, categoryId } = input;
//
//             const item = await db.item.create({
//                 data: {
//                     name,
//                     description,
//                     brandId,
//                     categoryId,
//                 },
//             });
//
//             return item;
//         }),
//
//     createVariant: publicProcedure
//         .input(z.object({
//             name: z.string(),
//             itemId: z.number(),
//             description: z.string().optional(),
//         }))
//         .mutation(async ({ input }) => {
//             const { name, itemId, description } = input;
//
//             const variant = await db.variant.create({
//                 data: {
//                     name,
//                     itemId,
//                     description,
//                 },
//             });
//
//             return variant;
//         }),
//
//     createInventory: publicProcedure
//         .input(z.object({
//             variantId: z.number(),
//             quantity: z.number().min(0),
//         }))
//         .mutation(async ({ input }) => {
//             const { variantId, quantity } = input;
//
//             const existingInventory = await db.inventory.findUnique({
//                 where: { variant_id: variantId },
//             });
//
//             if (existingInventory) {
//                 const updatedInventory = await db.inventory.update({
//                     where: { variant_id: variantId },
//                     data: {
//                         quantity: existingInventory.quantity + quantity,
//                         last_updated: new Date(),
//                     },
//                 });
//                 return updatedInventory;
//             }
//
//             const newInventory = await db.inventory.create({
//                 data: {
//                     variant_id: variantId,
//                     quantity,
//                 },
//             });
//
//             return newInventory;
//         }),
// });
