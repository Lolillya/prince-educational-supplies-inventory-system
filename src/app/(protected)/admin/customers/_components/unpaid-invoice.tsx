import { Calendar } from 'lucide-react';
import { Poppins } from 'next/font/google';
import { Separator } from '~/components/ui/separator';
import Payment from '../../_components/payment';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

const UnpaidInvoice = () => {
	return (
		<div className='bg-slate-100 p-6 rounded-lg w-full'>
			<div className="flex items-center justify-between">
				<div className={`flex flex-col gap-1 ${poppins.className} w-full`}>
					<p className='text-slate-600 text-lg'>#INV00000000</p>
					<div className="flex items-center gap-2 text-slate-400">
						<TooltipProvider delayDuration={0} skipDelayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Calendar className="h-4 w-4" />
								</TooltipTrigger>
								<TooltipContent className='text-slate-700 bg-white rounded-lg text-sm shadow-none border border-slate-200'>
									Invoice recorded on February 05, 2025
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<p className="text-sm">February 05, 2025</p>
					</div>
				</div>
				<Separator
					orientation="vertical"
					className="h-12 w-[2px] bg-slate-200"
				/>
				<div className="flex items-center justify-between ${poppins.className} w-full ml-6">
					<div className={`flex flex-col gap-1`}>
						<p className='text-slate-600 text-lg'>₱5000</p>
						<p className="text-sm text-slate-400">Unpaid Amount</p>
					</div>
					<Payment />
				</div>
			</div>
		</div>
	)
}

export default UnpaidInvoice