import React from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { X } from 'lucide-react'

interface VariantProps {
	onRemove: () => void;
	isOnlyVariant: boolean;
	value?: {
		variant: string;
		lowStock: number;
		veryLowStock: number;
	};
	onChange?: (value: {
		variant: string;
		lowStock: number;
		veryLowStock: number;
	}) => void;
}

const Variant = ({ onRemove, isOnlyVariant, value, onChange }: VariantProps) => {
	return (
		<div className="bg-slate-100 p-4 rounded-lg flex flex-col gap-4">
			<Input
				placeholder="Variant Name"
				className="bg-white text-slate-700 placeholder-slate-300 shadow-none"
				value={value?.variant}
				onChange={(e) => onChange?.({ ...value, variant: e.target.value })}
			/>
			<div className="flex gap-4">
				<div className="flex items-center w-full">
					<div className="w-2 h-full bg-amber-500 rounded-l-lg" />
					<Input
						type="number"
						min="0"
						placeholder="Low Stock"
						className="bg-white text-slate-700 placeholder-slate-300 shadow-none w-full rounded-l-none"
						value={value?.lowStock}
						onChange={(e) => onChange?.({ ...value, lowStock: Number(e.target.value) })}
					/>
				</div>
				<div className="flex items-center w-full">
					<div className="w-2 h-full bg-rose-500 rounded-l-lg" />
					<Input
						type="number"
						min="0"
						placeholder="Very Low Stock"
						className="bg-white text-slate-700 placeholder-slate-300 shadow-none w-full rounded-l-none"
						value={value?.veryLowStock}
						onChange={(e) => onChange?.({ ...value, veryLowStock: Number(e.target.value) })}
					/>
				</div>
			</div>
			{onRemove && (
				<Button
					className="bg-slate-100 rounded-lg p-2 text-slate-400 hover:bg-rose-100 border-[3px] border-dashed border-slate-300 hover:border-rose-300 hover:text-rose-400 mt-2"
					onClick={onRemove}
					disabled={isOnlyVariant}
				>
					Remove Variant
				</Button>
			)}
		</div>
	)
}

export default Variant