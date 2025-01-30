import { Poppins } from 'next/font/google'
import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import Edit from '../../_components/edit'
import RecordEditor from '../../_components/record-editor'
import RecordExpand from '../../_components/record-expand'

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

const EditRecord = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showWarning, setShowWarning] = useState(false);

	const handleEdit = () => {
		setIsEditing((prev) => !prev);
		setShowWarning(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape") {
			if (isEditing) {
				setShowWarning(true);
				event.preventDefault();
				event.stopPropagation();
			} else {
				setIsDialogOpen(false);
			}
		}
	};

	const handleDialogOpenChange = (open: boolean) => {
		if (!open && isEditing) {
			setShowWarning(true);
			return;
		}

		setIsDialogOpen(open);

		if (open) {
			setIsEditing(true);
		} else {
			setIsEditing(false);
			setShowWarning(false);
		}
	};

	return (
		<div>
			<Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
				<DialogTrigger>
					<Edit />
				</DialogTrigger>
				<DialogContent
					className="!w-full !max-w-3xl [&>button]:hidden"
					onKeyDown={handleKeyDown}
				>
					<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-5">
								<Avatar className="h-16 w-16 !rounded-lg">
									<AvatarFallback className="bg-black text-slate-700 !rounded-lg text-3xl">
										🎭
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col gap-2">
									<DialogTitle className="text-xl font-normal text-slate-700">
										LilyCo
									</DialogTitle>
									<div className="flex items-center gap-3 text-slate-400">
										<DialogDescription className="text-sm tracking-wide">
											0000000001
										</DialogDescription>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
								<RecordExpand />
							</div>
						</div>
					</DialogHeader>

					<Separator orientation="horizontal" className="h-[2px]" />

					<div className="flex flex-col gap-2">
						<Label className="text-slate-400">Representative</Label>
						<div className="flex gap-3">
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="First name"
							/>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="Last name"
							/>
						</div>
					</div>

					<div className="flex gap-3">
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Contact Number</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="+63"
							/>
						</div>
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Email</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="example@email.com"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label className="text-slate-400">Street Address</Label>
						<div className="flex gap-3">
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="Street Address"
							/>
						</div>
					</div>

					<div className="flex gap-3">
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">City</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="City"
							/>
						</div>
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Region</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="Region"
							/>
						</div>
					</div>

					<div className="flex gap-3">
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Country</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="Country"
							/>
						</div>
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Postal Code</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="0000"
							/>
						</div>
					</div>

					<Separator orientation="horizontal" className="h-[2px]" />

					<Textarea
						className="!min-h-16 border-none text-slate-700 bg-slate-100 resize-none focus:outline focus:outline-2 focus:outline-slate-200"
						placeholder="Your record notes..."
						disabled={!isEditing}
					/>

					{showWarning && (
						<p className="text-right text-sm text-orange-400">
							Whoops! Don't forget to save your changes.
						</p>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EditRecord;