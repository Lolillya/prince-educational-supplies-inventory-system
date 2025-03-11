import { AlertCircle } from "lucide-react";
import { Poppins } from "next/font/google";
import React from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface ClearListProps {
	className?: string;
	recordType: string;
}

const ClearList: React.FC<ClearListProps> = ({
	recordType,
}) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red" onSelect={(e) => e.preventDefault()}>
					Clear List
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="!w-full !max-w-3xl [&>button]:hidden">
				<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
					<div className="flex flex-col gap-2">
						<DialogTitle className="text-xl font-normal text-slate-700">
							Clear {recordType}
						</DialogTitle>
						<div className="flex items-center gap-3 text-slate-400">
							<DialogDescription className="text-sm tracking-wide">
								<p>
									You're about to clear every record from <span className="font-bold">{recordType}</span>.
								</p>
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="mt-2 flex flex-col gap-2">
					<Label className="text-slate-400">
						Enter your password to confirm
					</Label>
					<div className="flex gap-3">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							placeholder="Password"
						/>
					</div>
					<div className="mt-1 flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-rose-500" />
						<p className="text-rose-500">This action is irreversible!</p>
					</div>
				</div>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="flex justify-end gap-3">
					<DialogClose asChild>
						<Button
							variant="secondary"
							className="text-slate-700 hover:bg-slate-200"
						>
							Cancel
						</Button>
					</DialogClose>
					<Button className="bg-red hover:bg-red/80">Clear {recordType}</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ClearList;
