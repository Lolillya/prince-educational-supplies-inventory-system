import { PopoverClose } from "@radix-ui/react-popover";
import { Banknote, Undo2 } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

interface RefundProps {
	className?: string;
}

const Refund: React.FC<RefundProps> = ({ className }) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className={`group flex h-12 w-12 items-center justify-center rounded-xl bg-transparent hover:bg-rose-200/60 transition-all duration-300 ${className}`}
				>
					<Undo2 className="!h-5 !w-5 text-slate-500 group-hover:text-rose-500 transition-colors duration-300" strokeWidth={2.5} />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="shadow-none"
				popoverTarget=""
			>
				<p className="font-medium text-slate-700">
					Refund
				</p>
				<div className="mt-4">
					<Label className="text-slate-400">Enter your password to confirm</Label>
					<Input
						className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
						placeholder="Password"
					/>
				</div>
				<div className="mt-4 flex w-full gap-2">
					<PopoverClose asChild>
						<Button className="w-1/2 bg-slate-200 text-slate-700 hover:bg-slate-300">
							Cancel
						</Button>
					</PopoverClose>
					<Button className="w-1/2 bg-rose-100 text-red hover:bg-rose-200">
						Refund
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default Refund;
