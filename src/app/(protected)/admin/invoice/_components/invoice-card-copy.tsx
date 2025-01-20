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

type InvoiceCardProps = {
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
  calculateGrandTotal: (total: number) => void;
};

type BatchVariantType = {
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
};

type SupplierUnitType = [
  {
    SupplierUnit: Array<{
      price: number;
      quantity_per_unit: number;
      unit_id: number;
      unit: {
        name: string;
        unit_id: number;
      };
    }>;
  },
];

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  id,
  itemName,
  brandName,
  variant,
  BatchVariant,
  onRemove,
  calculateGrandTotal,
}) => {
  const [unitQuantity, setUnitQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState("Supplier");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("%");
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined,
  );
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});
  const [selectedBatches, setSelectedBatches] =
    useState<SupplierUnitType | null>(null);

  const handleSelectBatch = (index: number, supplierUnits: any[]) => {
    setCheckedState((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    setSelectedBatches((prev) => {
      if (prev?.some((batch) => batch.index === index)) {
        return prev.filter((batch) => batch.index !== index);
      } else {
        return [...(prev || []), { supplierUnits }];
      }
    });
  };

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

  const calculateTotal = () => {
    setTotalPrice(unitQuantity * price);
  };

  useEffect(() => {
    calculateTotal();
  }, [unitQuantity, price]);

  useEffect(() => {
    calculateGrandTotal(totalPrice);
  }, [totalPrice]);

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
                            checked={!!checkedState[index]}
                            onChange={() =>
                              handleSelectBatch(index, variant.SupplierUnit)
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
          <AccordionTrigger className="flex justify-center hover:no-underline"></AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-left">Quantity & Unit</Label>
                <div className="flex">
                  <Input
                    className="rounded-r-none border shadow-none"
                    placeholder="Enter Quantity"
                    value={unitQuantity}
                    onChange={(e) => setUnitQuantity(Number(e.target.value))}
                  />
                  <Select onValueChange={setSelectedUnit}>
                    <SelectTrigger className="rounded-l-none">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedBatches?.map((batch) =>
                        Object.entries(batch).map((test) =>
                          test[1].map((ywa, index) => (
                            <SelectItem value={ywa.unit.name} key={index}>
                              {ywa.unit.name}
                            </SelectItem>
                          )),
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-left">Pricing</Label>
                <div className="flex">
                  {supplier === "Supplier" ? (
                    <Select
                      onValueChange={(value) => setPrice(Number(value))}
                      value={price.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBatches?.map((batch, batchIndex) =>
                          Object.entries(batch).map(([key, value]) =>
                            value.map((ywa, ywaIndex) =>
                              ywa.unit.name === selectedUnit ? (
                                <SelectItem
                                  value={ywa.price.toString()}
                                  key={`${batchIndex}-${key}-${ywaIndex}`}
                                >
                                  {ywa.price}
                                </SelectItem>
                              ) : null,
                            ),
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="rounded-r-none border shadow-none"
                      placeholder="Select Pricing"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  )}

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

      <div className="flex items-center gap-3 py-3">
        <Label className="font-bold">Total </Label>
        <Input className="shadow-none" disabled value={totalPrice} />
      </div>
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
