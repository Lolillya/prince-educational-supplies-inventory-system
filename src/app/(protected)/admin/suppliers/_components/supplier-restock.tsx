import { TooltipContent } from '@radix-ui/react-tooltip'
import { ArrowUpRight, Box, Calendar, IdCard } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

const SupplierRestock = () => {
	return (
		<div className='p-5 bg-white/60 rounded-lg text-slate-400'>
			<div className='flex items-center justify-between'>
				<Link href={''}>
					<div className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500'>
						Restocks
						<ArrowUpRight className='w-4 h-4' />
					</div>
				</Link>
				<p className='text-slate-400 text-sm pr-5'>
					5 of 320
				</p>
			</div>
			<div className='mt-2'>
				<div className="flex flex-col gap-1">
					<SupplierRestockCard />
					<Separator orientation="horizontal" className="h-[1px]" />
					<SupplierRestockCard />
					<Separator orientation="horizontal" className="h-[1px]" />
					<SupplierRestockCard />
					<Separator orientation="horizontal" className="h-[1px]" />
					<SupplierRestockCard />
					<Separator orientation="horizontal" className="h-[1px]" />
					<SupplierRestockCard />
					<Separator orientation="horizontal" className="h-[1px]" />
				</div>
			</div>
			<div className='mt-4'>
				<p className='text-center hover:underline cursor-pointer'>Show more</p>
			</div>
		</div>
	)
}

const SupplierRestockCard = () => {
	return (
		<div className='p-5 flex flex-col gap-4 hover:bg-slate-200/50 rounded-lg cursor-pointer transition-all duration-300'>
			<p className='text-slate-600'>#1234567</p>
			<div className="flex items-center gap-3 flex-grow overflow-hidden">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<IdCard className="h-4 w-4" />
						</TooltipTrigger>
						<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
							Recorded by Stacey Andrew Moralidad Gonzaga
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<p className="text-sm truncate">Stacey Andrew Moralidad Gonzaga</p>
			</div>
			<div className="flex items-center gap-4 text-slate-400">
				<div className="flex items-center gap-3 text-slate-400">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Calendar className="h-4 w-4" />
							</TooltipTrigger>
							<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
								Recorded 2025-01-13
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<p className="text-sm">2025-01-13</p>
				</div>
				<Separator
					orientation="vertical"
					className="h-6 w-[2px] bg-slate-200"
				/>
				<div className="flex items-center gap-3">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Box className="h-4 w-4" />
							</TooltipTrigger>
							<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
								300 total added stock
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<p className="text-sm">300</p>
				</div>
			</div>
		</div>
	)
}

export default SupplierRestock