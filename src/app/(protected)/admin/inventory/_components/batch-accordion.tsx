import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface BatchVariant {
  variant_id: string | number;
  SupplierUnit?: {
    unit?: {
      name: string;
    };
    supplier?: {
      Personal_Details?: {
        first_name?: string;
        last_name?: string;
      };
    };
    price?: number | string;
    quantity_per_unit?: number | string;
    ConversionRate?: {
      conversion_rate: number;
      toUnit?: {
        name: string;
      };
    }[];
  }[];
}

interface Batch {
  batch_id: string | number;
  batchVariants?: BatchVariant[];
}

interface BatchAccordionProps {
  batch: Batch;
  selectedVariantId: string | number;
  batchNumber: number | string;
}

const BatchAccordion = ({ batch, selectedVariantId, batchNumber }: BatchAccordionProps) => {
  const batchVariants = batch?.batchVariants || [];

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl">
      {/* Display Batch ID */}
      <div className="flex flex-grow justify-between rounded-lg bg-white">
        <div className="flex w-10 items-center justify-center rounded-l-lg rounded-r-none bg-emerald-200">
          <span className="text-2xl text-green">{batchNumber}</span>{" "}
          {/* Display the batch number */}
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`batch-${batch?.batch_id}`}>
            <AccordionTrigger className="px-4 hover:no-underline">
              <p>
                {/* Display supplier name */}
                {batchVariants.length > 0 ? (
                  batchVariants
                    .filter(
                      (batchVariant) =>
                        batchVariant.variant_id === selectedVariantId,
                    )
                    .map((batchVariant, index) => {
                      // Access SupplierUnit for each variant
                      const supplierUnits = batchVariant?.SupplierUnit || [];
                      const supplier = supplierUnits?.[0]?.supplier || {}; // Access supplier details
                      const personalDetails = supplier?.Personal_Details || {};
                      const supplierName = `${personalDetails?.first_name || "Unknown"} ${personalDetails?.last_name || ""
                        }`;

                      return (
                        <span key={index}>
                          {/* Display the supplier name next to batch ID */}
                          {supplierName}{" "}
                          <span className="pl-3">
                            <Link
                              href="#"
                              className="text-gray-400 hover:underline"
                            >
                              #{batch?.batch_id || "N/A"}
                            </Link>
                          </span>
                        </span>
                      );
                    })
                ) : (
                  <span>Unknown Supplier</span>
                )}
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
                  {batchVariants.length > 0 ? (
                    batchVariants
                      .filter(
                        (batchVariant) =>
                          batchVariant.variant_id === selectedVariantId,
                      )
                      .map((batchVariant, index) => {
                        const supplierUnits = batchVariant?.SupplierUnit || [];
                        return supplierUnits.map((supplierUnit, rateIndex) => {
                          const conversionRate =
                            supplierUnit?.ConversionRate || [];
                          const price = supplierUnit?.price || "N/A";
                          const quantityPerUnit =
                            supplierUnit?.quantity_per_unit || "N/A";

                          return (
                            <TableRow key={rateIndex}>
                              <TableCell>
                                {supplierUnit?.unit?.name || "Unknown Unit"}
                              </TableCell>
                              <TableCell>
                                {conversionRate.length > 0 ? (
                                  conversionRate.map((rate, idx) => (
                                    <div key={idx}>
                                      &gt; {rate.conversion_rate}{" "}
                                      {rate?.toUnit?.name || "Unknown"}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-textGray">
                                    No Conversion Available
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {/*P {price.toFixed(2) || "N/A"}*/}
                                {/*P {typeof price === "number" ? price.toFixed(2) : "N/A"}*/}
                                P {(Number(price) || 0).toFixed(2)}
                              </TableCell>
                              <TableCell>{quantityPerUnit}</TableCell>
                              <TableCell>
                                <Link
                                  href={""}
                                  className={`'text-gray hover:cursor-default' text-green hover:underline`}
                                >
                                  Out to office
                                </Link>
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-4 text-center">
                        No Batch Available.
                      </TableCell>
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
