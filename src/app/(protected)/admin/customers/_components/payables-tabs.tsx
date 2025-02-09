import React from "react";
import { Button } from "~/components/ui/button";

interface PayablesTabsProps {
	selectedTab: "payables" | "payments";
	setSelectedTab: (tab: "payables" | "payments") => void;
}

const PayablesTabs: React.FC<PayablesTabsProps> = ({ selectedTab, setSelectedTab }) => {
	return (
		<div className="flex items-center justify-center gap-2 bg-slate-100 p-2 w-fit rounded-lg">
			<div className="flex items-center gap-2">
				<Button
					onClick={() => setSelectedTab("payables")}
					className={`h-9 px-2 text-slate-700 ${selectedTab === "payables" ? "bg-white hover:bg-white" : "bg-slate-100 hover:bg-white"}`}
				>
					Payables
				</Button>
				<Button
					onClick={() => setSelectedTab("payments")}
					className={`h-9 px-2 text-slate-700 ${selectedTab === "payments" ? "bg-white hover:bg-white" : "bg-slate-100 hover:bg-white"}`}
				>
					Payments
				</Button>
			</div>
		</div>
	);
};

export default PayablesTabs;
