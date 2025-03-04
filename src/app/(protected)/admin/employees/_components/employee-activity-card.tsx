import { Box, Calendar, Hash, PhilippinePeso } from 'lucide-react';
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

interface EmployeeActivityCardProps {
	type: 'restock' | 'invoice';
	activity: {
		id: number;
		created_at: Date | string;
		total?: number;
		quantity?: number;
	};
}

const EmployeeActivityCard = ({ type, activity }: EmployeeActivityCardProps) => {
	const formattedDate = new Date(activity.created_at).toLocaleDateString();
	const displayId = type === 'restock' ? `RS${activity.id}` : `INV${activity.id}`;
	const displayValue = type === 'invoice'
		? `₱${activity.total?.toLocaleString() ?? 0}`
		: `${activity.quantity?.toLocaleString()} items`;

	// TODO: reflect restock data based on selected supplier
	return (
		<div className='p-5 flex flex-col gap-4 hover:bg-slate-200/50 rounded-lg cursor-pointer transition-all duration-300'>
			<p className='text-slate-600 text-left'>
				{displayId}
			</p>
			<div className="flex items-center gap-4 text-slate-400">
				<div className="flex items-center gap-3 text-slate-400">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Calendar className="h-4 w-4" />
							</TooltipTrigger>
							<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
								Recorded on {formattedDate}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<p className="text-sm">{formattedDate}</p>
				</div>
				<Separator
					orientation="vertical"
					className="h-6 w-[2px] bg-slate-200"
				/>
				<div className="flex items-center gap-3">
					{type == 'invoice' ? (
						<>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<PhilippinePeso className="h-4 w-4" />
									</TooltipTrigger>
									<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
										₱{activity.total?.toLocaleString()} grand total
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<p className="text-sm">₱{activity.total?.toLocaleString()}</p>
						</>
					) : type == 'restock' ? (
						<>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Box className="h-4 w-4" />
									</TooltipTrigger>
									<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
										{/*300 total added stock*/}
										{activity.quantity?.toLocaleString()} items restocked
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<p className="text-sm">{activity.quantity?.toLocaleString()}</p>
						</>
					) : (
						<p className="text-sm">No information available</p>
					)}
				</div>
			</div>
		</div>
	)
}


export default EmployeeActivityCard