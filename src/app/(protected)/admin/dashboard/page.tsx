"use client";

import { Download } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { CategoryPieCard } from "./_components/category-pie";
import { CalendarDateRangePicker } from "./_components/date-range-picker";
import Notification from "./_components/notifications";
import Ranking from "./_components/ranking";
import SalesAreaCard from "./_components/sales-area";
import {
  CustomerStatus,
  StockInStatus,
  StockOutStatus,
  SupplierStatus,
} from "./_components/status-card";

// ALL OF THE DATA HERE ARE CONSTANTS. KULANG LANG QUERY KAY DI KO KABALO :(
// PIE CHART DATA
interface PieChartData {
  category: string;
  sales: number;
  fill: string;
}

interface PieChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

const pieChartData: PieChartData[] = [
  { category: "Stationery", sales: 275, fill: "hsl(var(--chart-1))" },
  { category: "Computer Items", sales: 200, fill: "hsl(var(--chart-2))" },
  { category: "Office Supplies", sales: 187, fill: "hsl(var(--chart-3))" },
  { category: "Electronics", sales: 173, fill: "hsl(var(--chart-4))" },
  { category: "Furniture", sales: 90, fill: "hsl(var(--chart-5))" },
];

const pieChartConfig: PieChartConfig = pieChartData.reduce((config, item) => {
  config[item.category] = {
    label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    color: item.fill,
  };
  return config;
}, {} as PieChartConfig);

// AREA CHART DATA
interface AreaChartData {
  month: string;
  sales: number;
}

interface AreaChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

const areaChartData: AreaChartData[] = [
  { month: "January", sales: 123 },
  { month: "February", sales: 456 },
  { month: "March", sales: 254 },
  { month: "April", sales: 335 },
  { month: "May", sales: 221 },
  { month: "June", sales: 165 },
  { month: "July", sales: 193 },
];

const areaChartConfig: AreaChartConfig = {
  mobile: {
    label: "Sales",
    color: "hsl(var(--chart-2))",
  },
};

// NOTIFICATION DATA

interface Notifications {
  date: string;
  time: string;
  type: "restocked" | "stocked out" | "edit" | "delete";
  employee: string;
  details: {
    supplier?: string;
    customer?: string;
    recordType?: "inventory" | "suppliers" | "customers" | "other";
    recordName?: string;
  };
}

const notifications: Notifications[] = [
  {
    date: "2024-12-22",
    time: "10:30 AM",
    type: "restocked",
    employee: "John Doe",
    details: {
      supplier: "ABC Supplies",
    },
  },
  {
    date: "2024-12-22",
    time: "11:15 AM",
    type: "stocked out",
    employee: "Jane Smith",
    details: {
      customer: "XYZ Retail",
    },
  },
  {
    date: "2024-12-22",
    time: "1:45 PM",
    type: "edit",
    employee: "John Doe",
    details: {
      recordType: "inventory",
      recordName: "Product ABC",
    },
  },
  {
    date: "2024-12-22",
    time: "2:00 PM",
    type: "delete",
    employee: "Jane Smith",
    details: {
      recordType: "customers",
      recordName: "Customer XYZ",
    },
  },
  {
    date: "2024-12-22",
    time: "2:00 PM",
    type: "delete",
    employee: "Jane Smith",
    details: {
      recordType: "customers",
      recordName: "Customer XYZ",
    },
  },
];

// RANKING DATA

interface Leaderboard {
  rank: number;
  record: string;
  stockCount?: number;
  salesCount?: number;
}

const supplierLeaderboard: Leaderboard[] = [
  { rank: 1, record: "Adrian Huang", stockCount: 800 },
  { rank: 2, record: "Kenji Azriel Mende", stockCount: 700 },
  { rank: 3, record: "Stacey Andrew Gonzaga", stockCount: 750 },
];

const customerLeaderboard: Leaderboard[] = [
  { rank: 1, record: "Joshua Sevilla", salesCount: 5000 },
  { rank: 2, record: "John Doe", salesCount: 4000 },
  { rank: 3, record: "Jerald Dagaang", salesCount: 3000 },
];

const AdminDashboard = () => {
  const session = useSession();
  console.log(session);

  return (
    <section className="flex min-h-screen flex-col px-20 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-700">
          Hello, {session.data?.user.firstName}!
        </h2>
        <div className="flex items-center gap-4">
          <Notification notifications={notifications} />
          <Separator
            orientation="vertical"
            className="h-10 w-[2px] bg-slate-200"
          />
          <CalendarDateRangePicker />
          <Button className="bg-green hover:bg-green/80">
            <Download strokeWidth={2.5} />
            Export Report
          </Button>
        </div>
      </div>

      <Separator orientation="horizontal" className="mt-4 h-[2px]" />

      <div className="mt-4 flex items-center justify-between gap-4">
        <StockInStatus percentage={-10} count={1234} />
        <StockOutStatus percentage={24} count={4567} />
        <CustomerStatus count={324} />
        <SupplierStatus count={463} />
      </div>

      <div className="mt-4 flex h-full w-full items-center justify-between gap-4">
        <div className="flex h-full w-1/2 flex-col gap-4">
          <CategoryPieCard
            pieChartData={pieChartData}
            pieChartConfig={pieChartConfig}
            totalSales={1110}
          />
          <SalesAreaCard
            areaChartData={areaChartData}
            areaChartConfig={areaChartConfig}
          />
        </div>
        <div className="h-full w-1/2">
          <Ranking
            suppliers={supplierLeaderboard}
            customers={customerLeaderboard}
          />
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
