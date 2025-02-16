import {AlertCircle, CheckCircle, Trash2} from "lucide-react";
import { Poppins } from "next/font/google";
import React, {useState} from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useRouter } from "next/navigation"
const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface DeleteProps {
	className?: string;
	recordInfo: string | null;
	recordType: string;
	variantId: number;
	onDelete: (variantId: number) => void;
	onVerifyPassword: (password: string) => Promise<boolean>;
}

const Delete: React.FC<DeleteProps> = ({ className, recordInfo, recordType, variantId, onDelete, onVerifyPassword, }) => {
	const router = useRouter();
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState<boolean>(false);

	const handleDelete = async () => {
		if (!password) {
			setError("Please enter your password to confirm.");
			return;
		}

		const isPasswordCorrect = await onVerifyPassword(password);
		if (!isPasswordCorrect) {
			setError("Incorrect password.");
			return;
		}

		try {
			 onDelete(variantId);
			setIsSuccess(true);
		} catch (error) {
			setError("Failed to delete the record.");
		}
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className={`group flex h-12 w-12 items-center justify-center rounded-xl bg-transparent hover:bg-rose-200/60 transition-all duration-300 ${className}`}
				>
					<Trash2 className="!h-5 !w-5 text-slate-500 group-hover:text-rose-500 transition-colors duration-300" strokeWidth={2.5} />
				</Button>
			</DialogTrigger>
			<DialogContent className="!w-full !max-w-3xl [&>button]:hidden">
				{isSuccess ? (
					<>
						<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
							<div className="flex flex-col gap-2">
								<DialogTitle className="text-xl font-normal text-slate-700">
									Record Deleted Successfully
								</DialogTitle>
								<div className="flex items-center gap-3 text-slate-400">
									<DialogDescription className="text-sm tracking-wide">
										The record <span className="font-bold">{recordInfo}</span> has been successfully deleted from <span className="font-bold">{recordType}</span>.
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>
						<Separator orientation="horizontal" className="h-[2px]" />
						<div className="flex items-center gap-2 mt-1">
							<CheckCircle className="text-green-500 w-5 h-5" />
							<p className="text-green-500">Record deleted successfully!</p>
						</div>
						<Separator orientation="horizontal" className="h-[2px]" />
						<div className="flex justify-end">
							<DialogClose asChild>
								<Button
									className="bg-green hover:bg-green/80"
									onClick={() => router.push("/admin/inventory")}
								>
									Close
								</Button>
							</DialogClose>
						</div>
					</>
				) : (
					<>
						<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
							<div className="flex flex-col gap-2">
								<DialogTitle className="text-xl font-normal text-slate-700">
									Delete Record
								</DialogTitle>
								<div className="flex items-center gap-3 text-slate-400">
									<DialogDescription className="text-sm tracking-wide">
										You're about to delete <span className="font-bold">{recordInfo}</span> from
										<span className="font-bold"> {recordType}</span>.
									</DialogDescription>
								</div>
							</div>
						</DialogHeader>

						<Separator orientation="horizontal" className="h-[2px]" />
						<div className="flex flex-col gap-2 mt-2">
							<Label className="text-slate-400">Enter your password to confirm</Label>
							<div className="flex gap-3">
								<Input
									className="bg-slate-100 text-slate-700 shadow-none"
									placeholder="Password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							<div className="flex items-center gap-2 mt-1">
								<AlertCircle className="text-rose-500 w-5 h-5" />
								<p className="text-rose-500">{error}</p>
							</div>
						</div>
						<Separator orientation="horizontal" className="h-[2px]" />
						<div className="flex justify-end gap-3">
							<DialogClose asChild>
								<Button variant="secondary" className="text-slate-700 hover:bg-slate-200">
									Cancel
								</Button>
							</DialogClose>
							<Button
								className="bg-red hover:bg-red/80"
								onClick={handleDelete}
							>
								Delete Record
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default Delete;
