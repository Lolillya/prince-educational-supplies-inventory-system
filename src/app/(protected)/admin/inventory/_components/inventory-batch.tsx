import { TooltipContent } from '@radix-ui/react-tooltip'
import { ArrowLeft, ArrowUpRight, Box, Hash } from 'lucide-react'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import {HoverCard, HoverCardContent, HoverCardTrigger} from "~/components/ui/hover-card";
import UnitLine from "~/app/(protected)/admin/restock/_components/unit-line";
import RecordEditor from '../../_components/record-editor'
import AddBatchLine from './add-batch-line'
import BatchLineItem from './batch-line-item'
import OutToOffice from './out-to-office'
import { useRouter } from "next/navigation";
import {ConversionRate, SupplierUnit} from "@prisma/client";


const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface BatchVariant {
	batch_variant_id: string;
	variant_id: number; // Add missing field
	quantity: number;
	SupplierUnit?: {
		supplier_unit_id: string;
		quantity_per_unit: number;
		price: number;
		ConversionRate?: {
			conversion_id: string;
			conversion_rate: number;
			fromUnit?: { name: string };
			toUnit?: { name: string };
		}[];
		unit?: { name: string };
	}[];
	batch: {
		batch_id: string;
		batch_code: string;
	};
}

interface InventoryBatchProps {
	restockId: number;
	date: string;
	employee: string;
	addedStock: number;
	restockData?: any;
	batchVariants: BatchVariant[];
	selectedVariantId: number;
}


interface Unit {
	supplier_id: string;
	unit_name: string;
	quantity_per_unit: number;
}

const InventoryBatch = ({ batchVariants, selectedVariantId }: InventoryBatchProps) => {

	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [selectedBatchNumber, setSelectedBatchNumber] = useState<number | null>(null);
	const [showAllBatches, setShowAllBatches] = useState(false);
	const visibleBatches = showAllBatches ? batchVariants : batchVariants.slice(0, 2);

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

	const handleBatchClick = (batchNumber: number) => {
		setSelectedBatchNumber(batchNumber);
	};

	const handleShowMore = () => {
		setShowAllBatches((prev) => !prev);
	};

	const handleEditBatch = (id: number) => {
		router.push(`/admin/inventory/edit-batch/${id}`);
	};

	return (
		<div className='p-5 bg-white/60 rounded-lg text-slate-400'>
			<div className='flex items-center justify-between'>
				<Dialog>
					<DialogTrigger asChild>
						<Link href={''}>
							<div
								className='w-fit flex items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500'>
								Batches
								<ArrowUpRight className='w-4 h-4'/>
							</div>
						</Link>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle className="text-center font-bold">
							Verify it's you!
						</DialogTitle>

						<div className="flex flex-col gap-1">
							<Label className="text-textGray">Password</Label>
							<Input
								placeholder="Enter Password"
								className="p-6 placeholder:text-textGray"
							/>
						</div>
						<div className="flex justify-center gap-3">
							<Button
								size={"lg"}
								onClick={(e) => {
									e.stopPropagation();
									if (selectedVariantId) {
										handleEditBatch(selectedVariantId);
									} else {
										console.error("No item selected to continue.");
									}
								}}
							>
								Continue
							</Button>
						</div>
					</DialogContent>
				</Dialog>
				<p className='text-slate-400 text-sm pr-5'>
					{visibleBatches.length} of {batchVariants.length} Batches
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
							{visibleBatches.map((batchVariant, index) => {
								// Filter SupplierUnit and ConversionRate data for the selected batch
								const supplierUnits = batchVariant.batch?.batchVariants
									?.filter((bv) => bv.batch_variant_id === batchVariant.batch_variant_id) // Filter by batch_variant_id
									.flatMap((bv) => bv.SupplierUnit || []) || [];

								const unitConversions = supplierUnits.flatMap(
									(unit) => unit.ConversionRate || []
								);

								// Debugging: Log extracted data
								console.log('Batch Variant:', batchVariant);
								console.log('Supplier Units:', supplierUnits);
								console.log('Unit Conversions:', unitConversions);

								return (
									<InventoryBatchCard
										key={batchVariant.batch_variant_id}
										batchVariant={batchVariant}
										batchNumber={index + 1}
										onClick={() => handleBatchClick(index + 1)}
										supplierUnit={supplierUnits}
										unitConversion={unitConversions}
									/>
								);
							})}
						</DialogTrigger>
						<DialogContent
							className="!w-full !max-w-2xl [&>button]:hidden"
							onKeyDown={handleKeyDown}
						>
							<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
								<div className="flex items-center justify-between">
									<div className="flex flex-col gap-2">
										<DialogTitle className="text-xl font-normal text-slate-700">
											<span>{selectedBatchNumber ? `Batch ${selectedBatchNumber}` : 'Batch Details'}</span>
										</DialogTitle>
										<div className="flex items-center gap-3 text-slate-400">
											<Hash className="h-4 w-4" />
											<DialogDescription className="text-sm tracking-wide">
												{/*{selectedBatchNumber*/}
												{/*	? `ID: ${batchVariants[selectedBatchNumber - 1]?.batch?.batch_id || 'N/A'}, */}
												{/*	Code: ${batchVariants[selectedBatchNumber - 1]?.batch?.batch_code || 'N/A'}`*/}
												{/*	: 'ID: N/A, Code: N/A'}*/}
												{batchVariants[selectedBatchNumber - 1]?.batch?.batch_code || 'N/A'}
											</DialogDescription>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
									</div>
								</div>
							</DialogHeader>

							<Separator orientation="horizontal" className="h-[2px]" />

							<div className="flex flex-col gap-3">
								<div className="flex gap-3 items-center">
									<div className="group flex w-1/2 flex-col gap-2">
										<Label className="text-slate-400">Unit</Label>
										<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
											<Input
												className="bg-slate-100 text-slate-700 shadow-none"
												disabled={!isEditing}
												defaultValue={'Unit'}
											/> {/** Please pass real data here */}
										</div>
									</div>
									<Separator orientation="vertical" className="h-14 w-[1px]" />
									<div className="group flex w-1/2 items-end gap-2">
										<div className="flex flex-col gap-1 w-1/2">
											<Label className="text-slate-400">Stock</Label>
											<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
												<Input
													className="bg-slate-100 text-slate-700 shadow-none"
													disabled={!isEditing}
													defaultValue={'Stock'}
												/>
											</div>
										</div>
										<div className="flex flex-col gap-1 w-1/2">
											<Label className="text-slate-400">Price per unit</Label>
											<div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
												<Input
													className="bg-slate-100 text-slate-700 shadow-none"
													disabled={!isEditing}
													defaultValue={'Price'}
												/>
											</div>
										</div>
										<div className='!p-1 w-12 h-10 flex items-center justify-center'>
											<TooltipProvider>
												<Tooltip delayDuration={300}>
													<TooltipTrigger asChild>
														<ArrowLeft className='!w-5 !h-5 text-slate-400' strokeWidth={2.5} />
													</TooltipTrigger>
													<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
														This is your main unit.
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</div>
									</div>
								</div>
								<div className="border-b-[3px] border-dashed border-slate-200" />
								<ScrollArea className='h-52'>
									<div className="flex flex-col gap-4">
										<BatchLineItem isEditing={isEditing} />
										<BatchLineItem isEditing={isEditing} />
										{isEditing && (
											<AddBatchLine />
										)}
									</div>
								</ScrollArea>
							</div>

							<Separator orientation="horizontal" className="h-[2px]" />

							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<p className="text-base font-normal text-slate-700">
										{selectedBatchNumber
											? batchVariants[selectedBatchNumber - 1]?.quantity ?? 'N/A'
											: 'N/A'}
									</p>
									<p className="text-sm text-slate-400">Remaining Stock</p>
								</div>
								<div className="flex items-center gap-2">
									<DialogClose asChild disabled={isEditing}>
									<Button variant="secondary" className="text-slate-700 hover:bg-slate-200" disabled={isEditing}>
											Close
										</Button>
									</DialogClose>
									<OutToOffice isEditing={isEditing} />
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
				<p
					className='text-center hover:underline cursor-pointer'
					onClick={handleShowMore}
				>
					{showAllBatches ? 'Show less' : 'Show more'}
				</p>
			</div>
		</div>
	)
}

