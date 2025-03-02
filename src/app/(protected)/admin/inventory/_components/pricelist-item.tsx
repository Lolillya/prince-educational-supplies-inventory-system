import { X } from 'lucide-react'
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import type { RouterOutputs } from '~/trpc/shared'

interface BatchPrice {
	unit: string;
	price: string;
}

interface Batch {
	id: string;
	name: string;
	prices: BatchPrice[];
}

interface BatchVariant {
	batch_variant_id: string;
	variant_id: number;
	quantity: number;
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
	batch: {
		batch_id: string;
		batch_number: string;
	};
}

interface PriceListItemProps {
	item: RouterOutputs['inventory']['listInventory'][0];
	state: {
		selectedBatchId?: string;
		selectedUnitName?: string;
		price: string;
	};
	onStateChange: (newState: { selectedBatchId?: string; selectedUnitName?: string; price: string }) => void;
	onRemove: () => void;
}

const PriceListItem = ({ item, state, onStateChange, onRemove }: PriceListItemProps) => {
	console.log('Full item data:', item);

	// Get batchVariants from the variant using BatchVariant
	const batchVariants = item.variant.BatchVariant || [];
	console.log('BatchVariants:', batchVariants);

	// Transform batchVariants data into our batch structure
	const batches: Batch[] = batchVariants.map((batchVariant) => {
		// Get the supplier units for this batch variant from the nested structure
		const supplierUnits = batchVariant.batch?.batchVariants
			?.find(bv => bv.batch_variant_id === batchVariant.batch_variant_id)
			?.SupplierUnit || [];

		return {
			id: batchVariant.batch_variant_id,
			name: `Batch ${batchVariant.batch.batch_number}`,
			prices: supplierUnits.map(unit => ({
				unit: unit.unit?.name || 'N/A',
				price: unit.price.toString(),
				quantity: unit.quantity_per_unit
			}))
		};
	});

	console.log('Final batches array:', batches);

	// Find the currently selected batch
	const selectedBatch = state?.selectedBatchId
		? batches.find(b => b.id === state.selectedBatchId)
		: undefined;

	// Initialize state if not already set
	React.useEffect(() => {
		if (!state?.selectedBatchId && batches.length > 0) {
			const initialBatch = batches[0];
			if (initialBatch && initialBatch.prices.length > 0) {
				const initialUnit = initialBatch.prices[0];
				if (initialUnit) {
					onStateChange({
						selectedBatchId: initialBatch.id,
						selectedUnitName: initialUnit.unit,
						price: initialUnit.price
					});
				}
			}
		}
	}, [batches, state?.selectedBatchId, onStateChange]);

	const handleBatchChange = (batchId: string) => {
		const newBatch = batches.find(b => b.id === batchId);
		if (newBatch && newBatch.prices.length > 0) {
			const newUnit = newBatch.prices[0];
			if (newUnit) {
				onStateChange({
					selectedBatchId: batchId,
					selectedUnitName: newUnit.unit,
					price: newUnit.price
				});
			}
		}
	};

	const handleUnitChange = (unitName: string) => {
		if (!selectedBatch) return;
		const newUnit = selectedBatch.prices.find(p => p.unit === unitName);
		if (newUnit) {
			onStateChange({
				...state,
				selectedUnitName: unitName,
				price: newUnit.price
			});
		}
	};

	return (
		<div className='p-4 rounded-lg bg-slate-100'>
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<p className='text-slate-700 font-medium'>
						{item.variant.item.name} - {item.variant.item.brand.name}
						{item.variant.name && ` - ${item.variant.name}`}
					</p>
					<div className='flex items-center gap-4'>
						<Select
							value={state?.selectedBatchId}
							onValueChange={handleBatchChange}
						>
							<SelectTrigger className='p-0 w-[70px] border-none h-auto bg-transparent text-slate-500'>
								<SelectValue placeholder='Batch' />
							</SelectTrigger>
							<SelectContent className='shadow-none'>
								{batches.map((batch, index) => (
									<SelectItem key={batch.id} value={batch.id}>
										{`Batch ${index + 1}`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select
							value={state?.selectedUnitName}
							onValueChange={handleUnitChange}
						>
							<SelectTrigger className="p-0 w-28 border-none h-auto bg-transparent text-slate-500">
								<SelectValue placeholder="Unit" />
							</SelectTrigger>
							<SelectContent className="shadow-none">
								{selectedBatch?.prices.map(price => (
									<SelectItem key={price.unit} value={price.unit}>
										<span>{price.unit}</span>
										<span className="text-xs text-slate-400 ml-2">₱{price.price}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="flex items-center gap-2">
							<span className='text-slate-400 text-sm'>₱</span>
							<Input
								className='w-20 p-0 h-auto shadow-none bg-transparent text-slate-500 rounded-none'
								value={state?.price || '0.00'}
								onChange={(e) => {
									const value = e.target.value;
									if (value === '' || /^[0-9]+(\.[0-9]*)?$/.test(value)) {
										onStateChange({
											...state,
											price: value
										});
									}
								}}
								type="number"
								step="0.01"
								min="0"
								onBlur={() => {
									if (!state?.price) {
										onStateChange({
											...state,
											price: '0.00'
										});
									}
								}}
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