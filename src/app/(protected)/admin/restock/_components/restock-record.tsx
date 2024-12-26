import { ArrowRight, Calendar, Truck } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Separator } from '~/components/ui/separator'
import MoreOptions from '../../_components/more-options'
import RestockItem from './restock-item'
import ViewFullRestock from './view-full-restock'

interface RestockProps {
	restockId: number;
	date: string;
	supplier: string;
	addedStock: number;
	restockItems: {
		variant: string;
		item: string;
		brand: string;
		quantity: number;
		mainUnit: string;
		unitConversion: {
			from: string;
			count: number;
			to: string;
		}[];
	}[];
}

const RestockRecord: React.FC<RestockProps> = ({
	restockId,
	date,
	supplier,
	addedStock,
	restockItems,
}) => {
	return (
		<div className='bg-slate-100 p-10 rounded-lg text-slate-700 flex flex-col gap-8'>

			<div className='flex justify-center items-center px-6'>

				<div className='w-1/2 flex flex-col gap-4'>
					<p className='text-xl'>#{restockId}</p>
					<div className='text-slate-400 flex gap-6 items-center'>
						<div className='flex items-center gap-3 text-slate-400'>
							<Calendar className='w-4 h-4' />
							<p className='text-sm'>{date}</p>
						</div>
						<Separator orientation='vertical' className=' h-6 w-[2px] bg-slate-200' />
						<div className='flex items-center gap-3'>
							<Truck className='w-4 h-4' />
							<p className='text-sm'>{supplier}</p>
						</div>
					</div>
				</div>

				<Separator orientation='vertical' className='h-16 w-[2px] bg-slate-200 rounded-lg' />

				<div className='w-1/2 flex items-center justify-between pl-8'>
					<div className='flex flex-col gap-4'>
						<p className='text-xl'>{addedStock.toLocaleString()}</p>
						<div className='text-slate-400 flex gap-8 items-center'>
							<div className='flex items-center gap-3 text-slate-400'>
								<p className='text-sm'>Added Stock</p>
							</div>
						</div>
					</div>
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<MoreOptions />
							</DropdownMenuTrigger>
							<DropdownMenuContent className='shadow-none text-slate-700'>
								<DropdownMenuItem className='hover:!bg-slate-200 focus:!bg-slate-200'>Print</DropdownMenuItem>
								<DropdownMenuItem className='hover:!bg-slate-200 focus:!bg-slate-200'>Export</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className='hover:!bg-slate-200 focus:!bg-slate-200'>View Restock</DropdownMenuItem>
								<DropdownMenuItem className='hover:!bg-slate-200 focus:!bg-slate-200'>View Supplier</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className='hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red text-red'>Void</DropdownMenuItem>
								<DropdownMenuItem className='hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red text-red'>Delete</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

			</div>

			<div className='flex flex-col gap-3'>

				{restockItems.slice(0, 2).map((item, index) => {
					return (
						<RestockItem
							key={index}
							variant={item.variant}
							item={item.item}
							brand={item.brand}
							quantity={item.quantity}
							mainUnit={item.mainUnit}
							unitConversion={item.unitConversion}
						/>
					)
				})}

				<div className='bg-white/70 px-6 py-3 rounded-lg flex items-center justify-between text-slate-400'>
					{restockItems.length > 2 ? (
						<p>{restockItems.length - 2} more item{restockItems.length - 2 > 1 ? "s" : ""}...</p>
					) : restockItems.length <= 2 && (
						<p>No more items...</p>
					)}
					<ViewFullRestock restockId={restockId} date={date} supplier={supplier} addedStock={addedStock} />
				</div>
			</div>

		</div>
	)
}

export default RestockRecord