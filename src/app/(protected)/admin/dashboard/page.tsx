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
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

// ALL OF THE DATA HERE ARE CONSTANTS. KULANG LANG QUERY KAY DI KO KABALO :(
// PIE CHART DATA
interface PieChartData {
  category: string;
  sales: number;
  fill: string;
}

type PieChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

// AREA CHART DATA
interface AreaChartData {
  month: string;
  sales: number;
}

type AreaChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

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

  const { data: totalStockedIn } = api.getStockedIn.get.useQuery();
  const { data: totalStockedOut } = api.getStockedOut.get.useQuery();
  const { data: customers } = api.getAllCustomers.get.useQuery();
  const { data: suppleirs } = api.getAllSuppliers.get.useQuery();
  const { data: categoryList } = api.getCategoryList.get.useQuery();
  const { data: monthlySales } = api.getMonthlySales.get.useQuery();

  console.log(monthlySales);

  const pieChartData: PieChartData[] =
    categoryList?.map((x, index) => ({
      category: x.category_name,
      sales: x.total_quantity,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    })) || [];

  const pieChartConfig: PieChartConfig = pieChartData.reduce((config, item) => {
    config[item.category] = {
      label: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      color: item.fill,
    };
    return config;
  }, {} as PieChartConfig);

  const [areaChartData, setAreaChartData] = useState<AreaChartData[]>([]);

  useEffect(() => {
    if (!monthlySales) return;

    setAreaChartData([
      {
        month: "January",
        sales:
          monthlySales.find((data) => data.month === "2025-01")?.total_sales ??
          0,
      },
      {
        month: "February",
        sales:
          monthlySales.find((data) => data.month === "2025-02")?.total_sales ??
          0,
      },
      {
        month: "March",
        sales:
          monthlySales.find((data) => data.month === "2025-03")?.total_sales ??
          0,
      },
      {
        month: "April",
        sales:
          monthlySales.find((data) => data.month === "2025-04")?.total_sales ??
          0,
      },
      {
        month: "May",
        sales:
          monthlySales.find((data) => data.month === "2025-05")?.total_sales ??
          0,
      },
      {
        month: "June",
        sales:
          monthlySales.find((data) => data.month === "2025-06")?.total_sales ??
          0,
      },
      {
        month: "July",
        sales:
          monthlySales.find((data) => data.month === "2025-07")?.total_sales ??
          0,
      },
    ]);
  }, [monthlySales]);

  const areaChartConfig: AreaChartConfig = {
    mobile: {
      label: "Sales",
      color: "hsl(var(--chart-2))",
    },
  };

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
        <StockInStatus percentage={-10} count={totalStockedIn ?? 0} />
        <StockOutStatus percentage={24} count={totalStockedOut ?? 0} />
        <CustomerStatus count={customers ?? 0} />
        <SupplierStatus count={suppleirs ?? 0} />
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
