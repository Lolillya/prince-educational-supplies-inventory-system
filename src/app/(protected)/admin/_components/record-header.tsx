import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import MoreOptions from './more-options';
import ClearList from './clear-list';
import { handleExport as exportSuppliers } from '~/lib/utils/exportSuppliers';
import { handleExport as exportCustomers } from '~/lib/utils/exportCustomers';
import { handleExport as exportEmployees } from '~/lib/utils/exportEmployees';
import type { Supplier } from '~/types/suppliers';
import type { Customer } from '~/types/customers';
import { toast } from 'sonner';
import type { Employee } from '~/types/employees';
import type { InventoryItem } from "~/types/inventory";

interface RecordHeaderProps {
	record: string;
	number: number;
	data: Supplier[] | Customer[] | Employee[] | InventoryItem[] | unknown[];
}

const RecordHeader = ({ record, number, data }: RecordHeaderProps) => {
	const handleExport = () => {
		if (!data || data.length === 0) {
			toast(`❌ No ${record.toLowerCase()} data available to export.`);
			return;
		}

		const success = record === 'Suppliers'
			? exportSuppliers({ suppliers: data as Supplier[] })
			: record === 'Customers'
				? exportCustomers({ customers: data as Customer[] })
				: record === 'Employees'
					? exportEmployees({ employees: data as Employee[] })
					: false;

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
				<DropdownMenuContent>
					<DropdownMenuItem
						onClick={handleExport}
						className="hover:!bg-slate-200 focus:!bg-slate-200"
					>
						Export List
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<ClearList recordType={record} />
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default RecordHeader;
