import React from "react";

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
import Link from "next/link";

const BatchAccordion = ({ batch }) => {
  return (
      <div className="flex w-full flex-col gap-3 rounded-xl">
        {/* Display Batch ID */}

        <div className="flex flex-grow justify-between rounded-lg bg-white">
          <div className="flex w-10 items-center justify-center rounded-l-lg rounded-r-none bg-rose-200">
            <span className="text-2xl text-red">{batch?.batch_id}</span>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value={`batch-${batch?.batch_id}`}>
              <AccordionTrigger className="px-4 hover:no-underline">
                <p>
                  {/* Display supplier name */}
                  {batch?.supplierUnits?.[0]?.supplier?.Personal_Details?.first_name}{" "}
                  {batch?.supplierUnits?.[0]?.supplier?.Personal_Details?.last_name || "Unknown Supplier"}
                  <span className="pl-3">
    <Link href="#" className="text-gray-400 hover:underline">
      #{batch?.batch_id || "N/A"}
    </Link>
  </span>
                </p>

              </AccordionTrigger>
              <AccordionContent className="flex px-4">
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
                                              &gt; {conversionRate.conversion_rate} {conversionRate.toUnit.name}
                                            </div>
                                        ))
                                ) : (
                                    <span>N/A</span> // Fallback message if no conversion rates exist
                                )}
                              </TableCell>
                              <TableCell>P {supplierUnit.price?.toFixed(2) || 'N/A'}</TableCell>
                              <TableCell>{supplierUnit.quantity_per_unit || 'N/A'}</TableCell>
                              <TableCell>
                                <Link
                                    href="#"
                                    className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                                >
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
