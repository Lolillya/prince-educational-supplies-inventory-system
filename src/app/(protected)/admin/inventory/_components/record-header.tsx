import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';
import MoreOptions from '../../_components/more-options';

interface RecordHeaderProps {
	record: string;
	number: number;
}

const RecordHeader = ({ record, number }: RecordHeaderProps) => {
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
					<DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
						Export Masterlist
					</DropdownMenuItem>
					<DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
						Export Pricelist
					</DropdownMenuItem>
					<DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
						Export Stocklist
					</DropdownMenuItem>
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