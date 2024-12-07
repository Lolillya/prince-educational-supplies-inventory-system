import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const inventoryDataRouter = createTRPCRouter({
    listAllData: publicProcedure.query(async () => {
        try {
            const [brands, categories, units, items, attributes] = await Promise.all([
                db.brand.findMany(),
                db.category.findMany(),
                db.unit.findMany(),
                db.item.findMany({ include: { variants: true } }),
                db.attribute.findMany({ include: { attributeValues: true } }),
            ]);

            const variants = items.flatMap((item) =>
                item.variants.map((variant) => ({
                    variant_id: variant.variant_id,
                    name: variant.name,
                    item_id: item.item_id,
                })),
            );

            return { brands, categories, units, items, variants, attributes };
        } catch (error) {
            console.error("Error listing all data:", error);
            throw new Error("Failed to retrieve data.");
        }
    }),

    addStatus: publicProcedure
        .input(
            z.object({
                value: z.string().min(1, "Value is required."), // This will be the name of the item
                label: z.string().min(1, "Label is required."), // This will be the name of the brand/category
                context: z.enum(["item", "brand", "category"]),
                brandId: z.number().int().optional(),
                categoryId: z.number().int().optional(),
            }),
        )
        .mutation(async ({ input }) => {
            const { value, label, context, brandId, categoryId } = input;
            try {
                let result;

                console.log(
                    `Adding status with value: ${value}, label: ${label}, context: ${context}`,
                );

                switch (context) {
                    case "item":
                        if (!brandId || !categoryId) {
                            throw new Error(
                                "Brand ID and Category ID must be provided for adding an item.",
                            );
                        }

                        const brandRecord = await db.brand.findUnique({
                            where: { brand_id: brandId },
                        });
                        const categoryRecord = await db.category.findUnique({
                            where: { category_id: categoryId },
                        });

                        if (!brandRecord || !categoryRecord) {
                            throw new Error("Brand or Category does not exist.");
                        }

                        result = await db.item.create({
                            data: {
                                name: value,
                                brand_id: brandRecord.brand_id,
                                category_id: categoryRecord.category_id,
                            },
                        });
                        break;

                    case "brand":
                        // Creating a new brand
                        result = await db.brand.create({
                            data: { name: label }, // Use label as the brand name
                        });
                        break;

                    case "category":
                        // Creating a new category
                        result = await db.category.create({
                            data: { name: label }, // Use label as the category name
                        });
                        break;

                    default:
                        throw new Error("Invalid context specified");
                }

                return result;
            } catch (error) {
                console.error("Error adding status:", error);
                throw new Error(`Failed to add status: ${error.message}`);
            }
        }),

    //
    // saveInventory: publicProcedure
    // //implement function here
    //     }),
});

export default inventoryDataRouter;
