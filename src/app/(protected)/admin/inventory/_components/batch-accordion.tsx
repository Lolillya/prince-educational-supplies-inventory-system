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

const BatchAccordion = () => {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl">
      {/* Display Batch ID */}

      <div className="flex flex-grow justify-between rounded-lg bg-white">
        <div className="flex w-10 items-center justify-center rounded-l-lg rounded-r-none bg-rose-200">
          <span className="text-2xl text-red">1</span>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`batch-00001`}>
            <AccordionTrigger className="px-4 hover:no-underline">
              <p>
                {/* Display supplier name */}
                From Supplier Name
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

                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex flex-grow justify-between rounded-lg bg-white">
        <div className="flex w-10 items-center justify-center rounded-l-lg rounded-r-none bg-orange-200">
          <span className="text-2xl text-orage">1</span>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`batch-00001`}>
            <AccordionTrigger className="px-4 hover:no-underline">
              <p>
                {/* Display supplier name */}
                From Supplier Name
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

                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex flex-grow justify-between rounded-lg bg-white">
        <div className="flex w-10 items-center justify-center rounded-l-lg rounded-r-none bg-emerald-200">
          <span className="text-2xl text-green">1</span>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`batch-00001`}>
            <AccordionTrigger className="px-4 hover:no-underline">
              <p>
                {/* Display supplier name */}
                From Supplier Name
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

                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unit</TableCell>
                    <TableCell>
                      <div>&gt; 20 Cases</div>
                    </TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>000</TableCell>
                    <TableCell>
                      <Link
                        href="#"
                        className={`'text-gray-500 hover:cursor-default' text-green hover:underline`}
                      >
                        Out to office
                      </Link>
                    </TableCell>
                  </TableRow>
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
