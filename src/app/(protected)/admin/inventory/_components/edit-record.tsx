import { Hash } from 'lucide-react'
import { Poppins } from 'next/font/google'
import React, { useState } from 'react'
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
							<div className="flex flex-col gap-2">
								<DialogTitle className="text-xl font-normal text-slate-700">
									Variant {/** Please pass real data here */}
								</DialogTitle>
								<div className="flex items-center gap-3 text-slate-400">
									<Hash className="h-4 w-4" />
									<DialogDescription className="text-sm tracking-wide">
										00000001 {/** Please pass real data here */}
									</DialogDescription>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
								<RecordExpand />
							</div>
						</div>
					</DialogHeader>

					<Separator orientation="horizontal" className="h-[2px]" />

					<div className="flex gap-3">
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Variant</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="Variant"
							/>
						</div>
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Item</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="Item"
							/>
						</div>
					</div>

					<div className="flex gap-3">
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Brand</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="Brand"
							/>
						</div>
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Category</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								placeholder="Category"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<Label className="text-slate-400">Stock Level</Label>
						<div className="flex gap-3">
							<div className='flex items-center w-1/2'>
								<div className='h-full w-1 bg-amber-300 rounded-l-lg'/>
								<Input
									className="bg-slate-100 text-slate-700 shadow-none rounded-l-none"
									disabled={!isEditing}
									placeholder="Low"
								/>
							</div>
							<div className='flex items-center w-1/2'>
								<div className='h-full w-1 bg-rose-400 rounded-l-lg' />
								<Input
									className="bg-slate-100 text-slate-700 shadow-none rounded-l-none"
									disabled={!isEditing}
									placeholder="Very Low"
								/>
							</div>
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