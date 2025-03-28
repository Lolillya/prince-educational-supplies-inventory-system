import { createTRPCRouter, publicProcedure } from "../../trpc";

interface CategorySales {
  category_id: number;
  category_name: string;
  total_quantity: number;
}

export const GetCategoryList = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.$queryRaw<CategorySales[]>`
      SELECT 
        c.category_id,
        c.name AS category_name,
        SUM(li.quantity) AS total_quantity
      FROM 
        "Line_Item" li
      JOIN "Variant" v ON li.variant_id = v.variant_id
      JOIN "Item" i ON v.item_id = i.item_id
      JOIN "Category" c ON i.category_id = c.category_id
      GROUP BY 
        c.category_id, c.name
      ORDER BY
        total_quantity DESC;
    `;

    return result.map(({ category_id, category_name, total_quantity }) => ({
      category_id,
      category_name,
      total_quantity: Number(total_quantity) || 0,
    }));
  }),
});
