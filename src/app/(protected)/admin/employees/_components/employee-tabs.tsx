import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Separator } from '~/components/ui/separator'
import {useRouter} from "next/navigation";

interface EmployeeTabsProps {
	selectedTab: "restock" | "invoice";
	setSelectedTab: (tab: "restock" | "invoice") => void;
	clerkId: string;
}

const EmployeeTabs = ({ selectedTab, setSelectedTab, clerkId }: EmployeeTabsProps) => {
	const router = useRouter();

	const handleDoubleClick = (type: "restock" | "invoice") => {
		if (type === "restock") {
			router.push(`/admin/restock?clerkId=${clerkId}`);
		} else {
			router.push(`/admin/invoice?clerkId=${clerkId}`);
		}
	};
	return (
		<div className="flex gap-1 items-center">
			<Link href={''} onClick={() => setSelectedTab("restock")}>
				<div
					className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500 cursor-pointer'
					onClick={() => setSelectedTab("restock")}
					onDoubleClick={() => handleDoubleClick("restock")}
				>
					Restock
					<ArrowUpRight className={`w-4 h-4 ${selectedTab === "restock" ? "block" : "hidden"}`} />
				</div>
			</Link>
			<Separator orientation="vertical" className="w-[2px] h-5" />
			<Link href={''} onClick={() => setSelectedTab("invoice")}>
				<div
					className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500 cursor-pointer'
					onClick={() => setSelectedTab("invoice")}
					onDoubleClick={() => handleDoubleClick("invoice")}
				>
					Invoice
					<ArrowUpRight className={`w-4 h-4 ${selectedTab === "invoice" ? "block" : "hidden"}`} />
				</div>
			</Link>
		</div>
	)
}

export default EmployeeTabs