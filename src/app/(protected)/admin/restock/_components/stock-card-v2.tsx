import { ArrowDownRight, ArrowLeft, CornerDownRight, Plus, X } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import Conversion from './conversion'
import ViewConversion from './view-conversion'
import { ScrollArea } from '~/components/ui/scroll-area'

const StockCardV2 = () => {
	return (
		<div className='bg-slate-100 p-4 rounded-lg'>
			<div className='flex justify-between items-center'>
				<p className='text-slate-700'>
					Item - Brand - Variant
				</p>
				<Button className="flex h-10 w-10 items-center justify-center !p-1 bg-slate-100 hover:!bg-slate-100">
					<X
						className="!h-5 !w-5 text-slate-400"
						strokeWidth={2.5}
					/>
				</Button>
			</div>
			<div className='mt-4'>
				<div className="flex gap-4">
					<div className="w-1/2 flex flex-col gap-1">
						<Label className="text-sm text-slate-400">Main Unit</Label>
						<div className="relative">
							<Input className="bg-white shadow-none text-slate-700" placeholder='Unit' />
							<div className="absolute right-2 top-1/2 -translate-y-1/2">
								<DropdownMenu>
									<DropdownMenuTrigger className="rounded-full p-1 cursor-pointer border-2 border-dashed border-slate-400">
										<Plus className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48 shadow-none mt-2">
										<DropdownMenuLabel className='text-slate-700'>Preset Conversions</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<ViewConversion />
										<ViewConversion />
										<ViewConversion />
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
					<Separator orientation="vertical" className="h-auto w-px bg-slate-300" />
					<div className="w-1/2 flex flex-col gap-2">
						<div className="flex gap-2 items-end">
							<div className="flex flex-col gap-1">
								<Label className="text-sm text-slate-400">Stock</Label>
								<Input className="bg-white text-slate-700 shadow-none" placeholder='Stock' />
							</div>
							<div className="flex flex-col gap-1">
								<Label className="text-sm text-slate-400">Unit Price</Label>
								<Input className="bg-white text-slate-700 shadow-none" placeholder='Price' />
							</div>
							<div className="flex h-10 w-12 items-center justify-center !p-1">
								<TooltipProvider>
									<Tooltip delayDuration={300}>
										<TooltipTrigger asChild>
											<ArrowLeft
												className="!h-5 !w-5 text-slate-400"
												strokeWidth={2.5}
											/>
										</TooltipTrigger>
										<TooltipContent className="my-4 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-none">
											This is your main unit.
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Separator className='mt-4 h-px bg-slate-300' />

			<ScrollArea className='h-40'>
				<div className="px-1 pb-1">
					<Conversion />
					<Conversion />
				</div>
			</ScrollArea>

			<Button className='bg-slate-200/70 p-2 rounded-lg border-[3px] border-dashed border-slate-300 w-full hover:bg-slate-200 cursor-pointer mt-4'>
				<p className='text-slate-500 text-sm text-center'>
					+ Add a conversion
				</p>
			</Button>

		</div>
	)
}

export default StockCardV2