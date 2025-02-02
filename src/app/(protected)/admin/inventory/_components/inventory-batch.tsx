import { TooltipContent } from '@radix-ui/react-tooltip'
import { ArrowBigRightDash, ArrowUpRight, Box, Calendar, Hash, IdCard, Printer, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import { Tooltip, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import RestockTable from '../../restock/_components/restock-table'
import RecordEditor from '../../_components/record-editor'
import RecordExpand from '../../_components/record-expand'
import { useState } from 'react'
import { Poppins } from 'next/font/google'
import BatchTable from './inventory-batch-table'

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface InventoryBatchProps {
	restockId: number;
	date: string;
	employee: string;
	addedStock: number;
	restockData?: any;
}

const InventoryBatch = () => {

	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showWarning, setShowWarning] = useState(false);

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
		<div className='p-5 bg-white/60 rounded-lg text-slate-400'>
			<div className='flex items-center justify-between'>
				<Link href={''}>
					<div className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500'>
						Batches
						<ArrowUpRight className='w-4 h-4' />
					</div>
				</Link>
				<p className='text-slate-400 text-sm pr-5'>
					5 of 320
				</p>
			</div>
			<div className='mt-2'>
				<div className="flex flex-col gap-1">
					{/* //TODO: map restock data based on selected supplier */}
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
							<InventoryBatchCard />
						</DialogTrigger>
						<DialogContent
							className="!w-full !max-w-3xl [&>button]:hidden"
							onKeyDown={handleKeyDown}
						>
							<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
								<div className="flex items-center justify-between">
									<div className="flex flex-col gap-2">
										<DialogTitle className="text-xl font-normal text-slate-700">
											Batch 1 {/** Please pass real data here */}
										</DialogTitle>
										<div className="flex items-center gap-3 text-slate-400">
											<Hash className="h-4 w-4" />
											<DialogDescription className="text-sm tracking-wide">
												12345678 {/** Please pass real data here */}
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

							<BatchTable />

							<Separator orientation="horizontal" className="h-[2px]" />

							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<p className="text-base font-normal text-slate-700">{300}</p> {/** Please pass real data here */}
									<p className="text-sm text-slate-400">Remaining Stock</p>
								</div>
								<div className="flex items-center gap-2">
									<DialogClose asChild disabled={isEditing}>
										<Button variant="secondary" className="text-slate-700 hover:bg-slate-200" disabled={isEditing}>
											Close
										</Button>
									</DialogClose>
									<Button className="bg-green hover:bg-green/80" disabled={isEditing}>
										<Printer />
										Print Batch
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
					<Separator orientation="horizontal" className="h-[1px]" />
				</div>
			</div>
			<div className='mt-4'>
				<p className='text-center hover:underline cursor-pointer'>Show more</p>
			</div>
		</div>
	)
}

const InventoryBatchCard = () => {
	// TODO: reflect restock data based on selected supplier
	return (
		<div className='p-5 flex flex-col gap-4 hover:bg-slate-200/50 rounded-lg cursor-pointer transition-all duration-300'>
			<div className='flex items-baseline gap-4'>
				<p className='text-slate-600 text-left'>Batch 1</p>
				<p className='text-emerald-500 text-left text-sm'>Sufficient Stock</p>
			</div>
			<div className="flex items-center gap-3 flex-grow overflow-hidden">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Hash className="h-4 w-4" />
						</TooltipTrigger>
						<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
							From restock record 12345678
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<p className="text-sm truncate">12345678</p>
			</div>
			<div className="flex items-center gap-4 text-slate-400">
				<div className="flex items-center gap-3">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Box className="h-4 w-4" />
							</TooltipTrigger>
							<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
								300 remaining stock
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<p className="text-sm">300 Bundles</p>
					<Separator
						orientation="vertical"
						className="h-6 w-[2px] bg-slate-200"
					/>
					<div className="flex items-center gap-3 text-slate-400">
						<p className="text-sm">2 Conversions</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default InventoryBatch