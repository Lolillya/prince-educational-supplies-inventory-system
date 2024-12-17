import React, { useState } from "react";
import { Separator } from "~/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";
import { ArrowRight, Plus, X } from "lucide-react";
import { Input } from "~/components/ui/input";

// Define TypeScript types
type Item = {
  variant: {
    item: {
      name: string;
      brand: {
        name: string;
      };
    };
    name?: string;
  };
};

type StockCardProps = {
  item: Item;
  onRemove: () => void;
};

const StockCard = ({ item, onRemove }: StockCardProps) => {
  const [stockUnits, setStockUnits] = useState<StockUnitData[]>([]);
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");

  const addStockUnit = () => {
    setStockUnits([
      ...stockUnits,
      { stock: "", price: "", unit: "", conversionQty: "", conversionUnit: "" },
    ]);
  };

  const removeStockUnit = (index: number) => {
    setStockUnits(stockUnits.filter((_, i) => i !== index));
  };

  const updateStockUnit = (
      index: number,
      field: keyof StockUnitData,
      value: string
  ) => {
    const updatedUnits = stockUnits.map((unit, i) =>
        i === index ? { ...unit, [field]: value } : unit
    );
    setStockUnits(updatedUnits);
  };

  return (
      <div className="border-gray-200 h-auto w-full rounded-xl border px-4 pt-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p>
            {item?.variant.item.name} - {item?.variant.item.brand.name} -{" "}
            {item?.variant.name || "N/A"}
          </p>
          <X className="hover:cursor-pointer" onClick={onRemove} />
        </div>
        <Separator orientation="horizontal" />
        <div className="mt-2">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="hover:no-underline">
                <div
                    className="grid grid-cols-5 gap-3 pr-4 hover:cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col items-start gap-1">
                    <Label className="text-left">Stock</Label>
                    <Input
                        placeholder="000"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <Label className="text-left">Price</Label>
                    <Input
                        placeholder="0000.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 flex flex-col items-start gap-1">
                    <Label className="text-left">Unit</Label>
                    <Input
                        placeholder="Unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="bg-emerald-100 text-black placeholder-slate-500"
                    />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Separator orientation="horizontal" />
                <div className="mt-2 grid grid-cols-5 gap-3 pr-4">
                  <div>Stock</div>
                  <div>Price</div>
                  <div>Unit</div>
                  <div className="col-span-2">Conversion</div>
                </div>
                {stockUnits.map((unitData, index) => (
                    <StockUnit
                        key={index}
                        unitData={unitData}
                        onRemove={() => removeStockUnit(index)}
                        onUpdate={(field, value) =>
                            updateStockUnit(index, field, value)
                        }
                    />
                ))}
                <AddStockUnit onAdd={addStockUnit} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
  );
};

type StockUnitData = {
  stock: string;
  price: string;
  unit: string;
  conversionQty: string;
  conversionUnit: string;
};

const StockUnit = ({
                     unitData,
                     onRemove,
                     onUpdate,
                   }: {
  unitData: StockUnitData;
  onRemove: () => void;
  onUpdate: (field: keyof StockUnitData, value: string) => void;
}) => {
  return (
      <div className="mt-2 flex items-center">
        <div className="grid grid-cols-5 gap-3 pr-4 hover:cursor-default">
          <div className="flex flex-col items-start gap-1">
            <Input
                placeholder="000"
                value={unitData.stock}
                onChange={(e) => onUpdate("stock", e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <Input
                placeholder="0000.00"
                value={unitData.price}
                onChange={(e) => onUpdate("price", e.target.value)}
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <Input
                  placeholder="Unit"
                  value={unitData.unit}
                  onChange={(e) => onUpdate("unit", e.target.value)}
              />
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
          <div className="col-span-2 flex flex-col items-start gap-1">
            <div className="flex">
              <Input
                  placeholder="Qty."
                  className="rounded-r-none"
                  value={unitData.conversionQty}
                  onChange={(e) => onUpdate("conversionQty", e.target.value)}
              />
              <Input
                  placeholder="Units"
                  className="rounded-l-none"
                  value={unitData.conversionUnit}
                  onChange={(e) => onUpdate("conversionUnit", e.target.value)}
              />
            </div>
          </div>
        </div>
        <X className="h-5 w-5 hover:cursor-pointer" onClick={onRemove} />
      </div>
  );
};

const AddStockUnit = ({ onAdd }: { onAdd: () => void }) => {
  return (
      <div className="mt-2 flex items-center">
        <div className="grid grid-cols-5 gap-3 pr-4 hover:cursor-default">
          <div className="flex flex-col items-start gap-1">
            <Input placeholder="Stock" disabled />
          </div>
          <div className="flex flex-col items-start gap-1">
            <Input placeholder="Price" disabled />
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <Input placeholder="Unit" disabled />
              <ArrowRight className="text-gray-400 h-5 w-5" />
            </div>
          </div>
          <div className="col-span-2 flex flex-col items-start gap-1">
            <div className="flex items-center">
              <Input placeholder="to" className="rounded-r-none" disabled />
              <Input placeholder="Unit" className="rounded-l-none" disabled />
            </div>
          </div>
        </div>
        <Plus className="h-5 w-5 hover:cursor-pointer" onClick={onAdd} />
      </div>
  );
};

export default StockCard;
