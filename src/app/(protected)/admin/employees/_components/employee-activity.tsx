import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '~/components/ui/separator'
import RestockDialog from './restock-dialog'
import InvoiceDialog from './invoice-dialog';
import EmployeeTabs from './employee-tabs';
import { useState } from 'react';

interface EmployeeActivityProps {
	restockId: number;
	date: string;
	employee: string;
	addedStock: number;
	restockData?: any;
	activityData?: {
		restocks: any[];
		invoices: any[];
	};
	clerkId: string;
}

const EmployeeActivity = ({ activityData, clerkId }: EmployeeActivityProps) => {
	const [showAll, setShowAll] = useState(false);
	const [selectedTab, setSelectedTab] = useState<"restock" | "invoice">("restock");

	const currentData = selectedTab === "restock"
		? activityData?.restocks ?? []
		: activityData?.invoices ?? [];

	const displayedData = showAll ? currentData : currentData.slice(0, 3);
	const totalCount = currentData.length;
	const shownCount = displayedData.length;

	return (
		<div className='p-5 bg-white/60 rounded-lg text-slate-400'>
			<div className='flex items-center justify-between'>
				<EmployeeTabs
					selectedTab={selectedTab}
					setSelectedTab={setSelectedTab}
					clerkId={clerkId}
				/>
				{totalCount > 0 && (
					<p className='text-slate-400 text-sm pr-5'>
						{shownCount} of {totalCount}
					</p>
				)}
			</div>
			<div className='mt-2'>
				<div className="flex flex-col gap-1">
					{displayedData.map((activity) => (
						selectedTab === "restock" ? (
							<RestockDialog
								key={activity.batch_id}
								activity={activity}
								context="employee"
							/>
						) : (
							<InvoiceDialog
								key={activity.invoice_id}
								activity={activity}
								invoice={activity.invoice}
								id={activity.invoice_id}
								context="employee"
							/>
						)
					))}
					{totalCount === 0 && (
						<p className="text-center py-4 text-slate-400">No activity found</p>
					)}
					<Separator orientation="horizontal" className="h-[1px]" />
				</div>
			</div>
			{totalCount > 3 && (
				<div className='mt-4'>
					<p
						className='text-center hover:underline cursor-pointer'
						onClick={() => setShowAll(!showAll)}
					>
						{showAll ? 'Show less' : 'Show more'}
					</p>
				</div>
			)}
		</div>
	)
}

export default EmployeeActivity