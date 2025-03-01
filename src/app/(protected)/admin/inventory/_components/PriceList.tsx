import { Poppins } from 'next/font/google';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { DropdownMenuItem } from '~/components/ui/dropdown-menu'
import { Separator } from '~/components/ui/separator';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Download, Search } from 'lucide-react';
import PriceListItem from './pricelist-item';
import { Input } from '~/components/ui/input';
import { api } from '~/trpc/react';
import PriceListSearch from './pricelist-search';
import type { RouterOutputs } from '~/trpc/shared';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

const PriceList = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedItems, setSelectedItems] = useState<RouterOutputs['inventory']['listInventory']>([]);

	const { data: inventoryData } = api.inventory.listInventory.useQuery();

	const filteredItems = inventoryData?.filter((item) => {
		const searchLower = searchTerm.toLowerCase();
		const itemName = item.variant.item.name.toLowerCase();
		const brandName = item.variant.item.brand.name.toLowerCase();
		const variantName = item.variant.name?.toLowerCase() || '';

		return itemName.includes(searchLower) ||
			brandName.includes(searchLower) ||
			variantName.includes(searchLower);
	});

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape") {
			if (isEditing) {
				setShowWarning(true);
				event.preventDefault();
				event.stopPropagation();
			} else {
				setIsDialogOpen(false);
			}
		}
	};

	const handleItemSelect = (item: RouterOutputs['inventory']['listInventory'][0]) => {
		setSelectedItems(prev => [...prev, item]);
		console.log('Item selected:', item);
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem
					className="hover:!bg-slate-200 focus:!bg-slate-200"
					onSelect={(e) => {
						e.preventDefault();
					}}
				>
					Export Pricelist
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent
				className="!w-full !max-w-3xl [&>button]:hidden"
				onKeyDown={handleKeyDown}
			>
				<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
					<div className="flex flex-col gap-2">
						<DialogTitle className="text-xl font-normal text-slate-700">
							Pricelist
						</DialogTitle>
						<div className="flex items-center gap-3 text-slate-400">
							<DialogDescription className="text-sm tracking-wide">
								Customize your price list by selecting specific items to include in your export.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />

				<PriceListSearch
					filteredItems={filteredItems}
					onItemSelect={handleItemSelect}
				/>

				<ScrollArea className="h-64">
					{selectedItems.length > 0 ? (
						<div className="flex flex-col gap-2">
							{selectedItems.map((item, index) => (
								<PriceListItem
									key={`${item.variant.id}-${index}`}
									item={item}
									onRemove={() => {
										setSelectedItems(prev => prev.filter((_, i) => i !== index));
									}}
								/>
							))}
						</div>
					) : (
						<div className="flex items-center justify-center h-64 flex-col gap-6">
							<Search className="text-slate-400" size={60} />
							<p className="text-slate-400">Search an item to get started.</p>
						</div>
					)}
				</ScrollArea>

				<Separator orientation="horizontal" className="h-[2px]" />
				<div className="flex justify-end gap-3">
					<DialogClose asChild>
						<Button variant="secondary" className="text-slate-700 hover:bg-slate-200">
							Cancel
						</Button>
					</DialogClose>
					<Button
						className="bg-green hover:bg-green/80"
					>
						<Download className='w-6 h-6' strokeWidth={2.5} />
						Export Pricelist
					</Button>
				</div>

				{showWarning && (
					<p className="text-right text-sm text-orange-400">
						Whoops! Don't forget to save your changes.
					</p>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default PriceList