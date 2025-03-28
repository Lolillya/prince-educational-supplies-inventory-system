import { TrendingUp } from "lucide-react";
import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

interface SalesAreaCardProps {
  areaChartData: { month: string; sales: number }[];
  areaChartConfig: Record<string, { label: string; color: string }>;
}

const SalesAreaCard: React.FC<SalesAreaCardProps> = ({
  areaChartData,
  areaChartConfig,
}) => {
  return (
    <div className="flex h-full w-full gap-3 rounded-lg bg-slate-100 p-6">
      <div className="flex w-fit flex-col items-start justify-end gap-1">
        <p className="text-slate-500">Sales over</p>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-slate-700" strokeWidth={2.5} />
          <p className="text-2xl font-bold text-slate-700">Time</p>
        </div>
      </div>
      <div className="flex w-full">
        <ChartContainer config={areaChartConfig} className="h-full w-full">
          <AreaChart
            accessibilityLayer
            data={areaChartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="sales"
              type="natural"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default SalesAreaCard;
