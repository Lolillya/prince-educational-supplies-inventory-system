import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '~/components/ui/separator'
import RestockDialog from './restock-dialog'
import InvoiceDialog from './invoice-dialog';

interface EmployeeActivityProps {
	restockId: number;
	date: string;
	employee: string;
	addedStock: number;
	restockData?: any;
}

const EmployeeActivity = () => {

	return (
		<div className='p-5 bg-white/60 rounded-lg text-slate-400'>
			<div className='flex items-center justify-between'>
				<Link href={''}>
					<div className="flex gap-1">
						<div className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500'>
							Restock
							<ArrowUpRight className='w-4 h-4' />
						</div>
						<div className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500'>
							Invoice
							<ArrowUpRight className='w-4 h-4' />
						</div>
					</div>
				</Link>
				<p className='text-slate-400 text-sm pr-5'>
					5 of 320
				</p>
			</div>
			<div className='mt-2'>
				<div className="flex flex-col gap-1">
					<RestockDialog />
					<InvoiceDialog />
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