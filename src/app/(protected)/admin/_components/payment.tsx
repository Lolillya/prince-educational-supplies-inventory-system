import { PopoverClose } from "@radix-ui/react-popover";
import { Banknote } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

interface PaymentProps {
	className?: string;
}

const Payment: React.FC<PaymentProps> = ({ className }) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className={`group flex h-12 w-12 items-center justify-center rounded-xl bg-transparent hover:bg-emerald-200/60 transition-all duration-300 ${className}`}
				>
					<Banknote className="!h-5 !w-5 text-slate-500 group-hover:text-emerald-500 transition-colors duration-300" strokeWidth={2.5} />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="shadow-none"
				popoverTarget=""
			>
				<p className="font-medium text-slate-700">
					New Payment
				</p>
				<div className="mt-4 flex flex-col gap-2">
					<div>
						<Label className="text-slate-400">Amount</Label>
						<Input
							className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
						/>
					</div>
					<div>
						<Label className="text-slate-400">Payment Mode</Label>
						<Input
							className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
							placeholder="Mode"
						/>
					</div>
					<div>
						<Label className="text-slate-400">Reference</Label>
						<Input
							className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
							placeholder="Mode"
						/>
					</div>
					<div>
						<div className="flex gap-2">
							<div>
								<Label className="text-slate-400">Balance</Label>
								<Input
									className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
									defaultValue={'00'}
									disabled
								/>
							</div>
							<div>
								<Label className="text-slate-400">Change</Label>
								<Input
									className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
									defaultValue={'00'}
									disabled
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-4 flex w-full gap-2">
					<PopoverClose asChild>
						<Button className="w-1/2 bg-slate-200 text-slate-700 hover:bg-slate-300">
							Cancel
						</Button>
					</PopoverClose>
					<Button className="w-1/2 bg-teal-100 text-green hover:bg-teal-200">
						Update
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default Payment;
