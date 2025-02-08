import { ArrowRight, X } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import OutToOfficeSm from './out-to-office-sm'

interface BatchLineItemProps {
	isEditing: boolean;
}

const BatchLineItem = ({ isEditing }: BatchLineItemProps) => {
	return (
		<div className="flex gap-3 items-center">
			{/* <div className="group flex w-4/12 items-center gap-2">
				<div className="flex flex-col gap-1 w-1/2">
					<Label className="text-slate-400">Stock</Label>
					<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							disabled={!isEditing}
							placeholder='Stock'
						/>
					</div>
				</div>
				<div className="flex flex-col gap-1 w-1/2">
					<Label className="text-slate-400">Price</Label>
					<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							disabled={!isEditing}
							placeholder='Price'
						/>
					</div>
				</div>
			</div>
			<Separator orientation="vertical" className="h-14 w-[1px]" />
			<div className="group flex w-8/12 gap-2">
				<div className="flex flex-col gap-1 w-1/3">
					<Label className="text-slate-400">From <span className='italic'>(Unit)</span></Label>
					<div className="flex items-center gap-2 rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							disabled={!isEditing}
							placeholder='Unit'
						/>
						<ArrowRight className='text-slate-400 pr-1' />
					</div>
				</div>
				<div className="flex flex-col gap-1 w-2/3">
					<Label className="text-slate-400">To <span className='italic'>(Conversion)</span></Label>
					<div className="flex justify-end gap-2">
						<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
							<Input
								className="bg-slate-100 text-slate-700 shadow-none rounded-r-none"
								disabled={!isEditing}
								placeholder={'Quantity'}
							/>
							<Separator orientation="vertical" className="h-10 w-1" />
							<Input
								className="bg-slate-100 text-slate-700 shadow-none rounded-l-none"
								disabled={!isEditing}
								placeholder={'Unit'}
							/>
						</div>
						{isEditing && (
							<Button asChild>
								<div className='!p-1 w-12 h-10 bg-slate-100 hover:bg-slate-200 cursor-pointer'>
									<X className='!w-5 !h-5 text-slate-500' strokeWidth={2.5} />
								</div>
							</Button>
						)}
						{!isEditing && (
							<OutToOfficeSm />
						)}
					</div>
				</div>
			</div> */}

			<div className="group flex w-1/2 gap-2">
				<div className="flex flex-col gap-1">
					<Label className="text-slate-400">Conversion</Label>
					<div className="flex justify-end gap-2">
						<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
							<Input
								className="bg-slate-100 text-slate-700 shadow-none rounded-r-none w-1/3"
								disabled={!isEditing}
								placeholder={'Qty'}
							/>
							<Separator orientation="vertical" className="h-10 w-1" />
							<Input
								className="bg-slate-100 text-slate-700 shadow-none rounded-l-none w-2/3"
								disabled={!isEditing}
								placeholder={'Unit'}
							/>
						</div>
					</div>
				</div>
			</div>
			<Separator orientation="vertical" className="h-14 w-[1px]" />
			<div className="group flex w-1/2 items-end gap-2">
				<div className="flex flex-col gap-1 w-1/2">
					<Label className="text-slate-400">Stock</Label>
					<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							disabled={!isEditing}
							placeholder='Stock'
						/>
					</div>
				</div>
				<div className="flex flex-col gap-1 w-1/2">
					<Label className="text-slate-400">Price per unit</Label>
					<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							disabled={!isEditing}
							placeholder='Price'
						/>
					</div>
				</div>
				{isEditing && (
					<Button asChild>
						<div className='!p-1 w-12 h-10 bg-slate-100 hover:bg-slate-200 cursor-pointer'>
							<X className='!w-5 !h-5 text-slate-500' strokeWidth={2.5} />
						</div>
					</Button>
				)}
				{!isEditing && (
					<OutToOfficeSm />
				)}
			</div>

		</div>
	)
}

export default BatchLineItem