import React, { SyntheticEvent, useEffect, useState } from "react";
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
  variant_id: number;

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
  updateCardDetails: (
    id: number,
    totalPrice: number,
    price: number,
    quantity: number,
    discount: number,
    discountType: string,
    selectedUnit: {
      unitName: string;
      unit_id: number;
    },
    itemName: string,
    brandName: string,
    variant: string,
    variant_id: number,
    unit_id: number,
  ) => void;
};

type SupplierUnit = {
  price: number;
  quantity_per_unit: number;
  unit_id: number;
  unit: {
    name: string;
    unit_id: number;
  };
};

type SupplierBatch = {
  index: number;
  supplierUnits: SupplierUnit[];
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  id,
  itemName,
  brandName,
  variant,
  variant_id,
  BatchVariant,
  onRemove,
  updateCardDetails,
}) => {
  const [unitQuantity, setUnitQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState("Supplier");
  const [selectedUnit, setSelectedUnit] = useState({
    unitName: "",
    unit_id: 0,
    quantity: 0,
  });
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("%");
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined,
  );
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});
  const [selectedBatches, setSelectedBatches] = useState<SupplierBatch[]>([]);

  const handleSelectBatch = (index: number, supplierUnits: any[]) => {
    setCheckedState((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    setSelectedBatches((prev) => {
      if (prev.some((batch) => batch.index === index)) {
        return prev.filter((batch) => batch.index !== index);
      } else {
        return [...prev, { index, supplierUnits }];
      }
    });
  };

  const calculateTotal = () => {
    const total =
      discountType === "%"
        ? unitQuantity * price * (1 - Number(discount) / 100)
        : unitQuantity * price - Number(discount);

    setTotalPrice(total);
  };

  const handleSelectUnit = (
    unit: string,
    unit_id: number,
    quantity: number,
  ) => {
    setSelectedUnit({
      unitName: unit,
      unit_id: unit_id,
      quantity: quantity,
    });
  };

  useEffect(() => {
    calculateTotal();
  }, [unitQuantity, price, discount]);

  useEffect(() => {
    updateCardDetails(
      id,
      totalPrice,
      price,
      unitQuantity,
      Number(discount),
      discountType,
      selectedUnit,
      itemName,
      brandName,
      variant!,
      variant_id,
      selectedUnit.unit_id,
    );
  }, [
    totalPrice,
    price,
    unitQuantity,
    discount,
    discountType,
    selectedUnit,
    itemName,
    brandName,
    variant,
    variant_id,
  ]);

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
                  <div className="relative flex w-full flex-col justify-center">
                    {selectedUnit && (
                      <Label className="absolute mr-3 self-end text-right text-textGray">
                        available: {selectedUnit.quantity}
                      </Label>
                    )}
                    <Input
                      className="rounded-r-none border shadow-none"
                      placeholder="Enter Quantity"
                      value={unitQuantity}
                      onChange={(e) => setUnitQuantity(Number(e.target.value))}
                    />
                  </div>
                  <Select
                    onValueChange={(value) => {
                      const selectedUnit = JSON.parse(value);
                      handleSelectUnit(
                        selectedUnit.name,
                        selectedUnit.id,
                        selectedUnit.quantity,
                      );
                    }}
                  >
                    <SelectTrigger className="rounded-l-none">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedBatches?.map((batch) =>
                        batch.supplierUnits.map((unit) => (
                          <SelectItem
                            key={`${batch.index}-${unit.unit.unit_id}`}
                            value={JSON.stringify({
                              name: unit.unit.name,
                              id: unit.unit.unit_id,
                              quantity: unit.quantity_per_unit,
                            })}
                          >
                            {unit.unit.name}
                          </SelectItem>
                        )),
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
                      disabled={
                        !(unitQuantity !== 0 && selectedUnit.unitName !== "")
                      }
                      onValueChange={(value) => setPrice(Number(value))}
                      value={price.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBatches?.flatMap((batch, batchIndex) =>
                          batch.supplierUnits
                            .filter(
                              (unit) =>
                                unit.unit.name === selectedUnit.unitName,
                            )
                            .map((ywa, ywaIndex) => (
                              <SelectItem
                                key={`${batchIndex}-${ywa.unit.unit_id}-${ywaIndex}`}
                                value={ywa.price.toString()}
                              >
                                {ywa.price}
                              </SelectItem>
                            )),
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="rounded-r-none border shadow-none"
                      placeholder="Select Pricing"
                      value={price}
                      disabled={
                        !(unitQuantity !== 0 && selectedUnit.unitName !== "")
                      }
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  )}

                  <Select
                    value={supplier}
                    onValueChange={(value) => setSupplier(value)}
                    disabled={
                      !(unitQuantity !== 0 && selectedUnit.unitName !== "")
                    }
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
