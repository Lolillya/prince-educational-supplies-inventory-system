import { Trash2 } from "lucide-react";
import { Poppins } from "next/font/google";
import React from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface DeleteProps {
	className?: string;
	recordInfo: string | null;
	recordType: string;
}

const Delete: React.FC<DeleteProps> = ({ className, recordInfo, recordType }) => {
	return (
		<Dialog>
			<DialogTrigger>
				<Button
					variant="ghost"
					className={`group flex h-12 w-12 items-center justify-center rounded-xl bg-transparent hover:bg-rose-200/60 transition-all duration-300 ${className}`}
				>
					<Trash2 className="!h-5 !w-5 text-slate-500 group-hover:text-rose-500 transition-colors duration-300" strokeWidth={2.5} />
				</Button>
			</DialogTrigger>
			<DialogContent
				className="!w-full !max-w-3xl [&>button]:hidden"
			>
				<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
					<div className="flex flex-col gap-2">
						<DialogTitle className="text-xl font-normal text-slate-700">
							Delete Record
						</DialogTitle>
						<div className="flex items-center gap-3 text-slate-400">
							<DialogDescription className="text-sm tracking-wide mt-2">
								<p>You're about to delete <span className="font-bold">{recordInfo}</span> from <span className="font-bold">{recordType}</span>.</p>
								<p className="text-rose-500 pt-1">This action is irreversible!</p>
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="flex flex-col gap-2 mt-2">
					<div className="flex gap-3">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							placeholder="Enter your password to confirm"
						/>
					</div>
				</div>

				<div className='flex justify-end gap-3'>
					<DialogClose asChild>
						<Button variant="secondary" className="text-slate-700 hover:bg-slate-200">
							Cancel
						</Button>
					</DialogClose>
					<Button className="bg-red hover:bg-red/80">
						Delete Record
					</Button>
				</div>


			</DialogContent>
		</Dialog>
	);
};

export default Delete;
