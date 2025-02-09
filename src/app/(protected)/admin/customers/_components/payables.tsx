import { Calendar, Printer } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import RecordEditor from '../../_components/record-editor';
import RecordExpand from '../../_components/record-expand';
import PayablesInfo from './payables-info';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Poppins } from 'next/font/google';
import MoreOptions from '../../_components/more-options';
import UnpaidInvoice from './unpaid-invoice';
import { ScrollArea } from '~/components/ui/scroll-area';
import PaymentRecord from './payment-record';
import PayablesTabs from './payables-tabs';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface PayablesProps {
	sum: number | 0;
}

const Payables = ({ sum }: PayablesProps) => {
	const [selectedTab, setSelectedTab] = useState<"payables" | "payments">("payables");

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
									🎭
								</AvatarFallback>
							</Avatar>
							<div className='flex flex-col gap-2'>
								<DialogTitle className='text-slate-700 text-xl font-normal'>
									LilyCo {/** Please pass real data here */}
								</DialogTitle>
								<p className='text-slate-400 text-sm'>
									{7} unpaid invoices
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
							<>
								<UnpaidInvoice />
								<UnpaidInvoice />
								<UnpaidInvoice />
								<UnpaidInvoice />
								<UnpaidInvoice />
								<UnpaidInvoice />
							</>
						) : (
							<>
								<PaymentRecord />
								<PaymentRecord />
								<PaymentRecord />
								<PaymentRecord />
								<PaymentRecord />
								<PaymentRecord />
							</>
						)}
					</div>
				</ScrollArea>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="flex items-center justify-between">

					<div className="flex h-full flex-col justify-between gap-1">
						<p className="text-base font-normal text-slate-700">
							₱{5000} {/** Please pass real data here */}
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