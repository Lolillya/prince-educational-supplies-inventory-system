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
}

const EmployeeActivity = () => {
	const [selectedTab, setSelectedTab] = useState<"restock" | "invoice">("restock");

	return (
		<div className='p-5 bg-white/60 rounded-lg text-slate-400'>
			<div className='flex items-center justify-between'>
				<EmployeeTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
				<p className='text-slate-400 text-sm pr-5'>
					5 of 320
				</p>
			</div>
			<div className='mt-2'>
				<div className="flex flex-col gap-1">
					{selectedTab === "restock" ? (
						<>
							<RestockDialog />
							<RestockDialog />
							<RestockDialog />
							<RestockDialog />
							<RestockDialog />
						</>
					) : (
						<>
							<InvoiceDialog />
							<InvoiceDialog />
							<InvoiceDialog />
							<InvoiceDialog />
							<InvoiceDialog />
						</>
					)}
					<Separator orientation="horizontal" className="h-[1px]" />
				</div>
			</div>
			<div className='mt-4'>
				<p className='text-center hover:underline cursor-pointer'>Show more</p>
			</div>
		</div>
	)
}

export default EmployeeActivity