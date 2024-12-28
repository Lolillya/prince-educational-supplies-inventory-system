import { Box } from 'lucide-react';
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { Separator } from '~/components/ui/separator';
import MoreOptions from '../../_components/more-options';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/components/ui/hover-card';
import UnitLine from './unit-line';
import { RestockProps } from '../page';

type restockItem = RestockProps["restockItem"][0];

type restockItemProps = {
	restockItem: restockItem;
}

const RestockItem: React.FC<restockItemProps> = ({
	restockItem
}) => {

	const {
		variant,
		item,
		brand,
		quantity,
		mainUnit,
		unitConversion,
	} = restockItem;

	return (
		<div className='bg-white/70 p-6 rounded-lg'>
			<div className='flex justify-center items-center'>

				<div className='w-1/2 flex flex-col gap-4'>
					<p>
						{brand} - {item} - {variant}
					</p>
					<div className='text-slate-400 flex gap-5 items-center'>
						<div className='flex items-center gap-3 text-slate-400'>
							<Box className='w-4 h-4' />
							<p className='text-sm'>{mainUnit}</p>
						</div>

						<Separator orientation='vertical' className=' h-4 w-[1px] bg-slate-200' />

						<HoverCard>
							<HoverCardTrigger className='hover:underline text-sm'>
								{unitConversion.length} Conversions
							</HoverCardTrigger>
							<HoverCardContent className='shadow-none flex flex-col gap-3'>
								{unitConversion.map((unit, index) => (
									<UnitLine key={index} from={unit.from} count={unit.count} to={unit.to} />
								))}
							</HoverCardContent>
						</HoverCard>
					</div>
				</div>

				<Separator orientation='vertical' className='h-16 w-[2px] bg-slate-200 rounded-lg' />

				<div className='w-1/2 flex items-center justify-between pl-8'>
					<div className='flex flex-col gap-4'>
						<p>{quantity.toLocaleString()}</p>
						<div className='text-slate-400 flex gap-8 items-center'>
							<div className='flex items-center gap-3 text-slate-400'>
								<p className='text-sm'>Added Items</p>
							</div>
						</div>
					</div>
					<div>
						<DropdownMenu>
							<DropdownMenuTrigger>
								<MoreOptions />
							</DropdownMenuTrigger>
							<DropdownMenuContent className='shadow-none text-slate-700'>
								<DropdownMenuItem className='hover:!bg-slate-200 focus:!bg-slate-200'>View item</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className='hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red text-red'>Void</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

			</div>
		</div>
	)
}

export default RestockItem