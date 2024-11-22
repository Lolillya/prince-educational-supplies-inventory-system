"use client";

import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Label } from "~/components/ui/label";

export const description = "A donut chart";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

const PieChartRight = () => {
  return (
    <Card className="m-0 flex h-full w-full items-center justify-between">
      <CardHeader className="w-full items-start gap-5">
        <CardTitle>Top Customers</CardTitle>
        <CardDescription className="flex w-full flex-col gap-1">
          <div className="flex w-full justify-between rounded-full bg-gray-100 p-2 text-black">
            <div className="flex flex-row items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-red-600"></div>
              <Label>Supplier 1</Label>
            </div>
            <Label>00%</Label>
          </div>

          <div className="flex w-full justify-between rounded-full bg-gray-100 p-2 text-black">
            <div className="flex flex-row items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-red-600"></div>
              <Label>Supplier 1</Label>
            </div>
            <Label>00%</Label>
          </div>

          <div className="flex w-full justify-between rounded-full bg-gray-100 p-2 text-black">
            <div className="flex flex-row items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-red-600"></div>
              <Label>Supplier 1</Label>
            </div>
            <Label>00%</Label>
          </div>

          <div className="flex w-full justify-between rounded-full bg-gray-100 p-2 text-black">
            <div className="flex flex-row items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-red-600"></div>
              <Label>Others</Label>
            </div>
            <Label>00%</Label>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="m-0 h-full w-full max-w-[250px] p-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-square h-full w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PieChartRight;
