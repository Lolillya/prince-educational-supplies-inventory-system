"use client";

import { ArrowUpRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { CategoryPieCard } from "../_components/category-pie";
import { CalendarDateRangePicker } from "../_components/date-range-picker";
import Notifications from "../_components/notifications";
import Ranking from "../_components/ranking";
import SalesAreaCard from "../_components/sales-area";
import { CustomerStatus, StockInStatus, StockOutStatus, SupplierStatus } from "../_components/status-card";

// PIE CHART DATA
interface PieChartData {
	category: string;
	sales: number;
	fill: string;
};

interface PieChartConfig {
	[key: string]: {
		label: string;
		color: string;
	};
};

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
};

interface AreaChartConfig {
	[key: string]: {
		label: string;
		color: string;
	};
};

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

const AdminDashboard = () => {

	const session = useSession();

	return (

		<section className="flex flex-col min-h-screen py-10 px-20">

			<div className="flex justify-between items-center">
				<h2 className="font-bold text-3xl text-slate-700">
					Hello, {session.data?.user.firstName}!
				</h2>
				<div className="flex gap-4 items-center">
					<Notifications />
					<Separator orientation="vertical" className="h-10 bg-slate-200 w-[2px]" />
					<CalendarDateRangePicker />
					<Button className="bg-green hover:bg-green/80">
						Export Report
						<ArrowUpRight strokeWidth={2.5} />
					</Button>
				</div>
			</div>

			<Separator orientation="horizontal" className="mt-4 h-[2px]" />

			<div className="flex justify-between items-center gap-4 mt-4">
				<StockInStatus percentage={0} count={1234} />
				<StockOutStatus percentage={24} count={4567} />
				<CustomerStatus count={324} />
				<SupplierStatus count={463} />
			</div>

			<div className="mt-4 flex items-center justify-between gap-4 w-full h-full">
				<div className="flex flex-col gap-4 w-1/2 h-full">
					<CategoryPieCard pieChartData={pieChartData} pieChartConfig={pieChartConfig} totalSales={1110} />
					<SalesAreaCard areaChartData={areaChartData} areaChartConfig={areaChartConfig} />
				</div>
				<div className="w-1/2 h-full">
					<Ranking />
				</div>
			</div>

		</section>
	);
};

export default AdminDashboard;