interface InventoryBatchCardProps {
	batchVariant: BatchVariant;
	batchNumber: number;
	onClick: () => void;
	supplierUnit: SupplierUnit[]; // Add supplierUnit prop
	unitConversion: ConversionRate[]; // Add unitConversion prop
}

const InventoryBatchCard = ({
								batchVariant,
								batchNumber,
								onClick,
								supplierUnit,
								unitConversion,
							}: InventoryBatchCardProps) => {
	// Debugging: Log supplierUnit and unitConversion data
	console.log('SupplierUnit Data:', supplierUnit);
	console.log('UnitConversion Data:', unitConversion);

	// Get the main first supplier unit
	const mainSupplierUnit = supplierUnit[0];

	// TODO: reflect restock data based on selected supplier
	return (
		<div
			className='p-5 flex flex-col gap-4 hover:bg-slate-200/50 rounded-lg cursor-pointer transition-all duration-300'>
			<p className='text-slate-600 text-left'>Batch {batchNumber}</p>
			<div className="flex items-center gap-3 flex-grow overflow-hidden">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Hash className="h-4 w-4"/>
						</TooltipTrigger>
						<TooltipContent
							className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
							From restock record {batchVariant.batch?.batch_code || 'N/A'}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<p className="text-sm truncate">
					{/*ID: {batchVariant.batch?.batch_id || 'N/A'}, Code: */}
					{batchVariant.batch?.batch_code || 'N/A'}
				</p>
			</div>
			<div className="flex items-center gap-4 text-slate-400">
				<div className="flex items-center gap-3">
					<TooltipProvider>
						<Tooltip>
						<TooltipTrigger asChild>
								<Box className="h-4 w-4" />
							</TooltipTrigger>
							<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
								{batchVariant.quantity ?? 'N/A'} remaining stock
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<p className="text-sm">
						{mainSupplierUnit.quantity_per_unit} {mainSupplierUnit.unit?.name || 'N/A'}
					</p>
					<Separator
						orientation="vertical"
						className="h-6 w-[2px] bg-slate-200"
					/>
					<div className="flex items-center gap-3 text-slate-400">
						<HoverCard>
							<HoverCardTrigger className="text-sm hover:underline">
								{unitConversion.length} Conversions
							</HoverCardTrigger>
							<HoverCardContent className="flex flex-col gap-3 shadow-none">
								{unitConversion.map((unit, index) => (
									<UnitLine
										key={index}
										from={unit.fromUnit?.name || 'N/A'}
										count={unit.conversion_rate}
										to={unit.toUnit?.name || 'N/A'}
									/>
								))}
							</HoverCardContent>
						</HoverCard>
					</div>
				</div>
			</div>
		</div>
	)
}

export default InventoryBatch