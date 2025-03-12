import { Calendar } from 'lucide-react';
import { Poppins } from 'next/font/google';
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import Payment from '../../_components/payment';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface UnpaidInvoiceProps {
	invoice: {
		invoice_number: number;
		created_at: Date;
		total_amount: number;
		paid_amount: number;
		remaining: number;  // Now matches backend calculation
	};
	onPaymentSuccess: () => void;
}

const UnpaidInvoice = ({ invoice, onPaymentSuccess }: UnpaidInvoiceProps) => {
	const formattedDate = new Date(invoice.created_at).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	// Add safety checks for numerical values
	const remaining = (invoice.remaining ?? 0).toFixed(2);
	const totalAmount = (invoice.total_amount ?? 0).toFixed(2);

	return (
		<div className='bg-slate-100 p-6 rounded-lg w-full'>
			<div className="flex items-center justify-between">
				<div className={`flex flex-col gap-1 ${poppins.className} w-full`}>
					<p className='text-slate-600 text-lg'>#{invoice.invoice_number.toString().padStart(8, '0')}</p>
					<div className="flex items-center gap-2 text-slate-400">
						<TooltipProvider delayDuration={0} skipDelayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Calendar className="h-4 w-4"/>
								</TooltipTrigger>
								<TooltipContent
									className='text-slate-700 bg-white rounded-lg text-sm shadow-none border border-slate-200'>
									Invoice recorded on {formattedDate}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<p className="text-sm">{formattedDate}</p>
					</div>
				</div>
				<Separator
					orientation="vertical"
					className="h-12 w-[2px] bg-slate-200"
				/>
				<div className="flex items-center justify-between ${poppins.className} w-full ml-6">
					<div className={`flex flex-col gap-1`}>
						<p className='text-slate-600 text-lg'>
							₱{remaining}
						</p>
						<div className="flex gap-2 text-sm text-slate-400">
							<span>of ₱{totalAmount}</span>
						</div>

						<p className="text-sm text-slate-400">Unpaid Amount</p>
					</div>
					<Payment
						invoiceId={invoice.invoice_id}
						remainingAmount={invoice.remaining}
						onPaymentSuccess={onPaymentSuccess}
					/>
				</div>
			</div>
		</div>
	)
}

export default UnpaidInvoice