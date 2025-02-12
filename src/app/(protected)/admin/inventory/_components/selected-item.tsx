import { Box, Boxes, Tag } from 'lucide-react';
import { Separator } from '~/components/ui/separator';
import RecordInfo from '../../_components/record-info';
import RecordNotes from '../../_components/record-notes';
import EditRecord from './edit-record';
import InventoryBatch from './inventory-batch';
import {BatchVariant} from "@prisma/client";

type SelectedItemProps = {
	id: string;
	variant: string;
	item: string;
	brand: string;
	category: string;
	stockLevel: string;
	notes?: string;
	batchVariants: BatchVariant[];
}

const SelectedItem = ({
	id,
	variant,
	item,
	brand,
	category,
	stockLevel,
	notes,
	batchVariants
}:
	SelectedItemProps) => {
	return (
		<div className='flex flex-col w-full p-5'>
			<div className="flex items-center justify-between">
				<div className='flex flex-col gap-2'>
					<div className='flex gap-4 items-center'>
						<p className='text-slate-700 text-lg'>
							{variant}
						</p>
						<div className={`flex items-center gap-2 py-1 pl-2 pr-3 rounded-full 
							${stockLevel === "empty" ? "bg-slate-200" : ""}
    					${stockLevel === "very low" ? "bg-rose-200" : ""}
    					${stockLevel === "low" ? "bg-amber-200" : ""}
    					${stockLevel === "good" ? "bg-emerald-200" : ""}
						`}
						>
							<div className={`h-2 w-2 rounded-full
								${stockLevel === "empty" ? "bg-slate-500" : ""}
								${stockLevel === "very low" ? "bg-rose-500" : ""}
								${stockLevel === "low" ? "bg-amber-500" : ""}
								${stockLevel === "good" ? "bg-emerald-500" : ""}
							`}
							/>
							<p className={`text-sm tracking-wide
								${stockLevel === "empty" ? "text-slate-700" : ""}
								${stockLevel === "very low" ? "text-rose-700" : ""}
								${stockLevel === "low" ? "text-amber-700" : ""}
								${stockLevel === "good" ? "text-emerald-700" : ""}
							`}
							>
								{stockLevel === "empty" ? "No Stock" : (
									stockLevel === "very low" ? "Very Low Stock" : (
										stockLevel === "low" ? "Low Stock" : (
											stockLevel === "good" ? "Sufficient Stock" : ""
										)
									)
								)}
							</p>
						</div>
					</div>
					<p className='text-slate-400 text-sm'>
						{id}
					</p>
				</div>
				<EditRecord />
			</div>

			<Separator className='h-[1px] bg-slate-300 mt-5' />

			<div className="flex flex-col gap-3 mt-5">
				<RecordInfo icon={Box} recordType={'Item'} info={item} />
				<RecordInfo icon={Tag} recordType={'Brand'} info={brand} />
				<RecordInfo icon={Boxes} recordType={'Category'} info={category} />
				<RecordNotes notes={notes} />
			</div>

			<Separator className='h-[1px] bg-slate-300 mt-5' />

			<div className='mt-5'>

				{/* //TODO: reflect invoice data based on selected customer */}
				<InventoryBatch
					batchVariants={batchVariants}
					selectedVariantId={Number(id)}
				/>
			</div>

		</div>
	)
}

export default SelectedItem