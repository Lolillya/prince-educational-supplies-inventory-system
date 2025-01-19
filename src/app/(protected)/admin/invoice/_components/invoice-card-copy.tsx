import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface InvoiceCardProps {
  id: number;
  itemName: string;
  brandName: string;
  variant: string | null;

  BatchVariant: Array<{
    batch_variant_id: number;
    batch: {
      quantity: number;
    };
    SupplierUnit: Array<{
      price: number;
      quantity_per_unit: number;
      unit_id: number;
      unit: {
        name: string;
        unit_id: number;
      };
    }>;
  }>;

  onRemove: (batchNumber: number) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  id,
  itemName,
  brandName,
  variant,
  BatchVariant,
  onRemove,
}) => {
  //   const [unitQuantity, setUnitQuantity] = useState<number | undefined>(
  //   supplierUnit[0]?.quantity_per_unit,
  // );
  // const [price, setPrice] = useState<number | undefined>(
  //   supplierUnit[0]?.price,
  //   );

  // const [selectedUnit, setSelectedUnit] = useState(supplierUnit[0]);

  // const [totalPrice, setTotalPrice] = useState<number | undefined>(
  //   (unitQuantity || 0) * (price || 0),
  // );

  const [supplier, setSupplier] = useState("Supplier");

  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("%");
  const [grandTotal, setGrandTotal] = useState<number | undefined>(0);

  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined,
  );

  // useEffect(() => {
  //   // Calculate the discounted total price
  //   const basePrice = (unitQuantity || 0) * (price || 0);
  //   let finalPrice = basePrice;

  //   if (discountType === "%") {
  //     finalPrice = basePrice - (basePrice * parseFloat(discount || "0")) / 100;
  //   } else if (discountType === "Fixed") {
  //     finalPrice = basePrice - parseFloat(discount || "0");
  //   }

  //   setTotalPrice(finalPrice > 0 ? finalPrice : 0); // Prevent negative totals
  // }, [unitQuantity, price, discount, discountType]);

  // useEffect(() => {
  //   setPrice(selectedUnit?.price);
  //   setUnitQuantity(selectedUnit?.quantity_per_unit);

  //   setTotalPrice((unitQuantity || 0) * (price || 0));
  // }, [selectedUnit]);

  // useEffect(() => {
  //   setTotalPrice((unitQuantity || 0) * (price || 0));
  // }, [price, unitQuantity]);

  // const handleQuantityChange = (value: string) => {
  //   const parsedValue = parseInt(value, 10);
  //   setUnitQuantity(!isNaN(parsedValue) ? parsedValue : 0);
  // };

  // const handlePriceChange = (value: string) => {
  //   const parsedValue = parseFloat(value);
  //   setPrice(!isNaN(parsedValue) ? parsedValue : 0);
  // };

  // const handleShowBatch = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   console.log("Clicked");
  //   setIsBatchWindowShown(!isBatchWindowShown);
  //   console.log(isBatchWindowShown);
  // };

  return (
    <div className="border-gray-200 h-fit rounded-xl border bg-gray p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Label>
          {itemName} - {brandName} - {variant}
        </Label>
        <X className="hover:cursor-pointer" onClick={() => onRemove(id)} />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <div
            className="mr-2 flex h-10 w-full items-center justify-between rounded-md bg-white p-1"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Label className="text-textGray">Add Batch</Label>
            <div className="flex items-center justify-center rounded-lg bg-gray p-1 transition-all duration-300 hover:scale-110">
              <Plus />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="max-h-[40rem] w-[35rem] overflow-auto">
          <div className="flex flex-col gap-4">
            {BatchVariant.map((variant, index) => {
              const accordionValue = `batch-${index}`;
              return (
                <Accordion
                  key={index}
                  type="single"
                  collapsible
                  className="flex flex-col gap-2"
                  value={openAccordion}
                  onValueChange={setOpenAccordion}
                >
                  <AccordionItem
                    value={accordionValue}
                    className="rounded-lg border px-2"
                  >
                    <AccordionTrigger>
                      <div className="flex w-full">
                        <div className="flex w-full items-center gap-3">
                          <Input
                            type="checkbox"
                            className="h-4 w-fit"
                            onClick={() =>
                              setGrandTotal(variant.SupplierUnit[0]?.price)
                            }
                          />
                          <Label className="">Batch {index + 1}</Label>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table className="text-xs">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Unit</TableHead>
                            <TableHead>Conversion</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variant.SupplierUnit.map((unit, unitIndex) => (
                            <TableRow key={unitIndex}>
                              <TableCell>{unit.unit.name}</TableCell>
                              <TableCell># {unit.unit.name}</TableCell>
                              <TableCell>{unit.quantity_per_unit}</TableCell>
                              <TableCell className="text-right">
                                P {unit.price}
                              </TableCell>
                              <TableCell>
                                <Button variant="link">Out to office</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            })}
            <Separator orientation="horizontal" className="h-0.5 bg-black" />
            <Accordion type="single">
              <AccordionItem
                value={id.toString()}
                className="rounded-lg border px-2"
              >
                <AccordionTrigger>
                  <div className="flex w-full">
                    <div className="flex w-full items-center gap-3">
                      <Input type="checkbox" className="h-4 w-fit" />
                      <Label className="">Auto Restock</Label>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent></AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button variant={"default"}>Continue</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:no-underline">
            Batch {id + 1}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-left">Quantity & Stock</Label>
                <div className="flex">
                  <Input
                    className="rounded-r-none border shadow-none"
                    value={0}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-left">Pricing</Label>
                <div className="flex">
                  <Input
                    className="rounded-r-none border shadow-none"
                    value={0}
                    disabled={supplier === "Supplier"}
                  />
                  <Select
                    value={supplier}
                    onValueChange={(value) => setSupplier(value)}
                  >
                    <SelectTrigger className="rounded-l-none">
                      <SelectValue placeholder="Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Supplier">Supplier</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-left">Discount</Label>
                <div className="flex">
                  <Input
                    className="rounded-r-none border shadow-none"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                  <Select
                    value={discountType}
                    onValueChange={(value) => setDiscountType(value)}
                  >
                    <SelectTrigger className="rounded-l-none">
                      <SelectValue placeholder="%" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* <p className="text-gray-400 mt-4 text-sm">
        Insufficient stock from Batch 1!
        <br />
        <span className="text-orange-400">
          <Link href={"#"}>Choose a different batch</Link>
        </span>
        &nbsp; or &nbsp;
        <span className="text-orange-400">
          <Link href={"#"}>auto restock</Link>
        </span>
      </p> */}
      {/* <p className="mt-4">Total: P{totalPrice}</p> */}
    </div>
  );
};

export default InvoiceCard;
