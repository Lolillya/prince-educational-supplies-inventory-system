import React from 'react';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "~/components/ui/accordion";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "~/components/ui/table";
import Link from 'next/link';

const BatchAccordion = ({ batch }) => {
	return (
		<div className='flex w-full bg-white rounded-xl'>
			{/* Display Batch ID */}
			<div className='h-auto w-3 bg-red-200 rounded-l-xl'></div>
			<div className='flex-grow'>
				<Accordion type="single" collapsible>
					<AccordionItem value={`batch-${batch?.batch_id}`}>
						<AccordionTrigger className='px-4 hover:no-underline'>
							<p>
								{/* Display supplier name */}
								{batch?.supplierUnits?.[0]?.supplier?.personal_details?.first_name} {batch?.supplierUnits?.[0]?.supplier?.personal_details?.last_name || 'Unknown Supplier'}
								<span className='pl-3'>
                                    <Link href='#' className='text-gray-400 hover:underline'>
                                        #{batch?.batch_id || 'N/A'}
                                    </Link>
                                </span>
							</p>
						</AccordionTrigger>
						<AccordionContent className='px-4'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Unit</TableHead>
										<TableHead>Conversion</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Qty.</TableHead>
										<TableHead>Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{/* Safeguard against missing supplierUnits */}
									{batch?.supplierUnits?.length > 0 ? (
										batch.supplierUnits.map((supplierUnit, index) => (
											<TableRow key={index}>
												<TableCell>{supplierUnit.unit?.name || 'Unknown Unit'}</TableCell>
												<TableCell>
													{/* Filter and display conversion rates */}
													{supplierUnit.ConversionRate && supplierUnit.ConversionRate.length > 0 ? (
														supplierUnit.ConversionRate
															.filter(conversionRate => conversionRate.fromUnit.name === supplierUnit.unit.name)
															.map((conversionRate, rateIndex) => (
																<div key={rateIndex}>
																	> {conversionRate.conversion_rate} {conversionRate.toUnit.name}
																</div>
															))
													) : (
														<span>N/A</span> // Fallback message if no conversion rates exist
													)}
												</TableCell>
												<TableCell>P {supplierUnit.price?.toFixed(2) || 'N/A'}</TableCell>
												<TableCell>{supplierUnit.quantity_per_unit || 'N/A'}</TableCell>
												<TableCell>
													<Link href='#' className={`text-green-500 hover:underline ${supplierUnit.quantity_per_unit ? '' : 'text-gray-500 hover:cursor-default'}`}>
														Out to office
													</Link>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-4">No supplier units available.</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
};

export default BatchAccordion;
