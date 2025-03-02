import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import MoreOptions from '../../_components/more-options';
import { handleExport as exportInventory } from '~/lib/utils/exportMaserList';
import { handleExport as exportStockList } from '~/lib/utils/exportStockList';
import { toast } from 'sonner';
import type { InventoryItem } from '~/types/inventory';
import PriceList from './pricelist-dialog';

interface RecordHeaderProps {
	record: string;
	number: number;
	data: InventoryItem[];
}

const RecordHeader = ({ record, number, data }: RecordHeaderProps) => {

	const handleExport = () => {
		if (!data || data.length === 0) {
			toast(`❌ No ${record.toLowerCase()} data available to export.`);
			return;
		}

		const success = exportInventory({ inventory: data });

		if (success) {
			toast('🎉 Your file has been exported successfully!', {
				description: 'Check your downloads folder.',
			});
		} else {
			toast(`❌ No ${record.toLowerCase()} data available to export.`);
		}

	};

	const handleStockListExport = (includeOutOfStock = true, onlyOutOfStock = false) => {
		if (!data || data.length === 0) {
			toast(`❌ No ${record.toLowerCase()} data available to export.`);
			return;
		}

		const success = exportStockList({
			inventory: data,
			includeOutOfStock,
			onlyOutOfStock
		});

		if (success) {
			toast('🎉 Your file has been exported successfully!', {
				description: 'Check your downloads folder.',
			});
		} else {
			toast(`❌ No ${record.toLowerCase()} data available to export.`);
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
					<DropdownMenuItem
						onClick={handleExport}
						className="hover:!bg-slate-200 focus:!bg-slate-200"
					>
						Export Masterlist
					</DropdownMenuItem>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="hover:!bg-slate-200 focus:!bg-slate-200">
							Export Pricelist
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<PriceList method='include-all'/>
								<PriceList method='exclude-out-of-stock'/>
								<PriceList method='manual-selection'/>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="hover:!bg-slate-200 focus:!bg-slate-200">
							Export Stocklist
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<DropdownMenuItem
									onClick={() => handleStockListExport(true, false)}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
								>
									Include out-of-stock
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStockListExport(false, false)}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
								>
									Exclude out-of-stock
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStockListExport(true, true)}
									className="hover:!bg-slate-200 focus:!bg-slate-200"
								>
									Only out-of-stock
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
	)
}

export default RecordHeader