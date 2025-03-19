import { PopoverClose } from "@radix-ui/react-popover";
import { Banknote } from "lucide-react";
import React, {useState} from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { PaymentMethod } from '@prisma/client';

import {api} from "~/trpc/react";


interface PaymentProps {
	className?: string;
	invoiceId: number;
	remainingAmount: number;
	onPaymentSuccess: () => void;
}

const Payment: React.FC<PaymentProps> = ({ className, invoiceId, remainingAmount, onPaymentSuccess }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

	const [reference, setReference] = useState("");
	const [error, setError] = useState("");
	const paymentAmount = parseFloat(amount || "0");
	const calculatedBalance = Math.max(remainingAmount - paymentAmount, 0);
	const calculatedChange = Math.max(paymentAmount - remainingAmount, 0);


	const { mutate: createPayment, isPending } = api.payment.create.useMutation({
		onSuccess: () => {
			onPaymentSuccess();
			setIsOpen(false);
			(document.querySelector('[data-radix-popper-content-wrapper]') as HTMLElement)?.click();
		},
		onError: (error) => setError(error.message)
	});

	const handleSubmit = () => {
		setError("");
		const paymentAmount = parseFloat(amount);

		if (!paymentAmount || paymentAmount <= 0) {
			setError("Please enter a valid positive amount");
			return;
		}

		if (method !== "CASH" && !reference) {
			setError("Reference is required for this payment method");
			return;
		}

		createPayment({
			invoiceId,
			amount: paymentAmount,
			method,
			reference: method === "CASH" ? null : reference
		});
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
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
				{error && <p className="text-red-500 text-sm mt-2">{error}</p>}

				<div className="mt-4 flex flex-col gap-2">
					<div>
						<Label className="text-slate-400">
							Amount <span className="text-red">*</span>
						</Label>
						<Input
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
						/>
					</div>
					<div>
						<Label className="text-slate-400">
							Payment Mode <span className="text-red">*</span>
						</Label>
						<select
							value={method}
							onChange={(e) => setMethod(e.target.value as PaymentMethod)}
							className="w-full bg-slate-100 rounded-md px-3 py-2 text-sm border border-slate-200"
						>
							{Object.values(PaymentMethod).map((method) => (
								<option key={method} value={method}>
									{method.charAt(0) + method.slice(1).toLowerCase()}
								</option>
							))}
						</select>
					</div>

					{method !== "CASH" && (
						<div>
							<Label className="text-slate-400">
								Reference <span className="text-red">*</span>
							</Label>
							<Input
								value={reference}
								onChange={(e) => setReference(e.target.value)}
								className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
								placeholder={
									method === "CHEQUE" ? "Cheque number" :
										"Transaction reference"
								}
							/>
						</div>
					)}
					<div>
						<div className="flex gap-2">
							<div>
								<Label className="text-slate-400">Balance</Label>
								<Input
									value={calculatedBalance.toFixed(2)}
									className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
									defaultValue={'00'}
									disabled
								/>
							</div>
							<div>
								<Label className="text-slate-400">Change</Label>
								<Input
									value={calculatedChange.toFixed(2)}
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

					<Button
						onClick={handleSubmit}
						disabled={isPending}
						className="w-1/2 bg-teal-100 text-green hover:bg-teal-200"
					>
						{isPending ? "Processing..." : "Pay"}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default Payment;
