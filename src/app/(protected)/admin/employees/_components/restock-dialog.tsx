import { Box, Calendar, X } from 'lucide-react'
import { Poppins } from 'next/font/google'
import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/components/ui/hover-card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import EmployeeActivityCard from './employee-activity-card'

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "700"],
});

interface RestockDialogProps {
	restock: any;  // Add restock prop
	clerkId: string;  // Add clerkId prop
	activity: any;
	context: 'employee' | 'supplier';
}

// Define types for unit conversion
interface UnitConversion {
	from: string;
	count: number;
	to: string;
	price?: number;
}

// Define types for restock items
interface RestockItem {
	variant: string;
	item: string;
	brand: string;
	quantity: number;
	price: number;
	mainUnit: string;
	unitConversion: UnitConversion[];
}

// Simple UnitLine component for conversions
const UnitLine = ({ from, count, to, price }: UnitConversion) => {
	return (
		<div className='flex justify-between items-center w-full'>
			<p className='text-sm text-slate-500 flex items-center gap-2'>{from} = {count} {to}</p>
			<p className='text-sm text-slate-500'>₱{price?.toFixed(2) || '0.00'}</p>
		</div>
	);
};

const RestockDialog = ({ restock, clerkId, activity, context = 'employee' }: RestockDialogProps) => {
	const totalAdded = activity.batchVariants?.reduce(
		(sum: number, bv: any) => sum + bv.quantity, 0
	) || 0;

	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Format batch variants for the table
	const restockItems: RestockItem[] = activity.batchVariants?.map((bv: any) => {
		// Process unit conversions with price information
		const unitConversions = bv.SupplierUnit?.flatMap((supplierUnit: any) =>
			supplierUnit.ConversionRate?.map((rate: any) => ({
				from: rate.fromUnit?.name || 'unit',
				count: rate.conversion_rate || 1,
				to: rate.toUnit?.name || 'pcs',
				price: supplierUnit.price || 0
			}))
		) || [];

		return {
			variant: bv.variant?.name || 'Unknown Variant',
			item: bv.variant?.item?.name || 'Unknown Item',
			brand: bv.variant?.item?.brand?.name || 'Unknown Brand',
			quantity: bv.quantity || 0,
			price: bv.SupplierUnit?.[0]?.price || 0,
			mainUnit: bv.SupplierUnit?.[0]?.unit?.name || 'pcs',
			unitConversion: unitConversions
		};
	}) || [];

	// Get supplier name from the first batch variant's SupplierUnit
	const supplierName = activity.batchVariants?.[0]?.SupplierUnit?.[0]?.supplier?.Personal_Details?.company || 'Unknown Supplier';
	// Get clerk name from Personal_Details
	const clerkName = activity.Personal_Details ? 
		`${activity.Personal_Details.first_name} ${activity.Personal_Details.last_name}` : 
		'Unknown Clerk';

	return (
		<Dialog
			open={isDialogOpen}
			onOpenChange={(open) => {
				setIsDialogOpen(open);
			}}
		>
			<DialogTrigger>
				{context === 'supplier' ? (
					<div className='p-5 flex flex-col gap-4 hover:bg-slate-200/50 rounded-lg cursor-pointer transition-all duration-300'>
						<p className='text-slate-600 text-left'>#{activity.batch_number}</p>
						<div className="flex items-center gap-4 text-slate-400">
							<div className="flex items-center gap-3 text-slate-400">
								<Calendar className="h-4 w-4" />
								<p className="text-sm">
									{new Date(activity.created_at).toLocaleDateString()}
								</p>
							</div>
							<Separator orientation="vertical" className="h-6 w-[2px] bg-slate-200" />
							<div className="flex items-center gap-3">
								<Box className="h-4 w-4" />
								<p className="text-sm">{totalAdded} items</p>
							</div>
						</div>
					</div>
				) : (
					<EmployeeActivityCard
						type="restock"
						activity={{
							id: activity.batch_number,
							created_at: activity.created_at,
							quantity: totalAdded
						}}
					/>
				)}
			</DialogTrigger>

			<DialogContent
				className="flex max-h-[80%] !w-full !max-w-3xl flex-col [&>button]:hidden"
			>
				<DialogHeader className={`h-full text-xl ${poppins.className} font-normal`}>
					<div className="flex items-center justify-between">
						<div className="flex h-full flex-col justify-between gap-2">
							<DialogTitle className="text-xl font-normal text-slate-700">
								Restock #{activity.batch_number}
							</DialogTitle>
							<div className="flex items-center gap-3 text-slate-400">
								<Calendar className="h-4 w-4" />
								<DialogDescription className="text-sm tracking-wide">
									{new Date(activity.created_at).toLocaleDateString("en-US", {
										month: "long",
										day: "numeric",
										year: "numeric",
									})}
								</DialogDescription>
							</div>
						</div>
						<DialogClose asChild>
							<Button
								variant={"secondary"}
								className="h-12 w-12 text-slate-700"
							>
								<X className="!h-6 !w-6 text-slate-400" strokeWidth={2.5} />
							</Button>
						</DialogClose>
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="flex gap-3">
					<div className="flex w-full flex-col gap-2">
						<Label className="text-slate-400">
							{context === 'supplier' ? 'Recorded by' : 'Supplier'}
						</Label>
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							disabled={true}
							value={context === 'supplier' ? clerkName : supplierName}
						/>
					</div>
				</div>

				{/* Restock Table */}
				<div>
					<Table className="w-full table-fixed">
						<TableHeader className="sticky top-0 rounded-lg bg-slate-100">
							<TableRow className="border-none">
								<TableHead className="w-48 rounded-l-xl">Item</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Unit</TableHead>
								<TableHead>Conversions</TableHead>
								<TableHead className="rounded-r-xl">Price</TableHead>
							</TableRow>
						</TableHeader>
					</Table>
					<ScrollArea className="h-40" type="always">
						<Table className="w-full table-fixed">
							<TableBody>
								{restockItems.length > 0 ?
									(restockItems.map((item: RestockItem, index: number) => (
										<TableRow key={index} className="border-none text-slate-700">
											<TableCell className="rounded-l-xl w-48">
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger className="hover:cursor-text line-clamp-1 text-left">
															{item.item} - {item.brand} - {item.variant}
														</TooltipTrigger>
														<TooltipContent className="shadow-none text-slate-700">
															{item.item} - {item.brand} - {item.variant}
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</TableCell>
											<TableCell>{item.quantity}</TableCell>
											<TableCell>{item.mainUnit}</TableCell>
											<TableCell className="truncate">
												<HoverCard>
													<HoverCardTrigger className="hover:underline hover:cursor-default">
														{item.unitConversion.length} Conversions
													</HoverCardTrigger>
													<HoverCardContent className="shadow-none flex flex-col gap-3">
														{item.unitConversion.map((unit: UnitConversion, index: number) => (
															<UnitLine 
																key={index} 
																from={unit.from} 
																count={unit.count} 
																to={unit.to}
																price={unit.price} 
															/>
														))}
													</HoverCardContent>
												</HoverCard>
											</TableCell>
											<TableCell>₱{(item.price ?? 0).toFixed(2)}</TableCell>
										</TableRow>
									))) : (
										<TableRow>
											<TableCell colSpan={5} className='rounded-xl text-slate-700'>No items available...</TableCell>
										</TableRow>
									)}
							</TableBody>
						</Table>
					</ScrollArea>
				</div>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="flex items-center justify-between">
					<div className="flex flex-col">
						<p className="text-base font-normal text-slate-700">{totalAdded}</p>
						<p className="text-sm text-slate-400">Total Added Stock</p>
					</div>
					<div className="flex items-center gap-2">
						<DialogClose asChild>
							<Button variant="secondary" className="text-slate-700 hover:bg-slate-200">
								Close
							</Button>
						</DialogClose>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default RestockDialog