import { Search } from 'lucide-react'
import React from 'react'
import { Input } from '~/components/ui/input'
import { ScrollArea } from '~/components/ui/scroll-area'
import type { RouterOutputs } from '~/trpc/shared'

type Inventory = RouterOutputs['inventory']['listInventory'][0]

interface PriceListSearchProps {
	filteredItems?: Inventory[]
	onItemSelect?: (item: Inventory) => void
}

const PriceListSearch = ({ filteredItems, onItemSelect }: PriceListSearchProps) => {
	const [isFocused, setIsFocused] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState('');
	const inputRef = React.useRef<HTMLInputElement>(null);

	const handleItemClick = (item: Inventory) => {
		onItemSelect?.(item);
		setIsFocused(false);
		setSearchTerm('');
		inputRef.current?.blur(); // Remove focus from input
	};

	const filteredResults = filteredItems?.filter((item) => {
		const searchLower = searchTerm.toLowerCase();
		const itemName = item.variant.item.name.toLowerCase();
		const brandName = item.variant.item.brand.name.toLowerCase();
		const variantName = item.variant.name?.toLowerCase() || '';

		return itemName.includes(searchLower) ||
			brandName.includes(searchLower) ||
			variantName.includes(searchLower);
	});

	return (
		<div className='relative'>
			<div className='flex w-full items-center rounded-lg bg-slate-100 px-3 focus-within:outline focus-within:outline-2 focus-within:outline-slate-200'>
				<Search className="text-slate-500" />
				<Input
					ref={inputRef}
					placeholder={'Search...'}
					className="w-full bg-transparent text-slate-700 shadow-none"
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>

			{isFocused && (
				<div className='absolute w-full rounded-lg p-2 bg-slate-100 z-50 mt-2 border-4 border-slate-200/50'>
					<ScrollArea className='h-36'>
						{filteredResults && filteredResults.length > 0 ? (
							filteredResults.map((item) => (
								<div
									key={item.variant.variant_id}
									className='text-slate-600 text-sm hover:bg-slate-200 rounded-lg px-4 py-2 cursor-pointer'
									onMouseDown={(e) => {
										e.preventDefault();
										handleItemClick(item);
									}}
								>
									{item.variant.item.name} - {item.variant.item.brand.name}
									{item.variant.name && ` - ${item.variant.name}`}
								</div>
							))
						) : (
							<div className='text-slate-500 text-sm px-4 py-2 text-center'>
								No items found
							</div>
						)}
					</ScrollArea>
				</div>
			)}
		</div>
	)
}

export default PriceListSearch