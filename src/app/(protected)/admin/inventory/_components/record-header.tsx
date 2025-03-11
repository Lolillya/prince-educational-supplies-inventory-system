import { useState } from 'react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import { handleExport as exportMasterList } from '~/lib/utils/exportMasterList';
import { handleExport as exportStockList } from '~/lib/utils/exportStockList';
import type { InventoryItem } from '~/types/inventory';
import MoreOptions from '../../_components/more-options';
import PriceList from './pricelist';

interface RecordHeaderProps {
	record: string;
	number: number;
	data: InventoryItem[];
}

const RecordHeader = ({ record, number, data }: RecordHeaderProps) => {
	const [stockFilters, setStockFilters] = useState({
		sufficient: true,
		low: true,
		veryLow: true,
		noStock: true
	});

	const handleExport = (includeNoStock: boolean) => {
		if (!data || data.length === 0) {
			toast(`❌ No ${record.toLowerCase()} data available to export.`);
			return;
		}

		const success = exportMasterList({
			inventory: data,
			includeNoStock
		});

		if (success) {
			toast('🎉 Your file has been exported successfully!', {
				description: 'Check your downloads folder.',
			});
		} else {
			toast('❌ Failed to generate export.');
		}
	};

	const handleStockListExport = () => {
		if (!data || data.length === 0) {
			toast(`❌ No ${record.toLowerCase()} data available to export.`);
			return;
		}

		const success = exportStockList({
			inventory: data,
			stockFilters
		});

		if (success) {
			toast('🎉 Your file has been exported successfully!', {
				description: 'Check your downloads folder.',
			});
		} else {
			toast('❌ Failed to generate export.');
		}
	};

	return (
		<div className="bg-slate-100 w-full rounded-lg text-lg px-6 py-3 flex items-center justify-between">
			<div className='flex items-center gap-2'>
				<p className="text-slate-500">{record}</p>
				<p className='text-slate-400 pl-4 text-base'>{number} records</p>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger className='flex justify-center items-center'>
					<MoreOptions className='!h-[1px] mr-1' />
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-48'>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="hover:!bg-slate-200 focus:!bg-slate-200">
							Export Masterlist
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuItem
									onClick={() => handleExport(true)}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
								>
									Include no stock
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleExport(false)}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
								>
									Exclude no stock
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
					<PriceList />
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="hover:!bg-slate-200 focus:!bg-slate-200">
							Export Stocklist
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuCheckboxItem
									checked={stockFilters.sufficient}
									onCheckedChange={() => setStockFilters(prev => ({
										...prev,
										sufficient: !prev.sufficient
									}))}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
									onSelect={(e) => e.preventDefault()}
								>
									Sufficient stock
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={stockFilters.low}
									onCheckedChange={() => setStockFilters(prev => ({
										...prev,
										low: !prev.low
									}))}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
									onSelect={(e) => e.preventDefault()}
								>
									Low stock
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={stockFilters.veryLow}
									onCheckedChange={() => setStockFilters(prev => ({
										...prev,
										veryLow: !prev.veryLow
									}))}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
									onSelect={(e) => e.preventDefault()}
								>
									Very low stock
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={stockFilters.noStock}
									onCheckedChange={() => setStockFilters(prev => ({
										...prev,
										noStock: !prev.noStock
									}))}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
									onSelect={(e) => e.preventDefault()}
								>
									No stock
								</DropdownMenuCheckboxItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleStockListExport}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
									onSelect={(e) => e.preventDefault()}
								>
									Export Stocklist
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red">
						Clear list
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default RecordHeader;