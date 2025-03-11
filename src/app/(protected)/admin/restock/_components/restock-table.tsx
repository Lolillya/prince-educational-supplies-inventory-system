import { Button } from '~/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/components/ui/hover-card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import MoreOptions from '../../_components/more-options';
import { type RestockProps } from '../page';
import UnitLine from './unit-line';

const RestockTable = ({ restockItem, isEditing }: { restockItem: RestockProps['restockItems']; isEditing: boolean }) => {
	return (
		<div>
			<Table className="w-full table-fixed">
				<TableHeader className="sticky top-0 rounded-lg bg-slate-100">
					<TableRow className="border-none">
						<TableHead className="w-48 rounded-l-xl">Item</TableHead>
						<TableHead>Quantity</TableHead>
						<TableHead>Unit</TableHead>
						<TableHead>Conversions</TableHead>
						{isEditing ? (
							<>
								<TableHead>Price</TableHead>
								<TableHead className="rounded-r-xl w-20"></TableHead>
							</>
						) : (
							<TableHead className="rounded-r-xl">Price</TableHead>
						)}
					</TableRow>
				</TableHeader>
			</Table>
			<ScrollArea className="h-40" type="always">
				<Table className="w-full table-fixed">
					<TableBody>
						{restockItem.length > 0 ?
							(restockItem.map((item, index) => (
								<TableRow key={index} className="border-none text-slate-700">
									<TableCell className="rounded-l-xl w-48">
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger className="hover:cursor-text line-clamp-1 text-left">
													{item.brand} - {item.item} - {item.variant}
												</TooltipTrigger>
												<TooltipContent className="shadow-none text-slate-700">
													{item.brand} - {item.item} - {item.variant}
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
												{item.unitConversion.map((unit, index) => (
													<UnitLine key={index} from={unit.from} count={unit.count} to={unit.to} />
												))}
											</HoverCardContent>
										</HoverCard>
									</TableCell>
									{isEditing ? (
										<>
											<TableCell>₱{(item.price ?? 0).toFixed(2)}</TableCell>
											<TableCell className="rounded-r-xl w-20">
												<Popover>
													<PopoverTrigger>
														<MoreOptions className='!w-1 !h-1' />
													</PopoverTrigger>
													<PopoverContent className='shadow-none' popoverTarget=''>
														<p className='text-slate-700 font-medium'>{item.brand} - {item.item} - {item.variant}</p>
														<div className='mt-4 flex flex-col gap-2'>
															<div>
																<Label className="text-slate-400">Quantity</Label>
																<Input
																	className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
																	defaultValue={item.quantity}
																/>
															</div>
															<div>
																<Label className="text-slate-400">Price</Label>
																<Input
																	className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
																	defaultValue={item.price ?? 0}
																/>
															</div>
														</div>
														<div className="mt-4 w-full flex gap-2">
															<Button className='w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700'>
																Cancel
															</Button>
															<Button className='w-1/2 bg-teal-100 hover:bg-teal-200 text-green'>
																Update
															</Button>
														</div>
														<Separator className='mt-4' />
														<div className="mt-4 w-full">
															<Button className='w-full bg-rose-100 hover:bg-rose-200 text-red'>
																Void Item
															</Button>
														</div>
													</PopoverContent>
												</Popover>
											</TableCell>
										</>
									) : (
										<TableCell className="rounded-r-xl">₱{(item.price ?? 0).toFixed(2)}</TableCell>
									)}
								</TableRow>
							))
							) : (
								<TableRow>
									<TableCell colSpan={5} className='rounded-xl text-slate-700'>No items available...</TableCell>
								</TableRow>
							)
						}
					</TableBody>
				</Table>
			</ScrollArea>
		</div>
	);
};

export default RestockTable;