import dynamic from "next/dynamic";
import { type ComponentType } from "react";

interface CategoryPieCardProps {
  pieChartData: { category: string; sales: number; fill: string }[];
  pieChartConfig: Record<string, { label: string; color: string }>;
  totalSales: number;
}

// Explicitly type the dynamic imports with CategoryPieCardProps
const CategoryPie = dynamic<CategoryPieCardProps>(
  () => import("./category-pie").then((mod) => mod.CategoryPie as ComponentType<CategoryPieCardProps>),
  { ssr: false }
);

const PieContainer: React.FC<CategoryPieCardProps> = ({ pieChartData, pieChartConfig, totalSales }) => {
  return <CategoryPie pieChartData={pieChartData} pieChartConfig={pieChartConfig} totalSales={totalSales} />;
};

export default PieContainer;
