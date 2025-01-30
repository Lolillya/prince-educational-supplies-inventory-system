import { Box, Calendar, Hash, PhilippinePeso } from 'lucide-react';
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

interface EmployeeActivityCardProps {
	type: 'restock' | 'invoice';
}

const EmployeeActivityCard = ({ type }: EmployeeActivityCardProps) => {
	// TODO: reflect restock data based on selected supplier
	return (
		<div className='p-5 flex flex-col gap-4 hover:bg-slate-200/50 rounded-lg cursor-pointer transition-all duration-300'>
			<p className='text-slate-600 text-left'>
				{type == 'invoice' ? (
					'Invoice'
				) : type == 'restock' ? (
					'Restock'
				) : (
					'---'
				)}
			</p>
			<div className="flex items-center gap-3 flex-grow overflow-hidden">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Hash className="h-4 w-4" />
						</TooltipTrigger>
						<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
							{type == 'invoice' ? (
								'Invoice record 12345678'
							) : type == 'restock' ? (
								'Restock record 12345678'
							) : (
								'Unknown record'
							)}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<p className="text-sm truncate">12345678</p>
			</div>
			<div className="flex items-center gap-4 text-slate-400">
				<div className="flex items-center gap-3 text-slate-400">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Calendar className="h-4 w-4" />
							</TooltipTrigger>
							<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
								Recorded on 2025-01-13
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<p className="text-sm">2025-01-13</p>
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
										₱5,000 grand total
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<p className="text-sm">5,000</p>
						</>
					) : type == 'restock' ? (
						<>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Box className="h-4 w-4" />
									</TooltipTrigger>
									<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
										300 total added stock
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<p className="text-sm">300</p>
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