import { CornerDownRight, X } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'

const Conversion = () => {
	return (
		<div className='mt-4'>
			<div className="flex gap-4">
				<div className="w-1/2 flex flex-col gap-1">
					<div className="flex">
						<div className="flex items-center">
							<div className="flex h-10 w-12 items-end justify-center !p-1">
								<CornerDownRight
									className="!h-5 !w-5 text-slate-400"
									strokeWidth={2.5}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<div className="flex gap-2">
									<div className="flex flex-col gap-1 w-1/2">
										<Label className="text-sm text-slate-400">Quantity</Label>
										<Input className="bg-white shadow-none text-slate-700" placeholder='Qty' />
									</div>
									<div className="flex flex-col gap-1 w-1/2">
										<Label className="text-sm text-slate-400">Unit</Label>
										<Input className="bg-white shadow-none text-slate-700" placeholder='Unit' />
									</div>
								</div>
							</div>
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
						<Button className="flex h-10 w-12 items-center justify-center !p-1 bg-slate-100 hover:!bg-slate-200/50">
							<X
								className="!h-5 !w-5 text-slate-400"
								strokeWidth={2.5}
							/>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Conversion