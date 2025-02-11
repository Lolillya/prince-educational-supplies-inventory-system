import React, { useState, useEffect } from "react";
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
import { api } from "~/trpc/react";
import Link from "next/link";

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
    stockValue: string;
    onStockChange: (newStock: number) => void;
};

const InventoryCard = ({ batch, units, item, onRemove, stockValue, onStockChange }: InventoryCardProps) => {
    // Get the batch_variant_id of the current batchVariant
    const batchVariantId = batch?.batch_variant_id;

    // Access the supplierUnits from the nested structure and filter by batch_variant_id
    const supplierUnits = batch?.batch?.batchVariants
        ?.flatMap(b => b.SupplierUnit)
        .filter(supplierUnit => supplierUnit.batch_variant_id === batchVariantId) || [];

    // Use the first supplierUnit as the main supplier unit
    const mainSupplierUnits = supplierUnits.length > 0 ? [supplierUnits[0]] : [];

    const [stockUnits, setStockUnits] = useState<StockUnitData[]>(mainSupplierUnits);
    const [detailedStockUnits, setDetailedStockUnits] = useState<StockUnitData[]>(() =>
        supplierUnits.map((unit) => ({
            stock: unit.quantity_per_unit,
            price: Number(unit.price).toFixed(2),
            unit: unit.unit?.name,
            conversionQty: unit.ConversionRate?.[0]?.conversion_rate || "",
            conversionUnit: unit.ConversionRate?.[0]?.toUnit?.name || "",
        }))
    );

    // // Log the batchVariant and supplierUnits for debugging
    // useEffect(() => {
    //     console.log("Batch Variant:", batch);
    //     console.log("Supplier Units in Batch Variant:", supplierUnits);
    // }, [batch, supplierUnits]);



    const [stock, setStock] = useState("");
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState("");
    const [unitOptions, setUnitOptions] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUnits, setFilteredUnits] = useState<string[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    useEffect(() => {
        if (batch && batch.supplierUnits) {
            const details = batch.supplierUnits.map((unit) => ({
                stock: unit.quantity_per_unit,
                price: Number(unit.price).toFixed(2),
                unit: unit.unit?.name,
                conversionQty: unit.ConversionRate?.[0]?.conversion_rate || "",
                conversionUnit: unit.ConversionRate?.[0]?.toUnit.name || "",
            }));
            setDetailedStockUnits(details);
        }
    }, [batch]);

    useEffect(() => {
        if (detailedStockUnits.length > 0) {
            setStock(detailedStockUnits[0].stock);
            setPrice(detailedStockUnits[0].price);
            setUnit(detailedStockUnits[0].unit);
        }
    }, [detailedStockUnits]);

    useEffect(() => {
        if (detailedStockUnits.length === 0) {
            addStockUnit();
        }
    }, []);


    useEffect(() => {
        if (units) {
            // Extract unit names from the units array
            setUnitOptions(units.map((unit) => unit.name));
        }
    }, [units]);


    useEffect(() => {
        // Filter units based on the search term
        if (searchTerm) {
            setFilteredUnits(
                unitOptions.filter((unitName) =>
                    unitName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setDropdownVisible(true);
        } else {
            setFilteredUnits([]);
            setDropdownVisible(false);
        }
    }, [searchTerm, unitOptions]);

    // useEffect(() => {
    //     console.log("Detailed Stock Units Updated:", detailedStockUnits);
    //     // Log additional details like batch/batchVariant ID, supplierUnit ID, and conversionRate ID
    //     detailedStockUnits.forEach((unit, index) => {
    //         console.log(`Row ${index + 1}:`, {
    //             batchId: batch?.batch_id,
    //             batchVariantId: batch?.batch?.batchVariants?.[0]?.batch_variant_id,
    //             supplierUnitId: batch?.supplierUnits?.[index]?.supplier_unit_id,
    //             conversionRateId: batch?.supplierUnits?.[index]?.ConversionRate?.[0]?.conversion_rate_id,
    //             ...unit,
    //         });
    //     });
    // }, [detailedStockUnits]);
    useEffect(() => {
        console.log("Detailed Stock Units Updated:", detailedStockUnits);
        detailedStockUnits.forEach((unit, index) => {
            const supplierUnit = batch?.batch?.batchVariants?.[0]?.SupplierUnit?.[index];
            const conversionRate = supplierUnit?.ConversionRate?.[0];

            console.log(`Row ${index + 1}:`, {
                batchId: batch?.batch_id,
                batchVariantId: batch?.batch?.batchVariants?.[0]?.batch_variant_id,
                supplierUnitId: supplierUnit?.supplier_unit_id, // Access supplier_unit_id
                conversionRateId: conversionRate?.conversion_id, // Access conversion_id
                conversionRate: conversionRate?.conversion_rate, // Access conversion_rate
                fromUnit: conversionRate?.fromUnit?.name, // Access fromUnit name
                toUnit: conversionRate?.toUnit?.name, // Access toUnit name
                ...unit,
            });
        });
    }, [detailedStockUnits, batch]);

    const handleSelectUnit = (unitName: string) => {
        setUnit(unitName);
        setSearchTerm("");
        setDropdownVisible(false);
        setHighlightedIndex(-1);

        updateStockUnit(0, "unit", unitName);
    };


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value === "") {
            setUnit("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            setHighlightedIndex((prevIndex) =>
                prevIndex < filteredUnits.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === "ArrowUp") {
            setHighlightedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
            );
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            handleSelectUnit(filteredUnits[highlightedIndex]);
        }
    };

    const addStockUnit = () => {
        if (detailedStockUnits.length > 0) {
            // Get the last stock unit for calculations
            const lastUnit = detailedStockUnits[detailedStockUnits.length - 1];
            const conversionQty = parseFloat(lastUnit.conversionQty || "0");
            const currentStock = parseFloat(lastUnit.stock || "0");
            const currentPrice = parseFloat(lastUnit.price || "0");

            if (
                conversionQty > 0 &&
                !isNaN(conversionQty) &&
                currentStock > 0 &&
                !isNaN(currentStock) &&
                currentPrice > 0 &&
                !isNaN(currentPrice)
            ) {
                // Calculate stock and price for the next unit
                const newUnit: StockUnitData = {
                    stock: (currentStock * conversionQty).toString(),
                    price: (currentPrice / conversionQty).toFixed(2),
                    unit: "", // New unit is empty initially
                    conversionQty: "",
                    conversionUnit: "",
                };
                setDetailedStockUnits([...detailedStockUnits, newUnit]);
            } else {
                // Add a blank unit if calculations cannot be performed
                const blankUnit: StockUnitData = {
                    stock: "",
                    price: "",
                    unit: "",
                    conversionQty: "",
                    conversionUnit: "",
                };
                setDetailedStockUnits([...detailedStockUnits, blankUnit]);
            }
        } else {
            // For the first unit, inherit the top-level stock and price
            const initialUnit: StockUnitData = {
                stock,
                price,
                unit,
                conversionQty: "",
                conversionUnit: "",
            };
            setDetailedStockUnits([initialUnit]);
        }
    };

    const removeStockUnit = (index: number) => {
        // Remove the selected row
        const updatedUnits = detailedStockUnits.filter((_, i) => i !== index);

        // Recalculate stock and price for rows after the removed one
        for (let i = index; i < updatedUnits.length; i++) {
            if (i === 0) {
                // First row inherits the top-level stock and price
                updatedUnits[i].stock = stock;
                updatedUnits[i].price = price;
            } else {
                // Recalculate based on the previous row
                const prevUnit = updatedUnits[i - 1];
                const conversionQty = parseFloat(prevUnit.conversionQty || "0");
                const prevStock = parseFloat(prevUnit.stock || "0");
                const prevPrice = parseFloat(prevUnit.price || "0");

                if (
                    prevStock > 0 &&
                    !isNaN(prevStock) &&
                    conversionQty > 0 &&
                    !isNaN(conversionQty) &&
                    prevPrice > 0 &&
                    !isNaN(prevPrice)
                ) {
                    updatedUnits[i].stock = (prevStock * conversionQty).toString();
                    updatedUnits[i].price = (prevPrice / conversionQty).toFixed(2);
                } else {
                    // Reset if calculations can't be performed
                    updatedUnits[i].stock = "";
                    updatedUnits[i].price = "";
                }
            }
        }

        setDetailedStockUnits(updatedUnits);
    };


    const updateStockUnit = (
        index: number,
        field: keyof StockUnitData,
        value: string
    ) => {
        // Update the specific field of the current unit
        const updatedUnits = detailedStockUnits.map((unit, i) =>
            i === index ? { ...unit, [field]: value } : unit
        );

        // If the field being updated is "conversionUnit", cascade the change to the immediate next row
        if (field === "conversionUnit") {
            // Only update the immediate next row if it exists
            if (index + 1 < updatedUnits.length) {
                const nextUnit = updatedUnits[index + 1];

                // Update the next row's unit to the new conversionUnit value
                nextUnit.unit = value; // Always update the unit for the immediate next row
            }
        }

        // Check if the reset condition is triggered (conversionQty, conversionUnit, stock, or price is cleared)
        const isResetRequired =
            (field === "conversionQty" && (!value || value.trim() === "")) ||
            (field === "conversionUnit" && (!value || value.trim() === "")) ||
            (field === "stock" && (!value || value.trim() === "")) ||
            (field === "price" && (!value || value.trim() === ""));

        // If reset is required, clear all rows below the current row
        if (isResetRequired) {
            for (let i = index + 1; i < updatedUnits.length; i++) {
                updatedUnits[i].stock = "";
                updatedUnits[i].price = "";
            }
            setDetailedStockUnits(updatedUnits);
            return; // Exit early since no further calculations are needed
        }

        // Apply cascading logic for stock and price, starting with the next row
        for (let i = 0; i < updatedUnits.length - 1; i++) {
            const currentUnit = updatedUnits[i]; // Current row
            const nextUnit = updatedUnits[i + 1]; // Next row

            // Parse relevant fields
            const conversionQty =
                i === index && field === "conversionQty"
                    ? parseFloat(value || "")
                    : parseFloat(currentUnit.conversionQty || "");

            const currentStock = parseFloat(currentUnit.stock || "");
            const currentPrice = parseFloat(currentUnit.price || "");

            // **NEW CHECK**: Skip calculations if "conversionUnit" or "stock" is empty
            if (!currentUnit.conversionUnit || currentUnit.conversionUnit.trim() === "") {
                nextUnit.stock = "";
                nextUnit.price = "";
                continue;
            }

            if (!currentStock || isNaN(currentStock) || !currentPrice || isNaN(currentPrice)) {
                nextUnit.stock = "";
                nextUnit.price = "";
                continue;
            }

            // Perform calculations for the NEXT row
            if (conversionQty && conversionQty > 0 && !isNaN(conversionQty)) {
                // nextUnit.stock = (currentStock * conversionQty).toString();
                // nextUnit.price = (currentPrice / conversionQty).toFixed(2);
                nextUnit.stock = "";
                nextUnit.price = "";
            } else {
                nextUnit.stock = "";
                nextUnit.price = "";
            }
        }

        setDetailedStockUnits(updatedUnits);
    };

    return (
        <div className="border-gray-200 h-auto w-full rounded-xl border px-4 pt-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <p>
                    Batch {batch?.batch_id || "N/A"}
                    <span className="pl-3">
            <Link href="#" className="text-gray-400 hover:underline">

                {batch?.batch?.batchVariants?.[0]?.SupplierUnit?.[0]?.supplier?.Personal_Details?.first_name || "Unknown"}{" "}
                {batch?.batch?.batchVariants?.[0]?.SupplierUnit?.[0]?.supplier?.Personal_Details?.last_name || "Supplier"}

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
                            <div
                                className="grid grid-cols-1 gap-4 pr-4 hover:cursor-default"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {stockUnits.length > 0 ? (
                                    stockUnits.map((supplierUnit, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <Label className="text-left">Stock</Label>
                                                <Input
                                                    placeholder="000"
                                                    defaultValue={Number(supplierUnit.quantity_per_unit).toFixed(2)}
                                                    //value={stock}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d*$/.test(value)) { // Allow only numeric input
                                                            setStock(value); // Notify parent of changes
                                                            updateStockUnit(0, "stock", value); // Propagate changes
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                                <Label className="text-left">Price</Label>
                                                <Input
                                                    placeholder="0000.00"
                                                    defaultValue={Number(supplierUnit.price).toFixed(2)}
                                                    //value={price}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d*\.?\d*$/.test(value)) { // Allow digits and optional decimal
                                                            setPrice(value);
                                                            updateStockUnit(0, "price", value); // Propagate changes
                                                        }
                                                    }}
                                                />

                                            </div>
                                            <div className="relative flex flex-col items-start gap-1">
                                                <Label className="text-left">Unit</Label>
                                                <Input
                                                    placeholder="Search Unit"
                                                    //defaultValue={supplierUnit.unit?.name}
                                                    value={"" || searchTerm || unit || supplierUnit.unit?.name}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^[a-zA-Z ]*$/.test(value)) { // Allow letters and spaces only
                                                            handleSearchChange(e);
                                                        }
                                                    }}
                                                    className="bg-emerald-100 text-black placeholder-slate-500"
                                                    onFocus={() => setDropdownVisible(true)} // Show dropdown on focus
                                                    onBlur={() => setDropdownVisible(false)} // Hide dropdown on blur
                                                    onKeyDown={handleKeyDown} // Handle arrow keys and Enter
                                                />
                                                {dropdownVisible && filteredUnits.length > 0 && (
                                                    <div
                                                        className="absolute top-full left-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                                                        style={{maxHeight: "200px", overflowY: "auto"}}
                                                    >
                                                        {filteredUnits.map((unitName, index) => (
                                                            <div
                                                                key={index}
                                                                className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${
                                                                    highlightedIndex === index ? "bg-emerald-200" : ""
                                                                }`}
                                                                onMouseDown={() => handleSelectUnit(unitName)}
                                                            >
                                                                {unitName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No supplier units available</p>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Separator orientation="horizontal"/>
                            <div className="mt-2 grid grid-cols-5 gap-3 pr-4">
                                <div>Stock</div>
                                <div>Price</div>
                                <div>Unit (Single)</div>
                                <div className="col-span-2">Conversion</div>
                            </div>
                            {detailedStockUnits.map((unitData, index) => (
                                <StockUnit
                                    key={index}
                                    unitData={unitData}
                                    unitOptions={unitOptions}
                                    inheritedUnit={index === 0 ? unit : undefined} // Pass top "Unit" value to the first StockUnit
                                    inheritedStock={index === 0 ? stock : undefined} // Pass stock from the parent for the first layer
                                    inheritedPrice={index === 0 ? price : undefined} // Pass price from the parent for the first layer
                                    previousUnits={
                                        index > 0 ? detailedStockUnits[index - 1].conversionUnit : undefined
                                    }
                                    onRemove={() => removeStockUnit(index)}
                                    onUpdate={(field, value) => updateStockUnit(index, field, value)}
                                />
                            ))}
                            <AddStockUnit onAdd={addStockUnit}/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            {/*<div>*/}
            {/*    <button*/}
            {/*        className="mt-4 bg-red text-white px-4 py-2 rounded"*/}
            {/*        onClick={() => {*/}
            {/*            console.log("AccordionItem Data:");*/}
            {/*            console.log({*/}
            {/*                stockValue: stock,*/}
            {/*                price: price,*/}
            {/*                unit: unit,*/}
            {/*            });*/}
            {/*            console.log("StockUnits Data:");*/}
            {/*            // Ensure units are assigned correctly*/}
            {/*            stockUnits.forEach((unit, index) => {*/}
            {/*                if (!unit.unit) {*/}
            {/*                    unit.unit = index > 0 ? stockUnits[index - 1].conversionUnit : unit.unit;*/}
            {/*                }*/}
            {/*                console.log(`StockUnit ${index + 1}: `, unit);*/}
            {/*            });*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        Log Accordion and StockUnits*/}
            {/*    </button>*/}
            {/*</div>*/}
        </div>
    )
        ;
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
                       unitOptions,
                       previousUnits,
                       onRemove,
                       onUpdate,
                   }: {
    unitData: StockUnitData;
    unitOptions: string[];
    previousUnits?: string;
    onRemove: () => void;
    onUpdate: (field: keyof StockUnitData, value: string) => void;
}) => {
    // Local state for each input field
    const [stock, setStock] = useState(unitData.stock);
    const [price, setPrice] = useState(unitData.price);
    const [conversionQty, setConversionQty] = useState(unitData.conversionQty);
    const [conversionUnit, setConversionUnit] = useState(unitData.conversionUnit);

    // Dropdown state for unit selection
    const [filteredUnits, setFilteredUnits] = useState<string[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [searchTerm, setSearchTerm] = useState("");

    // Update local state and propagate changes to the parent
    const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStock(value);
        onUpdate("stock", value); // Propagate changes to the parent
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPrice(value);
        onUpdate("price", value); // Propagate changes to the parent
    };

    const handleConversionQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConversionQty(value);
        onUpdate("conversionQty", value); // Propagate changes to the parent
    };

    const handleSelectUnit = (selectedUnit: string) => {
        setConversionUnit(selectedUnit);
        setSearchTerm("");
        setDropdownVisible(false);
        setHighlightedIndex(-1);
        onUpdate("conversionUnit", selectedUnit); // Propagate changes to the parent
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value === "") {
            setConversionUnit("");
            onUpdate("conversionUnit", ""); // Propagate changes to the parent
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            setHighlightedIndex((prevIndex) =>
                prevIndex < filteredUnits.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === "ArrowUp") {
            setHighlightedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
            );
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            handleSelectUnit(filteredUnits[highlightedIndex]);
        }
    };

    // Filter units based on the search term
    useEffect(() => {
        if (searchTerm) {
            setFilteredUnits(
                unitOptions.filter((unitName) =>
                    unitName.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setDropdownVisible(true);
        } else {
            setFilteredUnits([]);
            setDropdownVisible(false);
        }
    }, [searchTerm, unitOptions]);

    return (
        <div className="mt-2 flex items-center">
            <div className="grid grid-cols-5 gap-3 pr-4">
                {/* Stock Input */}
                <div className="flex flex-col items-start gap-1">
                    <Input
                        placeholder="000"
                        value={stock}
                        onChange={handleStockChange}
                    />
                </div>

                {/* Price Input */}
                <div className="flex flex-col items-start gap-1">
                    <Input
                        placeholder="0000.00"
                        value={price}
                        onChange={handlePriceChange}
                    />
                </div>

                {/* Unit Input (Disabled) */}
                <div className="flex flex-col items-start gap-1">
                    <Input
                        placeholder="Unit"
                        value={unitData.unit || previousUnits}
                        disabled
                    />
                </div>

                {/* Conversion Input */}
                <div className="col-span-2 flex flex-col items-start gap-1 relative">
                    <div className="flex">
                        <Input
                            placeholder="Qty."
                            className="rounded-r-none"
                            value={conversionQty}
                            onChange={handleConversionQtyChange}
                        />
                        <Input
                            placeholder="Units"
                            className="rounded-l-none"
                            value={searchTerm || conversionUnit}
                            onChange={handleSearchChange}
                            onFocus={() => setDropdownVisible(true)}
                            onBlur={() => setDropdownVisible(false)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    {dropdownVisible && filteredUnits.length > 0 && (
                        <div
                            className="absolute top-full left-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                            {filteredUnits.map((unitName, index) => (
                                <div
                                    key={index}
                                    className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${
                                        highlightedIndex === index ? "bg-emerald-200" : ""
                                    }`}
                                    onMouseDown={() => handleSelectUnit(unitName)}
                                >
                                    {unitName}
                                </div>
                            ))}
                        </div>
                    )}
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
                        <Input placeholder="Units" className="rounded-l-none" disabled />
                    </div>
                </div>
            </div>
            <Plus className="h-5 w-5 hover:cursor-pointer" onClick={onAdd} />
        </div>
    );
};

export default InventoryCard;



