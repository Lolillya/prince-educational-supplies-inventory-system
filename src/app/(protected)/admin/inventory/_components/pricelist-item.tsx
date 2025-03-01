import { X } from 'lucide-react'
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import type { RouterOutputs } from '~/trpc/shared'

interface PriceListItemProps {
	item: RouterOutputs['inventory']['listInventory'][0]
	onRemove: () => void
}

const PriceListItem = ({ item, onRemove }: PriceListItemProps) => {
	return (
		<div className='p-4 rounded-lg bg-slate-100'>
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<p className='text-slate-700 font-medium'>
						{item.variant.item.name} - {item.variant.item.brand.name}
						{item.variant.name && ` - ${item.variant.name}`}
					</p>
					<div className='flex items-center gap-6'>
						<Select>
							<SelectTrigger className='p-0 w-[70px] border-none h-auto bg-transparent text-slate-500'>
								<SelectValue placeholder='Batch' />
							</SelectTrigger>
							<SelectContent className='shadow-none'>
								<SelectItem value='1'>Batch 1</SelectItem>
								<SelectItem value='2'>Batch 2</SelectItem>
								<SelectItem value='3'>Batch 3</SelectItem>
								<SelectItem value='0'>N/A</SelectItem>
							</SelectContent>
						</Select>
						<Select>
							<SelectTrigger className='p-0 w-[70px] border-none h-auto bg-transparent text-slate-500'>
								<SelectValue placeholder='Unit' />
							</SelectTrigger>
							<SelectContent className='shadow-none'>
								<SelectItem value='1'>Boxes</SelectItem>
								<SelectItem value='2'>Pieces</SelectItem>
								<SelectItem value='3'>Pallets</SelectItem>
								<SelectItem value='0'>N/A</SelectItem>
							</SelectContent>
						</Select>
						<div className="flex items-center gap-2">
							<span className='text-slate-400 text-sm'>₱</span>
							<Input
								className='w-20 p-0 h-auto shadow-none bg-transparent text-slate-500 rounded-none'
								value='0.00'
							/>
						</div>
					</div>
				</div>
				<X
					className='w-5 h-5 cursor-pointer text-slate-400 hover:text-slate-600'
					onClick={onRemove}
				/>
			</div>
		</div>
	)
}

export default PriceListItem