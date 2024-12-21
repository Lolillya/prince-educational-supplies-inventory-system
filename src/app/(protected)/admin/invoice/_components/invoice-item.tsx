import { Banknote, Box, SquarePercent } from 'lucide-react'
import { Separator } from '~/components/ui/separator'
import MoreOptions from './more-options'

interface OrderItemsProps {
	variant: string;
	item: string;
	brand: string;
	quantity: number;
	unit: string;
	unitPrice: number;
	discountValue: string;
	subtotal: number;
}

const InvoiceItem: React.FC<OrderItemsProps> = ({
	variant,
	item,
	brand,
	quantity,
	unit,
	unitPrice,
	discountValue,
	subtotal,
}) => {
	return (
		<div className='bg-white p-6 rounded-lg'>
			<div className='flex justify-center items-center'>

				<div className='w-1/2 flex flex-col gap-4'>
					<p>
						{brand} - {item} - {variant}
					</p>
					<div className='text-slate-400 flex gap-5 items-center'>
						<div className='flex items-center gap-3 text-slate-400'>
							<Box className='w-4 h-4' />
							<p className='text-sm'>{quantity} {unit}</p>
						</div>
						<Separator orientation='vertical' className=' h-4 w-[1px] bg-slate-200' />
							<p className='text-sm'>₱ {unitPrice.toLocaleString()}</p>
						<Separator orientation='vertical' className=' h-4 w-[1px] bg-slate-200' />
							<p className='text-sm'>{discountValue} discount</p>
					</div>
				</div>

				<Separator orientation='vertical' className='h-16 w-[2px] bg-slate-200 rounded-lg' />

				<div className='w-1/2 flex items-center justify-between pl-8'>
					<div className='flex flex-col gap-4'>
						<p>₱ {subtotal.toLocaleString()}</p>
						<div className='text-slate-400 flex gap-8 items-center'>
							<div className='flex items-center gap-3 text-slate-400'>
								<p className='text-sm'>Subtotal</p>
							</div>
						</div>
					</div>
					<div>
						<MoreOptions />
					</div>
				</div>

			</div>
		</div>
	)
}

export default InvoiceItem