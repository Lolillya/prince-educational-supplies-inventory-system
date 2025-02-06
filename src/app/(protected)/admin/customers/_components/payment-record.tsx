import { Calendar, User2 } from 'lucide-react';
import { Poppins } from 'next/font/google';
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import Refund from '../../_components/refund';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

const PaymentRecord = () => {
	return (
		<div className='bg-slate-100 p-6 rounded-lg w-full'>
			<div className="flex items-center justify-between">
				<div className={`flex flex-col gap-1 ${poppins.className} w-full`}>
					<p className='text-slate-600 text-lg'>#INV00000000</p>
					<div className="flex items-center gap-4 text-slate-400">
						<div className="flex items-center gap-2 text-slate-400">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Calendar className="h-4 w-4" />
									</TooltipTrigger>
									<TooltipContent className='text-slate-700 bg-white rounded-lg text-sm shadow-none border border-slate-200'>
										Payment recorded on February 05, 2025
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<p className="text-sm">February 05, 2025</p>
						</div>
						<Separator
							orientation="vertical"
							className="h-5 w-[2px] bg-slate-200"
						/>
						<div className="flex items-center gap-2 text-slate-400">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<User2 className="h-4 w-4" />
									</TooltipTrigger>
									<TooltipContent className='text-slate-700 bg-white rounded-lg text-sm shadow-none border border-slate-200'>
										Recorded by Bob Admin
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<p className="text-sm">Bob Admin</p>
						</div>
					</div>
				</div>
				<Separator
					orientation="vertical"
					className="h-12 w-[2px] bg-slate-200"
				/>
				<div className="flex items-center justify-between ${poppins.className} w-full ml-6">
					<div className={`flex flex-col gap-1`}>
						<p className='text-slate-600 text-lg'>₱5000</p>
						<div className="flex items-center gap-4 text-slate-400">
							<p className="text-sm">Amount paid</p>
							<Separator
								orientation="vertical"
								className="h-5 w-[2px] bg-slate-200"
							/>
							<div className="flex items-center gap-3">
								<p className="text-sm">0 Change</p>
							</div>
						</div>
					</div>
					<Refund />
				</div>
			</div>
		</div>
	)
}

export default PaymentRecord