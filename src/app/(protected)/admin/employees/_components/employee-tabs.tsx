import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Separator } from '~/components/ui/separator'

interface EmployeeTabsProps {
	selectedTab: "restock" | "invoice";
	setSelectedTab: (tab: "restock" | "invoice") => void;
}

const EmployeeTabs = ({ selectedTab, setSelectedTab } : EmployeeTabsProps) => {
	return (
		<div className="flex gap-1 items-center">
			<Link href={''} onClick={() => setSelectedTab("restock")}>
				<div className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500'>
					Restock
					<ArrowUpRight className={`w-4 h-4 ${selectedTab === "restock" ? "block" : "hidden"}`} />
				</div>
			</Link>
			<Separator orientation="vertical" className="w-[2px] h-5" />
			<Link href={''} onClick={() => setSelectedTab("invoice")}>
				<div className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500'>
					Invoice
					<ArrowUpRight className={`w-4 h-4 ${selectedTab === "invoice" ? "block" : "hidden"}`} />
				</div>
			</Link>
		</div>
	)
}

export default EmployeeTabs