import { Calendar, Printer } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import RecordEditor from '../../_components/record-editor';
import RecordExpand from '../../_components/record-expand';
import PayablesInfo from './payables-info';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface PayablesProps {
	sum: number | 0;
}

const Payables = ({ sum }: PayablesProps) => {

	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showWarning, setShowWarning] = useState(false);

	const handleEdit = () => {
		setIsEditing((prev) => !prev);
		setShowWarning(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		console.log("Key pressed:", event.key); // Log the key pressed
		if (event.key === "Escape") {
			if (isEditing) {
				setShowWarning(true);
				event.preventDefault();
			}
		}
	};

	return (
		<Dialog
			open={isDialogOpen}
			onOpenChange={(open) => {
				if (!open) {
					if (isEditing) {
						setShowWarning(true);
						return;
					}
				}
				setIsDialogOpen(open);
				if (!open) {
					setShowWarning(false);
				}
			}}
		>
			<DialogTrigger>
				<PayablesInfo sum={sum} />
			</DialogTrigger>
			<DialogContent
				className="flex max-h-[80%] !w-full !max-w-3xl flex-col [&>button]:hidden"
				onKeyDown={handleKeyDown}
			>
				<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
					<div className="flex items-center justify-between">
						<div className='flex gap-5 items-center'>
							<Avatar className='h-16 w-16 !rounded-lg'>
								<AvatarFallback className="bg-black text-slate-700 !rounded-lg text-3xl">
									🎭
								</AvatarFallback>
							</Avatar>
							<div className='flex flex-col gap-2'>
								<DialogTitle className='text-slate-700 text-xl font-normal'>
									LilyCo {/** Please pass real data here */}
								</DialogTitle>
								<p className='text-slate-400 text-sm'>
									0123456789 {/** Please pass real data here */}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
							<RecordExpand />
						</div>
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />

				<p>
					Note: Mag add pa diri table similar to the ones so far. This will show data na nag order and pay si customer. Refer to figma file. 
				</p>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="flex items-center justify-between">
					<div className="flex h-full flex-col justify-between gap-1">
						<p className="text-base font-normal text-slate-700">
							₱{5000} {/** Please pass real data here */}
						</p>
						<p className=" text-slate-400 text-sm tracking-wide">Unpaid Amount</p> 
					</div>
					<div className="flex items-center gap-2">
						<DialogClose asChild disabled={isEditing}>
							<Button
								variant={"secondary"}
								className="text-slate-700 hover:bg-slate-200"
								disabled={isEditing}
							>
								Close
							</Button>
						</DialogClose>
						<Button className="bg-green hover:bg-green/80" disabled={isEditing}>
							<Printer />
							Print Statement
						</Button>
					</div>
				</div>
				{showWarning && (
					<p className="text-right text-sm text-orange-400">
						Whoops! Don't forget to save your changes.
					</p>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default Payables