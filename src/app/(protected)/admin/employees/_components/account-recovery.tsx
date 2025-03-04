import { Poppins } from 'next/font/google';
import React, {useEffect, useState} from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import {api} from "~/trpc/react";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface AccountRecoveryProps {
	username?: string;
	personalDetailsId?: string;
}

const AccountRecovery = ({ username, personalDetailsId }: AccountRecoveryProps) => {

	const [isEditing, setIsEditing] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [isView, setIsView] = useState(false);

	const [usernameInput, setUsernameInput] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const utils = api.useUtils();
	const updatePasswordMutation = api.employees.updatePassword.useMutation({
		onSuccess: () => {
			utils.employees.list.invalidate();
		},
	});

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

	const handleSubmit = async () => {
		setErrorMessage("");
		setSuccessMessage("");

		if (!username || !personalDetailsId) {
			setErrorMessage("Employee data is missing");
			return;
		}

		if (usernameInput !== username) {
			setErrorMessage("Username does not match this employee");
			return;
		}

		if (newPassword !== confirmPassword) {
			setErrorMessage("Passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			setErrorMessage("Password must be at least 6 characters");
			return;
		}

		try {
			await updatePasswordMutation.mutateAsync({
				personalDetailsId,
				newPassword,
			});
			setSuccessMessage("Password updated successfully!");

			// Reset form and close dialog after 1 second
			setTimeout(() => {
				setIsDialogOpen(false);
				setUsernameInput("");
				setNewPassword("");
				setConfirmPassword("");
			}, 1000);

		} catch (error) {
			setErrorMessage("Failed to update password. Please try again.");
		}
	};

	// Add this effect to clear messages when dialog closes
	useEffect(() => {
		if (!isDialogOpen) {
			setErrorMessage("");
			setSuccessMessage("");
		}
	}, [isDialogOpen]);


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
							value={usernameInput}
							onChange={(e) => setUsernameInput(e.target.value)}
							placeholder="Enter employee username"
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label className="text-slate-400">New Password</Label>
					<div className="flex gap-3">
						<Input
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							type="password"
							placeholder="At least 6 characters"
						/>

					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label className="text-slate-400">Confirm Password</Label>
					<div className="flex gap-3">
						<Input
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							type="password"
							placeholder="Re-enter new password"
						/>
					</div>
				</div>

				{errorMessage && (
					<p className="text-rose-500 text-sm">{errorMessage}</p>
				)}

				{successMessage && (
					<p className="text-emerald-500 text-sm">{successMessage}</p>
				)}

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
					<Button
						onClick={handleSubmit}
						disabled={updatePasswordMutation.isPending}
					>
						{updatePasswordMutation.isPending ? "Updating..." : "Recover Account"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default AccountRecovery