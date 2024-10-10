import { ComponentType } from "react";
import dynamic from "next/dynamic";

// Explicitly type the dynamic imports
const PieChartLeft = dynamic<{}>(
  () =>
    import("~/components/dashboard-Left-Piechart").then(
      (mod) => mod.default as ComponentType<{}>,
    ),
  { ssr: false },
);
const PieChartRight = dynamic<{}>(
  () =>
    import("~/components/dashboard-Right_Piechart").then(
      (mod) => mod.default as ComponentType<{}>,
    ),
  { ssr: false },
);

export default function ChartsContainer() {
  return (
    <div className="flex w-full items-center gap-3">
      <PieChartLeft />
      <PieChartRight />
    </div>
  );
}
