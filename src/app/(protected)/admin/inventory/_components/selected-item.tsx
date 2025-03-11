import { Box, Boxes, Hash, Tag } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Separator } from '~/components/ui/separator';
import Edit from '../../_components/edit';
import RecordInfo from '../../_components/record-info';
import RecordNotes from '../../_components/record-notes';
import InventoryBatch from './inventory-batch';

// Update the interface to match the BatchVariant interface exactly
interface BatchVariantData {
	batch_variant_id: string;  // Changed from number to string
	variant_id: number;
	quantity: number;
	batch: {
		batch_id: string;
		batch_number: string;
		batchVariants?: {
			batch_variant_id: string;
			SupplierUnit?: {
				supplier_unit_id: string;
				quantity_per_unit: number;
				price: number;
				unit?: { name: string };
				ConversionRate?: {
					conversion_id: string;
					conversion_rate: number;
					fromUnit?: { name: string };
					toUnit?: { name: string };
				}[];
			}[];
		}[];
	};
	SupplierUnit?: {
		supplier_unit_id: string;
		quantity_per_unit: number;
		price: number;
		ConversionRate?: {
			conversion_id: string;
			conversion_rate: number;
			fromUnit?: { name: string };
			toUnit?: { name: string };
		}[];
		unit?: { name: string };
	}[];
}

type SelectedItemProps = {
	id: string;
	inventoryNumber: string;
	variant: string;
	item: string;
	brand: string;
	category: string;
	stockLevel: string;
	notes?: string;
	batchVariants: BatchVariantData[];
	onVerifyPassword: (password: string) => Promise<boolean>;
}

const SelectedItem = ({
	id,
	variant,
	item,
	brand,
	category,
	stockLevel,
	notes,
	batchVariants,
	onVerifyPassword,
	inventoryNumber,
}:
	SelectedItemProps) => {
	const router = useRouter();

	const handleEditItem = () => {
		router.push(`/admin/inventory/edit-item/${inventoryNumber}`);
	};

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
					<p className="text-slate-400 text-sm flex items-center gap-1">
						<Hash className="h-4 w-4" />
						{inventoryNumber}
					</p>

				</div>
				{/*<EditRecord />*/}
				<div className='hover:cursor-pointer' onClick={handleEditItem}>
					<Edit className='text-gray-500' />
				</div>
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
					batchVariants={batchVariants.map(bv => ({
						...bv,
						batch_variant_id: bv.batch_variant_id.toString()
					}))}
					selectedVariantId={Number(id)}
					onVerifyPassword={onVerifyPassword}
					inventoryNumber={inventoryNumber}
					restockId={0}
					date=""
					employee=""
					addedStock={0}
					restockData={undefined}
				/>
			</div>

		</div>
	)
}

export default SelectedItem