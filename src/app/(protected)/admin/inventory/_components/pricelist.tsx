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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'sonner';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface ItemState {
	selectedBatchId?: string;
	selectedUnitName?: string;
	price: string;
}

const PriceList = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedItems, setSelectedItems] = useState<RouterOutputs['inventory']['listInventory']>([]);
	const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});

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
	};

	const handleItemStateChange = (index: number, newState: ItemState) => {
		const itemKey = `${selectedItems[index].variant.id}-${index}`;
		setItemStates(prev => ({
			...prev,
			[itemKey]: newState
		}));
	};

	const handleItemRemove = (index: number) => {
		// First, remove the item from selectedItems
		setSelectedItems(prev => {
			const newItems = prev.filter((_, i) => i !== index);

			// Then update itemStates to match the new indexes
			const newStates: Record<string, ItemState> = {};
			newItems.forEach((item, i) => {
				const oldKey = `${item.variant.id}-${i + (i >= index ? 1 : 0)}`;
				const newKey = `${item.variant.id}-${i}`;
				if (itemStates[oldKey]) {
					newStates[newKey] = itemStates[oldKey];
				}
			});
			setItemStates(newStates);

			return newItems;
		});
	};

	const handleExport = () => {
		if (!selectedItems || selectedItems.length === 0) {
			toast('❌ No items selected to export.');
			return;
		}

		try {
			const doc = new jsPDF();

			// Add title
			doc.setFontSize(12);
			doc.text('Inventory Price List', 14, 15);

			// Add generation date
			const generationDate = new Date().toLocaleDateString();
			doc.setFontSize(10);
			doc.text(`Generated on: ${generationDate}`, 14, 22);

			// Prepare table data
			const tableData = selectedItems.map((item, index) => {
				const itemKey = `${item.variant.id}-${index}`;
				const state = itemStates[itemKey];
				const description = [
					item.variant.item.name,
					item.variant.item.brand.name,
					item.variant.name
				].filter(Boolean).join(' - ');

				// Convert number to superscript
				const superscriptNumber = (num: number) => {
					const superscripts = ['¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
					return superscripts[num - 1] || num;
				};

				const unit = state?.selectedUnitName === 'unit'
					? 'N/A'
					: `${state?.selectedUnitName || 'N/A'}${superscriptNumber(index + 1)}`;
				const price = state?.price ? `P${parseFloat(state.price).toFixed(2)}` : 'N/A';

				return [description, unit, price];
			});

			// Add table
			autoTable(doc, {
				head: [['Description', 'Unit', 'SRP']],
				body: tableData,
				startY: 30,
				theme: 'grid',
				styles: {
					fontSize: 10,
					cellPadding: 2
				},
				headStyles: {
					fillColor: [200, 200, 200],
					textColor: 0
				},
				columnStyles: {
					0: { cellWidth: 100 },
					1: { cellWidth: 40 },
					2: { cellWidth: 30 },
				},
			});

			// Save the PDF
			const date = new Date().toLocaleDateString().replace(/\//g, '-');
			doc.save(`Inventory_PriceList_${date}.pdf`);

			toast('🎉 Your file has been exported successfully!', {
				description: 'Check your downloads folder.',
			});

			// Close the dialog after successful export
			setIsDialogOpen(false);
		} catch (error) {
			console.error('Error exporting price list:', error);
			toast('❌ Failed to export price list.');
		}
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
								You can choose batch, unit, and customize prices as needed.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />
				<PriceListSearch
					filteredItems={filteredItems}
					onItemSelect={handleItemSelect}
				/>

				<ScrollArea className="h-96">
					{selectedItems.length > 0 ? (
						<div className="flex flex-col gap-2">
							{selectedItems.map((item, index) => {
								const itemKey = `${item.variant.id}-${index}`;
								return (
									<PriceListItem
										key={itemKey}
										item={item}
										state={itemStates[itemKey]}
										onStateChange={(newState) => handleItemStateChange(index, newState)}
										onRemove={() => handleItemRemove(index)}
									/>
								);
							})}
						</div>
					) : (
						<div className="flex items-center justify-center h-96 flex-col gap-4">
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
						onClick={handleExport}
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