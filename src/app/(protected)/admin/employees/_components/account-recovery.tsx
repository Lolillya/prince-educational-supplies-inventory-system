import { Poppins } from 'next/font/google';
import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

const AccountRecovery = () => {

	const [isEditing, setIsEditing] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [isView, setIsView] = useState(false);

	const handleEdit = () => {
		setIsEditing((prev) => !prev);
		setShowWarning(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape" && isEditing) {
			setShowWarning(true);
			event.preventDefault();
		}
	};

	return (
		<Dialog
			open={isDialogOpen}
			onOpenChange={(open) => {
				if (!open && isEditing) {
					setShowWarning(true);
					return;
				}
				setIsDialogOpen(open);
				if (!open) {
					setShowWarning(false);
				}
			}}
		>
			<DialogTrigger asChild onClick={() => { setIsDialogOpen(true); setShowWarning(false) }}>
				<div className='bg-slate-200 text-slate-500 cursor-pointer hover:bg-orange-100 hover:text-orange-500 rounded-lg p-3 text text-center transition-all duration-300'>
					Recover Account
				</div>
			</DialogTrigger>
			<DialogContent
				className="!w-full !max-w-3xl [&>button]:hidden"
				onKeyDown={handleKeyDown}
			>
				<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
					<div className="flex flex-col gap-2">
						<DialogTitle className="text-xl font-normal text-slate-700">
							Account Recovery
						</DialogTitle>
						<div className="flex items-center gap-3 text-slate-400">
							<DialogDescription className="text-sm tracking-wide">
								Enter and confirm a new password to recover this employee's account.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="flex flex-col gap-2">
					<Label className="text-slate-400">Employee Username</Label>
					<div className="flex gap-3">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							placeholder="Username"
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label className="text-slate-400">New Password</Label>
					<div className="flex gap-3">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							placeholder="New Password"
							type='password'
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label className="text-slate-400">Confirm Password</Label>
					<div className="flex gap-3">
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							placeholder="Confirm Password"
							type='password'
						/>
					</div>
				</div>

				<Separator orientation="horizontal" className="h-[2px]" />
				
				{/* 
					//TODO: Fix warning bug--when cancel is clicked, warning should not show 
				// */}
				{showWarning && (
					<p className="text-right text-sm text-orange-400">
						Whoops! You have unsaved changes.
					</p>
				)}

				<div className='flex justify-end gap-3'>
					<DialogClose asChild onClick={() => setIsDialogOpen(false)}>
						<Button variant="secondary" className="text-slate-700 hover:bg-slate-200">
							Cancel
						</Button>
					</DialogClose>
					<Button className="bg-green hover:bg-green/80">
						Recover Account
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default AccountRecovery