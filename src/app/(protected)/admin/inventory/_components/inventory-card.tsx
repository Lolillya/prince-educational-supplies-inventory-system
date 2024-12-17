import React, {useEffect, useState} from "react";
import {Separator} from "~/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion";
import {Label} from "~/components/ui/label";
import {ArrowRight, Plus, X} from "lucide-react";
import {Input} from "~/components/ui/input";

import Link from "next/link";
import {ComboBoxSearchable} from "~/components/ui/combobox";

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

type InventoryCardProps = {
    item: Item;
    onRemove: () => void;
};

const InventoryCard = ({batch, units, item, onRemove}: InventoryCardProps) => {
    const [stockUnits, setStockUnits] = useState<StockUnitData[]>(batch.supplierUnits || [],);
    const [stock, setStock] = useState("");
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState("");

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


    const addStockUnit = () => {
        const newUnit: StockUnitData = {
            stock: "",
            price: "",
            unit: "",
            conversionQty: "",
            conversionUnit: "",
        };
        setDetailedStockUnits([...detailedStockUnits, newUnit]);
    };

    const removeStockUnit = (index: number) => {
        setDetailedStockUnits(detailedStockUnits.filter((_, i) => i !== index));
    };

    const updateStockUnit = (
        index: number,
        field: keyof StockUnitData,
        value: string,
    ) => {
        const updatedUnits = detailedStockUnits.map((unit, i) =>
            i === index ? {...unit, [field]: value} : unit,
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

                {batch?.supplierUnits?.[0]?.supplier?.Personal_Details?.first_name || "Unknown"}{" "}
                {batch?.supplierUnits?.[0]?.supplier?.Personal_Details?.last_name || "Supplier"}

            </Link>
          </span>
                </p>
                <X className="hover:cursor-pointer" onClick={onRemove}/>
            </div>
            <Separator orientation="horizontal"/>
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
                                                    className="w-full rounded-lg px-2 py-2 border border-gray-300"
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
                                                    className="w-full rounded-lg px-2 py-2 border border-gray-300"
                                                />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <Label className="text-left">Unit</Label>
                                                <ComboBoxSearchable
                                                    initialData={transformToUnitOptions(units || [])}
                                                    placeholder="Unit"
                                                    onSelect={(selected) =>
                                                        updateStockUnit(index, "unit", selected.label)
                                                    }
                                                    required
                                                    defaultValue={
                                                        transformToUnitOptions(units || []).find(
                                                            (unit) => unit.label === supplierUnit.unit?.name
                                                        ) || null
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 bg-emerald-100 text-black"
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
                            {detailedStockUnits.length > 0 ? (
                                detailedStockUnits.map((unitData, index) => (
                                    <StockUnit
                                        key={index}
                                        unitData={unitData}
                                        onRemove={() => removeStockUnit(index)}
                                        onUpdate={(field, value) =>
                                            updateStockUnit(index, field, value)
                                        }
                                        units={units} // Pass units to the detailed stock unit for unit selection
                                        transformToUnitOptions={transformToUnitOptions} // Pass transform function to detailed stock unit
                                    />
                                ))
                            ) : (
                                <p>No detailed stock units available</p>
                            )}
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
                       units,
                       transformToUnitOptions,
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
                        {/*<Input*/}
                        {/*    placeholder="Unit"*/}
                        {/*    value={unitData.unit}*/}
                        {/*    onChange={(e) => onUpdate("unit", e.target.value)}*/}
                        {/*/>*/}
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
                        <ArrowRight className="h-5 w-5"/>
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
                            className="rounded-l-none"
                        />
                        {/*<Input*/}
                        {/*    placeholder="Units"*/}
                        {/*    className="rounded-l-none"*/}
                        {/*    value={unitData.conversionUnit}*/}
                        {/*    onChange={(e) => onUpdate("conversionUnit", e.target.value)}*/}
                        {/*/>*/}
                    </div>
                </div>
            </div>
            <X className="h-5 w-5 hover:cursor-pointer" onClick={onRemove}/>
        </div>
    );
};

const AddStockUnit = ({onAdd}: { onAdd: () => void }) => {
    return (
        <div className="mt-2 flex items-center">
            <div className="grid grid-cols-5 gap-3 pr-4 hover:cursor-default">
                <div className="flex flex-col items-start gap-1">
                    <Input placeholder="Stock" disabled/>
                </div>
                <div className="flex flex-col items-start gap-1">
                    <Input placeholder="Price" disabled/>
                </div>
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                        <Input placeholder="Unit" disabled/>
                        <ArrowRight className="text-gray-400 h-5 w-5"/>
                    </div>
                </div>
                <div className="col-span-2 flex flex-col items-start gap-1">
                    <div className="flex items-center">
                        <Input placeholder="to" className="rounded-r-none" disabled/>
                        <Input placeholder="Unit" className="rounded-l-none" disabled/>
                    </div>
                </div>
            </div>
            <Plus className="h-5 w-5 hover:cursor-pointer" onClick={onAdd}/>
        </div>
    );
};

export default InventoryCard;