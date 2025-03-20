import { ArrowRight, CornerDownRight } from 'lucide-react'
import React from 'react'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/components/ui/hover-card'

const ViewConversion = () => {
	return (
		<HoverCard openDelay={0} closeDelay={0}>
			<HoverCardTrigger asChild>
				<DropdownMenuItem className='hover:!bg-slate-200 focus:!bg-slate-200'>
					<span className="w-full">2 Conversions</span>
				</DropdownMenuItem>
			</HoverCardTrigger>
			<HoverCardContent className="w-64 ml-2 p-2 bg-white rounded-md border border-slate-200 shadow-none" side="right" align="center">
				<div className="flex flex-col gap-1">
					<div className='flex justify-between items-end w-full'>
						<p className='text-slate-500 text-sm'>Boxes <span className='ml-2 text-slate-400 text-sm'>main</span></p>
						<p className='text-slate-500 text-sm'>₱500.00</p>
					</div>
					<div className='flex justify-between items-end w-full'>
						<div className="flex items-center gap-2">
							<CornerDownRight className='h-3 w-3 text-slate-400' strokeWidth={2.5} />
							<p className='text-slate-500 text-sm'>10 Cases</p>
						</div>
						<p className='text-slate-500 text-sm'>₱50.00</p>
					</div>
					<div className='flex justify-between items-end w-full'>
						<div className="flex items-center gap-2">
							<CornerDownRight className='h-3 w-3 text-slate-400' strokeWidth={2.5} />
							<p className='text-slate-500 text-sm'>10 Pieces</p>
						</div>
						<p className='text-slate-500 text-sm'>₱5.00</p>
					</div>
				</div>
			</HoverCardContent>
		</HoverCard>
	)
}

export default ViewConversion