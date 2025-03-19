import { Printer } from 'lucide-react';
import { Poppins } from 'next/font/google';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import PayablesInfo from './payables-info';
import PayablesTabs from './payables-tabs';
import PaymentRecord from './payment-record';
import UnpaidInvoice from './unpaid-invoice';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface PayablesProps {
	sum: number;
	unpaidInvoices: {
		invoice_number: number;
		created_at: Date;
		total_amount: number;
		remaining: number;
	}[];
	emoji: string;  // Add emoji prop
	company: string;  // Add companyName prop
	onPaymentSuccess: () => void;
}

const Payables = ({ sum, unpaidInvoices, emoji, company, onPaymentSuccess }: PayablesProps) => {
	const [selectedTab, setSelectedTab] = useState<"payables" | "payments">("payables");
	// Calculate total remaining from invoices if sum is incorrect
	const calculatedSum = sum ?? unpaidInvoices.reduce((acc, invoice) => acc + invoice.remaining, 0);

	return (
		<Dialog>
			<DialogTrigger>
				<PayablesInfo sum={sum} />
			</DialogTrigger>
			<DialogContent className="flex max-h-[80%] !w-full !max-w-4xl flex-col [&>button]:hidden">
				<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
					<div className="flex items-center justify-between">
						<div className='flex gap-5 items-center'>
							<Avatar className='h-16 w-16 !rounded-lg'>
								<AvatarFallback className="bg-black text-slate-700 !rounded-lg text-3xl">
									{emoji || "🏢"}
								</AvatarFallback>
							</Avatar>
							<div className='flex flex-col gap-2'>
								<DialogTitle className='text-slate-700 text-xl font-normal'>
									{company || "Customer Company"}
								</DialogTitle>
								<p className='text-slate-400 text-sm'>
									{unpaidInvoices.length} unpaid invoices
								</p>
							</div>
						</div>
						<PayablesTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />

				<ScrollArea className='h-80'>
					<div className='flex gap-2 flex-col'>
						{selectedTab === "payables" ? (
							unpaidInvoices.map((invoice) => (
								<UnpaidInvoice
									key={invoice.invoice_id}
									invoice={invoice}
									onPaymentSuccess={onPaymentSuccess}
								/>
							))
						) : (
							// paymentRecords.map((record) => (
							// 	<PaymentRecord key={record.record_id} record={record} />
							<>
								<PaymentRecord />
								<PaymentRecord />
								<PaymentRecord />
								<PaymentRecord />
								<PaymentRecord />
								<PaymentRecord />
							</>
							// ))
						)}

					</div>
				</ScrollArea>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="flex items-center justify-between">

					<div className="flex h-full flex-col justify-between gap-1">
						<p className="text-base font-normal text-slate-700">
							₱{calculatedSum.toFixed(2)}
						</p>
						<p className=" text-slate-400 text-sm tracking-wide">Unpaid Total</p>
					</div>
					<div className="flex items-center gap-2">
						<DialogClose asChild>
							<Button
								variant={"secondary"}
								className="text-slate-700 hover:bg-slate-200"
							>
								Close
							</Button>
						</DialogClose>
						<Button className="bg-green hover:bg-green/80">
							<Printer />
							Print Statement
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default Payables