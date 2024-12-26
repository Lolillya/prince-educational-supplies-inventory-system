import { Calendar, Users2 } from 'lucide-react'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Separator } from '~/components/ui/separator'
import MoreOptions from '../../_components/more-options'
import InvoiceItem from './invoice-item'
import ViewFullInvoice from './view-full-invoice'

interface InvoiceProps {
	invoiceId: number;
	date: string;
	customer: string;
	grandTotal: number;
	discountValue: string;
	orderItems: {
		variant: string;
		item: string;
		brand: string;
		quantity: number;
		unit: string;
		unitPrice: number;
		discountValue: string;
		subtotal: number;
	}[];
}

const InvoiceRecord: React.FC<InvoiceProps> = ({
	invoiceId,
	date,
	customer,
	grandTotal,
	orderItems,
	discountValue,
}) => {
	return (
		<div className='bg-slate-100 p-10 rounded-lg text-slate-700 flex flex-col gap-8'>

			<div className='flex justify-center items-center px-6'>

				<div className='w-1/2 flex flex-col gap-4'>
					<p className='text-xl'>#{invoiceId}</p>
					<div className='text-slate-400 flex gap-6 items-center'>
						<div className='flex items-center gap-3 text-slate-400'>
							<Calendar className='w-4 h-4' />
							<p className='text-sm'>{date}</p>
						</div>
						<Separator orientation='vertical' className=' h-6 w-[2px] bg-slate-200' />
						<div className='flex items-center gap-3'>
							<Users2 className='w-4 h-4' />
							<p className='text-sm'>{customer}</p>
						</div>
					</div>
				</div>

				<Separator orientation='vertical' className='h-16 w-[2px] bg-slate-200 rounded-lg' />

				<div className='w-1/2 flex items-center justify-between pl-8'>
					<div className='flex flex-col gap-4'>
						<p className='text-xl'>₱ {grandTotal.toLocaleString()}</p>
						<div className='text-slate-400 flex gap-8 items-center'>
							<div className='flex items-center gap-3 text-slate-400'>
								<p className='text-sm'>Grand Total</p>
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
								<DropdownMenuItem className='hover:!bg-slate-200 focus:!bg-slate-200'>View Invoice</DropdownMenuItem>
								<DropdownMenuItem className='hover:!bg-slate-200 focus:!bg-slate-200'>View Customer</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className='hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red text-red'>Void</DropdownMenuItem>
								<DropdownMenuItem className='hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red text-red'>Delete</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

			</div>

			<div className='flex flex-col gap-3'>

				{orderItems.slice(0, 2).map((item, index) => {
					return (
						<InvoiceItem
							key={index}
							variant={item.variant}
							item={item.item}
							brand={item.brand}
							quantity={item.quantity}
							unit={item.unit}
							unitPrice={item.unitPrice}
							discountValue={item.discountValue}
							subtotal={item.subtotal} />
					)
				})}

				<div className='bg-white/70 px-6 py-3 rounded-lg flex items-center justify-between text-slate-400'>
					{orderItems.length > 2 ? (
						<p>{orderItems.length - 2} more item{orderItems.length - 2 > 1 ? "s" : ""}...</p>
					) : orderItems.length <= 2 && (
						<p>No more items...</p>
					)}
					<ViewFullInvoice invoiceId={invoiceId} date={date} customer={customer} grandTotal={grandTotal} discountValue={discountValue} />
				</div>
			</div>

		</div>
	)
}

export default InvoiceRecord