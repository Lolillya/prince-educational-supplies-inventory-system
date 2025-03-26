import { Box, Calendar, Printer } from 'lucide-react'
import { Poppins } from 'next/font/google'
import React, { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Textarea } from '~/components/ui/textarea'
import RecordEditor from '../../_components/record-editor'
import RecordExpand from '../../_components/record-expand'
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

const RestockDialog = ({ restock, clerkId, activity, context = 'employee' }: RestockDialogProps) => {
	const totalAdded = activity.batchVariants?.reduce(
		(sum: number, bv: any) => sum + bv.quantity, 0
	) || 0;

	const [isEditing, setIsEditing] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showWarning, setShowWarning] = useState(false);

	// Get supplier name from the first batch variant's SupplierUnit
	const supplierName = activity.batchVariants?.[0]?.SupplierUnit?.[0]?.supplier?.Personal_Details?.company || 'Unknown Supplier';

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
				className="!w-full !max-w-3xl [&>button]:hidden"
				onKeyDown={handleKeyDown}
			>
				<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
					<div className="flex items-center justify-between">
						<div className="flex flex-col gap-2">
							<DialogTitle className="text-xl font-normal text-slate-700">
								Restock #{activity.batch_number}
							</DialogTitle>
							<div className="flex items-center gap-3 text-slate-400">
								<Calendar className="h-4 w-4" />
								<DialogDescription className="text-sm tracking-wide">
									{new Date(activity.created_at).toLocaleDateString()}
								</DialogDescription>
							</div>
						</div>
						<div className="flex items-center gap-3">
							{/*<RecordEditor isEditing={isEditing} handleEdit={handleEdit} />*/}
							{/*<RecordExpand />*/}
						</div>
					</div>
				</DialogHeader>

				<Separator orientation="horizontal" className="h-[2px]" />

				<div className="flex gap-3">
					{context === 'employee' && (
						<div className="flex w-1/2 flex-col gap-2">
							<Label className="text-slate-400">Supplier</Label>
							<Input
								className="bg-slate-100 text-slate-700 shadow-none"
								disabled={!isEditing}
								value={supplierName}
							/>
						</div>
					)}
					<div className={`flex ${context === 'employee' ? 'w-1/2' : 'w-full'} flex-col gap-2`}>
						<Label className="text-slate-400">Recorded by</Label>
						<Input
							className="bg-slate-100 text-slate-700 shadow-none"
							disabled={!isEditing}
							value={activity.Personal_Details ?
								`${activity.Personal_Details.first_name} ${activity.Personal_Details.last_name}` :
								'Unknown Clerk'
							}
						/>
					</div>
				</div>

				{/* Restock table placeholder */}
				<div className="mt-4">
					<p className="text-slate-500 text-sm">
						Restock Items ({(activity.batchVariants || []).length} variants)
					</p>
					<div className="mt-2 space-y-2">
						{activity.batchVariants?.map((bv: any) => (
							<div key={bv.batch_variant_id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
								<span>{bv.variant?.item?.brand?.name} {bv.variant?.item?.name}</span>
								<span>{bv.quantity} items</span>
							</div>
						))}
					</div>
				</div>

				<Separator orientation="horizontal" className="h-[2px]" />

				<Textarea
					className="!min-h-16 border-none text-slate-700 bg-slate-100 resize-none focus:outline focus:outline-2 focus:outline-slate-200"
					placeholder="Your record notes..."
					disabled={!isEditing}
				/>

				<div className="flex items-center justify-between">
					<div className="flex flex-col">
						<p className="text-base font-normal text-slate-700">{totalAdded}</p>
						<p className="text-sm text-slate-400">Total Added Stock</p>
					</div>
					<div className="flex items-center gap-2">
						<DialogClose asChild disabled={isEditing}>
							<Button variant="secondary" className="text-slate-700 hover:bg-slate-200" disabled={isEditing}>
								Close
							</Button>
						</DialogClose>
						<Button className="bg-green hover:bg-green/80" disabled={isEditing}>
							<Printer />
							Print Restock
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

export default RestockDialog

// import { Calendar, Printer } from 'lucide-react'
// import { Poppins } from 'next/font/google'
// import React, { useState } from 'react'
// import { Button } from '~/components/ui/button'
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
// import { Input } from '~/components/ui/input'
// import { Label } from '~/components/ui/label'
// import { Separator } from '~/components/ui/separator'
// import { Textarea } from '~/components/ui/textarea'
// import RecordEditor from '../../_components/record-editor'
// import RecordExpand from '../../_components/record-expand'
// import EmployeeActivityCard from './employee-activity-card'
//
// const poppins = Poppins({
// 	subsets: ["latin"],
// 	weight: ["400", "700"],
// });
//
// interface RestockDialogProps {
// 	activity: any;
// }
//
// const RestockDialog = ({ activity }: RestockDialogProps) => {
// 	const totalAdded = activity.batchVariants?.reduce(
// 		(sum: number, bv: any) => sum + bv.quantity, 0
// 	) || 0;
//
//
// 	const [isEditing, setIsEditing] = useState(false);
// 	const [isDialogOpen, setIsDialogOpen] = useState(false);
// 	const [showWarning, setShowWarning] = useState(false);
//
// 	const handleEdit = () => {
// 		setIsEditing((prev) => !prev);
// 		setShowWarning(false);
// 	};
//
// 	const handleKeyDown = (event: React.KeyboardEvent) => {
// 		if (event.key === "Escape" && isEditing) {
// 			setShowWarning(true);
// 			event.preventDefault();
// 		}
// 	};
//
// 	return (
//
// 		< Dialog
// 			open={isDialogOpen}
// 			onOpenChange={(open) => {
// 				if (!open) {
// 					if (isEditing) {
// 						setShowWarning(true);
// 						return;
// 					}
// 				}
// 				setIsDialogOpen(open);
// 				if (!open) {
// 					setShowWarning(false);
// 				}
// 			}}
// 		>
// 			<DialogTrigger>
// 				<EmployeeActivityCard
// 					type="restock"
// 					activity={{
// 						id: activity.batch_number,
// 						created_at: activity.created_at,
// 						quantity: activity.batchVariants?.reduce(
// 							(sum: number, bv: any) => sum + bv.quantity, 0
// 						) || 0
// 					}}
// 				/>
// 			</DialogTrigger>
// 			<DialogContent
// 				className="!w-full !max-w-3xl [&>button]:hidden"
// 				onKeyDown={handleKeyDown}
// 			>
// 				<DialogHeader className={`text-xl ${poppins.className} font-normal`}>
// 					<div className="flex items-center justify-between">
// 						<div className="flex flex-col gap-2">
// 							<DialogTitle className="text-xl font-normal text-slate-700">
// 								Restock #{activity.batch_number}
// 							</DialogTitle>
// 							<div className="flex items-center gap-3 text-slate-400">
// 								<Calendar className="h-4 w-4" />
// 								<DialogDescription className="text-sm tracking-wide">
// 									{new Date(activity.created_at).toLocaleDateString()}
// 								</DialogDescription>
// 							</div>
// 						</div>
// 						<div className="flex items-center gap-3">
// 							<RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
// 							<RecordExpand />
// 						</div>
// 					</div>
// 				</DialogHeader>
//
// 				<Separator orientation="horizontal" className="h-[2px]" />
//
// 				<div className="flex gap-3">
// 					<div className="flex w-1/2 flex-col gap-2">
// 						<Label className="text-slate-400">Supplier</Label>
// 						<Input
// 							className="bg-slate-100 text-slate-700 shadow-none"
// 							disabled={!isEditing}
// 							value={'supplier'}
// 						/> {/** Please pass real data here */}
// 					</div>
// 					<div className="flex w-1/2 flex-col gap-2">
// 						<Label className="text-slate-400">Recorded by</Label>
// 						<Input
// 							className="bg-slate-100 text-slate-700 shadow-none"
// 							disabled={!isEditing}
// 						/>
// 					</div>
// 				</div>
//
// 				{/* <RestockTable restockItem={} isEditing={isEditing} /> * Please pass real data here */}
// 				<p>
// 					Note: Gi tanggal ko ang RestockTable component and other functionality for now kay di ko sure kung tama ang pag reference sa db......... but this is how it should look like oke?
// 				</p>
//
// 				<Separator orientation="horizontal" className="h-[2px]" />
//
// 				<Textarea
// 					className="!min-h-16 border-none text-slate-700 bg-slate-100 resize-none focus:outline focus:outline-2 focus:outline-slate-200"
// 					placeholder="Your record notes..."
// 					disabled={!isEditing}
// 				/>
//
// 				<div className="flex items-center justify-between">
// 					<div className="flex flex-col">
// 						<p className="text-base font-normal text-slate-700">{500}</p> {/** Please pass real data here */}
// 						<p className="text-sm text-slate-400">Added Stock</p>
// 					</div>
// 					<div className="flex items-center gap-2">
// 						<DialogClose asChild disabled={isEditing}>
// 							<Button variant="secondary" className="text-slate-700 hover:bg-slate-200" disabled={isEditing}>
// 								Close
// 							</Button>
// 						</DialogClose>
// 						<Button className="bg-green hover:bg-green/80" disabled={isEditing}>
// 							<Printer />
// 							Print Restock
// 						</Button>
// 					</div>
// 				</div>
// 				{showWarning && (
// 					<p className="text-right text-sm text-orange-400">
// 						Whoops! Don't forget to save your changes.
// 					</p>
// 				)}
// 			</DialogContent>
// 		</Dialog >
// 	)
// }
//
// export default RestockDialog