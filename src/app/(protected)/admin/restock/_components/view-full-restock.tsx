import { ArrowUpRight, Calendar, Printer } from 'lucide-react';
import { Poppins } from 'next/font/google';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import RecordEditor from '../../_components/record-editor';
import { RestockProps } from '../page';
import { Textarea } from '~/components/ui/textarea';
import RestockTable from './restock-table';


const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

const ViewFullRestock: React.FC<RestockProps> = ({
	restockId,
	date,
	supplier,
	addedStock,
	restockItem,
}) => {

	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showWarning, setShowWarning] = useState(false);

	const handleEdit = () => {
		setIsEditing((prev) => !prev);
		setShowWarning(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		console.log('Key pressed:', event.key);
		if (event.key === 'Escape') {
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
				if (!isEditing) {
					setIsDialogOpen(open);
				}
			}}
		>
			<DialogTrigger>
				<div className=' py-2 px-3 rounded-lg text-slate-400 hover:text-slate-500 tracking-wide hover:bg-slate-200 flex gap-2 items-center transition-colors duration-300' >
					View All
					<ArrowUpRight strokeWidth={2.5} className='w-4 h-4' />
				</div>
			</DialogTrigger>
			<DialogContent
				className="[&>button]:hidden !w-full !max-w-3xl"
				onKeyDown={handleKeyDown}
			>
				<DialogHeader
					className={`text-xl ${poppins.className} font-normal h-full`}
				>
					<div className='flex items-center justify-between'>
						<div className='flex flex-col justify-between h-full gap-2'>
							<DialogTitle className='font-normal text-xl text-slate-700'>
								#{restockId}
							</DialogTitle>
							<div className='flex items-center gap-3 text-slate-400'>
								<Calendar className='w-4 h-4' />
								<DialogDescription className='text-sm tracking-wide'>
									{date}
								</DialogDescription>
							</div>
						</div>
						<RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className='flex gap-3'>
					<div className='flex flex-col gap-2 group w-1/2'>
						<Label className='text-slate-400'>Supplier</Label>
						<div className='flex items-center focus-within:outline focus-within:outline-2 focus-within:outline-slate-200 rounded-lg'>
							<Input 
								className='shadow-none bg-slate-100 text-slate-700' 
								disabled={!isEditing} 
								defaultValue={supplier}
							/>
						</div>
					</div>
					<div className='flex flex-col gap-2 group w-1/2'>
						<Label className='text-slate-400'>Recorded by</Label>
						<div className='flex items-center focus-within:outline focus-within:outline-2 focus-within:outline-slate-200 rounded-lg'>
							<Input 
								className='shadow-none bg-slate-100 text-slate-700' 
								disabled={!isEditing}
								defaultValue={supplier}
							/>
						</div>
					</div>
				</div>
		
				<RestockTable restockItem={restockItem} isEditing={isEditing} />

				<Separator orientation="horizontal" className="h-[2px]" />

				<Textarea
					className="!min-h-16 border-none text-slate-700 bg-slate-100 resize-none focus:outline focus:outline-2 focus:outline-slate-200"
					placeholder="Your record notes..."
					disabled={!isEditing}
				/>

				<div className='flex items-center justify-between'>
					<div className='flex flex-col justify-between h-full gap-1'>
						<p className='font-normal text-base text-slate-700'>
							{addedStock}
						</p>
						<div className='flex items-center gap-3 text-slate-400'>
							<p className='text-sm tracking-wide'>Added Stock</p>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<DialogClose asChild disabled={isEditing}>
							<Button
								variant={'secondary'}
								className='hover:bg-slate-200 text-slate-700'
								disabled={isEditing}
							>
								Close
							</Button>
						</DialogClose>
						<Button
							className='bg-green hover:bg-green/80'
							disabled={isEditing}
						>
							<Printer />
							Print Invoice
						</Button>
					</div>
				</div>
				{showWarning && (
					<p className='text-orange-400 text-right text-sm'>
						Whoops! Don't forget to save your changes.
					</p>
				)}
			</DialogContent>
		</Dialog >
	)
}

export default ViewFullRestock