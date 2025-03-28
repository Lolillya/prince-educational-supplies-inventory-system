import { createTRPCRouter, publicProcedure } from "../../trpc";

export const GetMonthlySales = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const monthlySales = await ctx.db.invoice.groupBy({
      by: ["created_at"],
      _sum: { total_amount: true },
      orderBy: { created_at: "asc" },
    });

    const formattedSales = monthlySales.reduce(
      (acc, sale) => {
        const date = new Date(sale.created_at);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;

        if (!acc[monthYear]) {
          acc[monthYear] = 0;
        }
        acc[monthYear] += sale._sum.total_amount || 0;

        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(formattedSales).map(([month, total]) => ({
      month,
      total_sales: total,
    }));
  }),
});
