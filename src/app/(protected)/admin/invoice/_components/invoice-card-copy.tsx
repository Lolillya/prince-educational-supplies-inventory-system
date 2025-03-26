import { Info, MoveRight, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Separator } from "~/components/ui/separator";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
  isAutoRestock: boolean;

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
      ConversionRate: {
        conversion_rate: number;
        toUnit: {
          name: string;
        };
      }[];
    }>;
  }>;

  onRemove: (batchNumber: number) => void;
  handleAutoRestock: (checked: boolean) => void;
  BatchAutoRestock: (value: boolean) => void;
  updateCardDetails: (
    id: number,
    totalPrice: number,
    price: number,
    quantity: number,
    available: number,
    discount: number,
    discountType: string,
    selectedUnit: {
      unitName: string;
      unit_id: number;
      supplier_unit_id: number;
    },
    itemName: string,
    brandName: string,
    variant: string,
    variant_id: number,
    unit_id: number,
  ) => void;
  isInputFocused: string | undefined;
  units:
    | Array<{
        unit_id: number;
        name: string;
      }>
    | undefined;
};

type SupplierUnit = {
  price: number;
  supplier_unit_id: number;
  quantity_per_unit: number;
  unit_id: number;
  unit: {
    name: string;
    unit_id: number;
    supplier_unit_id: number;
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
  handleAutoRestock,
  isAutoRestock,
  BatchAutoRestock,
  isInputFocused,
  units,
}) => {
  const [unitQuantity, setUnitQuantity] = useState<number>(0);
  const [price, setPrice] = useState({
    price: 0,
    batch: 0,
  });
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState("Supplier");
  const [selectedUnit, setSelectedUnit] = useState({
    unitName: "",
    unit_id: 0,
    supplier_unit_id: 0,
  });
  const [selectedUnitQuantity, setSelectedUnitQuantity] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState("%");
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(
    undefined,
  );
  const [batchAccordion, setBatchAccordion] = useState<string | undefined>(
    "item-1",
  );
  const [openPopover, setOpenPopover] = useState(false);
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});
  const [selectedBatches, setSelectedBatches] = useState<SupplierBatch[]>([]);
  const [batchBasis, setBatchBasis] = useState<SupplierBatch | undefined>(
    undefined,
  );
  const [isBatchAutoRestock, setIsBatchAutoRestock] = useState<boolean>(false);

  const getBatchColor = (
    supplierUnits: {
      price: number;
      quantity_per_unit: number;
      unit_id: number;
      unit: { name: string; unit_id: number };
    }[],
    currentBatchBasis?: SupplierBatch,
  ) => {
    if (!currentBatchBasis) return "bg-yellow/30";

    const batchBasisUnitIds = currentBatchBasis.supplierUnits.map(
      (unit) => unit.unit_id,
    );
    const currentBatchUnitIds = supplierUnits.map((unit) => unit.unit_id);

    const hasExactSameOrder =
      batchBasisUnitIds.length === currentBatchUnitIds.length &&
      batchBasisUnitIds.every((id, index) => id === currentBatchUnitIds[index]);

    const hasAtLeastOneSameUnit = currentBatchUnitIds.some((id) =>
      batchBasisUnitIds.includes(id),
    );

    const hasPartialMatch = hasAtLeastOneSameUnit && !hasExactSameOrder;

    if (hasExactSameOrder) return "bg-green/50";
    if (hasPartialMatch) return "bg-yellow-300";
    return "bg-red/80";
  };

  const handlePriceInput = (price: number, batch: number) => {
    setPrice({ price, batch });
  };

  const handleSelectBatch = (index: number, supplierUnits: any[]) => {
    setCheckedState((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    setSelectedBatches((prev) => {
      const isAlreadySelected = prev.some((batch) => batch.index === index);
      const updatedBatches = isAlreadySelected
        ? prev.filter((batch) => batch.index !== index)
        : [...prev, { index, supplierUnits }];

      return updatedBatches;
    });
  };

  const handleContinue = () => {
    setOpenPopover(false);
    setBatchAccordion("item-1");
  };

  const calculateTotal = () => {
    const total =
      discountType === "%"
        ? unitQuantity * price.price * (1 - Number(discount) / 100)
        : unitQuantity * price.price - Number(discount);

    setTotalPrice(total);
  };

  console.log(BatchVariant);

  const handleSelectUnitQuantity = () => {
    // Calculate the total quantity
    const total = selectedBatches.reduce((acc, batch) => {
      return (
        acc +
        batch.supplierUnits.reduce((sum, supplier) => {
          if (selectedUnit.unit_id === supplier.unit_id) {
            // console.log("Matching Supplier:", supplier); // ✅ Log supplier details
            return sum + supplier.quantity_per_unit;
          }
          return sum;
        }, 0)
      );
    }, 0);

    // Update state once
    setSelectedUnitQuantity(total);
  };

  const handleSelectUnit = (
    unit: string,
    unit_id: number,
    supplier_unit_id: number,
  ) => {
    setSelectedUnit({
      unitName: unit,
      unit_id: unit_id,
      supplier_unit_id,
    });
  };

  useEffect(() => {
    BatchAutoRestock(isBatchAutoRestock);
    if (isBatchAutoRestock) {
      setSupplier("Manual");
    }
  }, [isBatchAutoRestock]);

  useEffect(() => {
    if (selectedBatches.length > 0) {
      setBatchBasis(selectedBatches[0]); // Always set the first batch as the basis
    } else {
      setBatchBasis(undefined);
    }

    if (selectedBatches.length === 0) {
      setUnitQuantity(0);
      setPrice({
        price: 0,
        batch: 0,
      });
      setDiscount(0);
      setSelectedUnit({
        unitName: "",
        unit_id: 0,
        supplier_unit_id: 0,
      });
    }
  }, [selectedBatches]);

  console.log("SelectedUnit:", selectedUnit);

  useEffect(() => {
    handleSelectUnitQuantity();
  }, [selectedUnit, selectedBatches]);

  useEffect(() => {
    calculateTotal();
  }, [unitQuantity, price, discount]);

  useEffect(() => {
    updateCardDetails(
      id,
      totalPrice,
      price.price,
      unitQuantity,
      selectedUnitQuantity,
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
    selectedUnitQuantity,
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

      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <div
            className="mr-2 flex h-10 w-full items-center justify-between rounded-md bg-white p-1"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1">
              {selectedBatches.length === 0 ? (
                <Label className="text-textGray">Add Batch</Label>
              ) : (
                selectedBatches.map((batch) => (
                  <Label
                    key={batch.index}
                    className={`flex content-center items-center gap-2 rounded-lg p-2 ${
                      batchBasis
                        ? getBatchColor(batch.supplierUnits, batchBasis)
                        : "bg-gray-300"
                    }`}
                  >
                    Batch {batch.index + 1}
                    <X
                      size={15}
                      className="transition-all duration-200 hover:scale-110 hover:cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent unintended popover close
                        setSelectedBatches((prev) => {
                          const updatedBatches = prev.filter(
                            (b) => b.index !== batch.index,
                          );

                          // Update batchBasis if the removed batch was the current basis
                          if (batchBasis?.index === batch.index) {
                            setBatchBasis(
                              updatedBatches.length > 0
                                ? updatedBatches[0]
                                : undefined,
                            );
                          }

                          return updatedBatches;
                        });

                        setCheckedState((prev) => ({
                          ...prev,
                          [batch.index]: false, // Uncheck the checkbox when removed
                        }));
                      }}
                    />
                  </Label>
                ))
              )}
            </div>
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
                            disabled={
                              getBatchColor(
                                variant.SupplierUnit,
                                batchBasis,
                              ) === "bg-red/80"
                            }
                          />
                          <div
                            className={`h-3 w-3 rounded-full ${
                              batchBasis
                                ? getBatchColor(
                                    variant.SupplierUnit,
                                    batchBasis,
                                  )
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <Label>Batch {index + 1}</Label>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table className="text-xs">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">
                              Quantity
                            </TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead>Conversion</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variant.SupplierUnit.map((unit, unitIndex) => (
                            <TableRow key={unitIndex}>
                              <TableCell>{unit.unit.name}</TableCell>

                              <TableCell className="text-right">
                                {unit.quantity_per_unit}
                              </TableCell>
                              <TableCell className="text-right">
                                ₱ {unit.price.toFixed(2)}
                              </TableCell>
                              <TableCell className="flex items-center gap-1">
                                {unit.unit.name !== "Pieces" && (
                                  <>
                                    <MoveRight size={15} />{" "}
                                    {unit.ConversionRate[0]?.conversion_rate}{" "}
                                    {unit.ConversionRate[0]?.toUnit.name}
                                  </>
                                )}
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
                      <Input
                        type="checkbox"
                        className="h-4 w-fit"
                        disabled={BatchVariant.length !== 0}
                        onChange={(e) =>
                          setIsBatchAutoRestock(e.target.checked)
                        }
                      />
                      <Label className="">Auto Restock</Label>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent></AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button
              variant={"default"}
              onClick={handleContinue}
              disabled={selectedBatches.length === 0 && !isBatchAutoRestock}
            >
              Continue
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Accordion
        type="single"
        collapsible
        value={isInputFocused}
        onValueChange={(value) =>
          setBatchAccordion(value === "item-1" ? value : undefined)
        }
      >
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
                        available: {selectedUnitQuantity}
                      </Label>
                    )}
                    <Input
                      className="rounded-r-none border shadow-none"
                      placeholder="Enter Quantity"
                      value={unitQuantity}
                      disabled={selectedBatches.length === 0}
                      onChange={(e) => setUnitQuantity(Number(e.target.value))}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^0-9]/g,
                          "",
                        );
                      }}
                    />
                  </div>
                  <Select
                    disabled={selectedBatches.length === 0}
                    value={
                      selectedUnit.unit_id === 0
                        ? undefined
                        : JSON.stringify({
                            id: selectedUnit.unit_id,
                            name: selectedUnit.unitName,
                            supplier_unit_id: selectedUnit.supplier_unit_id,
                          })
                    }
                    onValueChange={(value) => {
                      const selected = JSON.parse(value);
                      setSelectedUnit({
                        unitName: selected.name,
                        unit_id: selected.id,
                        supplier_unit_id: selected.supplier_unit_id || 0,
                      });
                      handleSelectUnit(
                        selected.name,
                        selected.id,
                        selected.supplier_unit_id,
                      );
                    }}
                  >
                    <SelectTrigger className="w-full rounded-l-none">
                      <SelectValue placeholder="Select Unit">
                        {selectedUnit.unit_id !== 0
                          ? selectedUnit.unitName
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {isBatchAutoRestock && units?.length
                        ? units.map((u) => (
                            <SelectItem
                              key={u.unit_id}
                              value={JSON.stringify({
                                id: u.unit_id,
                                name: u.name,
                                supplier_unit_id: undefined,
                              })}
                            >
                              {u.name}
                            </SelectItem>
                          ))
                        : selectedBatches?.length
                          ? selectedBatches
                              .flatMap((batch, index) =>
                                batch.supplierUnits.map((unit) => ({
                                  supplier_unit_id: unit.supplier_unit_id,
                                  name: unit.unit.name,
                                  id: unit.unit.unit_id,
                                  quantity: unit.quantity_per_unit,
                                  batch: index + 1,
                                })),
                              )
                              .filter(
                                (unit, index, self) =>
                                  self.findIndex(
                                    (u) =>
                                      u.name.toLowerCase() ===
                                      unit.name.toLowerCase(),
                                  ) === index,
                              )
                              .map((uniqueUnit) => (
                                <SelectItem
                                  key={uniqueUnit.id}
                                  value={JSON.stringify(uniqueUnit)}
                                >
                                  {uniqueUnit.name}
                                </SelectItem>
                              ))
                          : null}
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
                      onValueChange={(value) => {
                        const selectedPrice = JSON.parse(value); // Parse the selected value
                        handlePriceInput(
                          selectedPrice.price,
                          selectedPrice.batch,
                        );
                      }}
                      value={JSON.stringify(price)} // Ensure the selected value matches one of the SelectItem values
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBatches.map((batch, batchIndex) =>
                          batch.supplierUnits
                            .filter(
                              (unit) =>
                                unit.unit.name === selectedUnit.unitName,
                            )
                            .map((supplier, supplierIndex) => (
                              <SelectItem
                                key={`${batchIndex}-${supplierIndex}`} // Ensure unique keys
                                value={JSON.stringify({
                                  price: supplier.price,
                                  batch: batch.index,
                                })}
                              >
                                <div className="pointer-events-none flex w-full items-center justify-center gap-10">
                                  <Label>{supplier.price.toFixed(2)}</Label>
                                  <Label className="text-textGray">{`Batch #${batch.index + 1}`}</Label>
                                </div>
                              </SelectItem>
                            )),
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="rounded-r-none border shadow-none"
                      placeholder="Select Pricing"
                      value={price.price === 0 ? "" : price.price.toString()} // Ensure empty string for default
                      disabled={
                        !(unitQuantity !== 0 && selectedUnit.unitName !== "")
                      }
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(
                          /[^0-9.]/g,
                          "",
                        ); // Allow numbers & decimal
                        setPrice({
                          price: numericValue ? Number(numericValue) : 0,
                          batch: 0,
                        });
                      }}
                    />
                  )}
                  <Select
                    value={supplier}
                    onValueChange={(value) => setSupplier(value)}
                    disabled={
                      isBatchAutoRestock ||
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
                    disabled={
                      !(
                        unitQuantity !== 0 &&
                        selectedUnit.unitName !== "" &&
                        price.price !== 0 &&
                        supplier !== ""
                      )
                    }
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                    }}
                  />
                  <Select
                    value={discountType}
                    disabled={
                      !(
                        unitQuantity !== 0 &&
                        selectedUnit.unitName !== "" &&
                        price.price !== 0 &&
                        supplier !== ""
                      )
                    }
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

              <div className="flex w-full">
                {!isBatchAutoRestock && (
                  <div className="flex w-full items-center gap-3">
                    <Input
                      type="checkbox"
                      disabled={!(unitQuantity > selectedUnitQuantity)}
                      className="h-4 w-fit"
                      onChange={(e) => handleAutoRestock?.(e.target.checked)}
                    />
                    <Label className="">Auto Restock</Label>
                    <Info
                      size={18}
                      className="transition-all duration-300 hover:scale-110 hover:cursor-pointer"
                      color="gray"
                    />
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex items-center gap-3 py-3">
        <Label className="font-bold">Total </Label>
        <Input className="shadow-none" disabled value={totalPrice.toFixed(2)} />
      </div>
    </div>
  );
};

export default InvoiceCard;
