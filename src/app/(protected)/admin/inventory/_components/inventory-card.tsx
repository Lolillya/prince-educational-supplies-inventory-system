import React, { useState, useEffect } from "react";

import { X } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";

import Link from "next/link";
import { ComboBoxSearchable } from "~/components/ui/combobox";
import { ArrowRight, Plus } from "lucide-react";

const InventoryCard = ({ batch, units }) => {
  const [stockUnits, setStockUnits] = useState<StockUnitData[]>(
    batch.supplierUnits || [],
  );
  const [detailedStockUnits, setDetailedStockUnits] = useState<StockUnitData[]>(
    [],
  ); // State for detailed stock units

  useEffect(() => {
    // Fetch detailed stock units from the batch here
    if (batch && batch.supplierUnits) {
      const details = batch.supplierUnits.map((unit) => ({
        stock: unit.quantity_per_unit,
        price: Number(unit.price).toFixed(2), // Ensure the price is formatted to two decimal places
        unit: unit.unit?.name,
        conversionQty: unit.ConversionRate?.[0]?.conversion_rate || "", // Fetch the first conversion rate if available
        conversionUnit: unit.ConversionRate?.[0]?.toUnit.name || "", // Fetch the first conversion unit if available
      }));
      setDetailedStockUnits(details);
    }
  }, [batch]);

  const addDetailedStockUnit = () => {
    const newUnit: StockUnitData = {
      stock: "",
      price: "",
      unit: "",
      conversionQty: "",
      conversionUnit: "",
    };
    setDetailedStockUnits([...detailedStockUnits, newUnit]);
  };

  const removeDetailedStockUnit = (index: number) => {
    setDetailedStockUnits(detailedStockUnits.filter((_, i) => i !== index));
  };

  const updateDetailedStockUnit = (
    index: number,
    field: keyof StockUnitData,
    value: string,
  ) => {
    const updatedUnits = detailedStockUnits.map((unit, i) =>
      i === index ? { ...unit, [field]: value } : unit,
    );
    setDetailedStockUnits(updatedUnits);
  };

  // Transform unit data for ComboBox
  const transformToUnitOptions = (units) => {
    return units.map((unit) => ({
      value: unit.unit_id,
      label: unit.name,
    }));
  };

  return (
    <div className="border-gray-200 h-auto w-full rounded-xl border px-4 pt-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p>
          Batch {batch?.batch_id || "N/A"}
          <span className="pl-3">
            <Link href="#" className="text-gray-400 hover:underline">
              {batch?.supplierUnits?.[0]?.supplier?.personal_details
                ?.first_name || "Unknown"}{" "}
              {batch?.supplierUnits?.[0]?.supplier?.personal_details
                ?.last_name || "Supplier"}
            </Link>
          </span>
        </p>
        <X className="hover:cursor-pointer" />
      </div>
      <Separator orientation="horizontal" />
      <div className="mt-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="hover:no-underline">
              <div className="grid grid-cols-1 gap-4 pr-4 hover:cursor-default">
                {stockUnits.length > 0 ? (
                  stockUnits.map((supplierUnit, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-start">
                        <Label className="text-left">Stock</Label>
                        <input
                          placeholder="000"
                          value={supplierUnit.quantity_per_unit || "N/A"}
                          onChange={(e) =>
                            updateStockUnit(index, "stock", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <Label className="text-left">Price</Label>
                        <input
                          placeholder="0000.00"
                          value={Number(supplierUnit.price).toFixed(2) || "N/A"}
                          onChange={(e) =>
                            updateStockUnit(index, "price", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <Label className="text-left">Unit</Label>
                        <ComboBoxSearchable
                          initialData={transformToUnitOptions(units || [])} // Use the passed units
                          placeholder="Unit"
                          onSelect={(selected) =>
                            updateDetailedStockUnit(
                              index,
                              "unit",
                              selected.label,
                            )
                          }
                          required
                          defaultValue={
                            transformToUnitOptions(units || []).find(
                              (unit) => unit.label === supplierUnit.unit?.name,
                            ) || null
                          }
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No supplier units available</p>
                )}
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
              {detailedStockUnits.map((unitData, index) => (
                <DetailedStockUnit
                  key={index}
                  unitData={unitData}
                  onRemove={() => removeDetailedStockUnit(index)}
                  onUpdate={(field, value) =>
                    updateDetailedStockUnit(index, field, value)
                  }
                  units={units} // Pass units to the detailed stock unit for unit selection
                  transformToUnitOptions={transformToUnitOptions} // Pass transform function to detailed stock unit
                />
              ))}
              <AddDetailedStockUnit onAdd={addDetailedStockUnit} />
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

const DetailedStockUnit = ({
  unitData,
  onRemove,
  onUpdate,
  units,
  transformToUnitOptions,
}) => {
  return (
    <div className="mt-2 flex items-center">
      <div className="grid grid-cols-5 gap-3 pr-4 hover:cursor-default">
        <div className="flex flex-col items-start gap-1">
          <input
            placeholder="000"
            value={unitData.stock}
            onChange={(e) => onUpdate("stock", e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <input
            placeholder="0000.00"
            value={unitData.price}
            onChange={(e) => onUpdate("price", e.target.value)}
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <ComboBoxSearchable
              initialData={transformToUnitOptions(units || [])} // Use the passed units
              placeholder="Unit"
              onSelect={(selected) => onUpdate("unit", selected.label)}
              required
              defaultValue={
                transformToUnitOptions(units || []).find(
                  (unit) => unit.label === unitData.unit,
                ) || null
              }
            />
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
        <div className="col-span-2 flex flex-col items-start gap-1">
          <div className="flex">
            <input
              placeholder="Quantity"
              value={unitData.conversionQty}
              onChange={(e) => onUpdate("conversionQty", e.target.value)}
            />
            <ComboBoxSearchable
              initialData={transformToUnitOptions(units || [])} // Use the passed units for conversion unit
              placeholder="Conversion Unit"
              onSelect={(selected) =>
                onUpdate("conversionUnit", selected.label)
              }
              required
              defaultValue={
                transformToUnitOptions(units || []).find(
                  (unit) => unit.label === unitData.conversionUnit,
                ) || null
              }
            />
          </div>
        </div>
      </div>
      <X className="h-5 w-5 hover:cursor-pointer" onClick={onRemove} />
    </div>
  );
};

const AddDetailedStockUnit = ({ onAdd }) => {
  return (
    <div className="mt-2 flex items-center">
      <div className="grid grid-cols-5 gap-3 pr-4 hover:cursor-default">
        <div className="flex flex-col items-start gap-1">
          <input placeholder="Stock" disabled />
        </div>
        <div className="flex flex-col items-start gap-1">
          <input placeholder="Price" disabled />
        </div>
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <input placeholder="Unit" disabled />
            <ArrowRight className="text-gray-400 h-5 w-5" />
          </div>
        </div>
        <div className="col-span-2 flex flex-col items-start gap-1">
          <div className="flex items-center">
            <input placeholder="to" className="rounded-r-none" disabled />
            <input placeholder="Unit" className="rounded-l-none" disabled />
          </div>
        </div>
      </div>
      <Plus className="h-5 w-5 hover:cursor-pointer" onClick={onAdd} />
    </div>
  );
};

export default InventoryCard;
