import React, {useState, useEffect, useMemo, forwardRef, useImperativeHandle} from "react";
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

// Add this interface at the top
export interface InventoryCardRef {
    getStockData: () => {
        batchVariantId: number;
        currentUnits: (StockUnitData & { supplierUnitId?: number; supplierId?: string })[];
        originalUnits: (StockUnitData & { supplierUnitId?: number; supplierId?: string })[];
    };
}

// Modify component declaration to use forwardRef
const InventoryCard = forwardRef<InventoryCardRef, InventoryCardProps>(
    ({ batch, units, item, onRemove }, ref) => {
        // Get the batch_variant_id of the current batchVariant
    const batchVariantId = batch?.batch_variant_id;

    // Access the supplierUnits from the nested structure and filter by batch_variant_id
    const supplierUnits = useMemo(() =>
            batch?.batch?.batchVariants?.flatMap(b =>
                b.SupplierUnit?.filter(su => su.batch_variant_id === batch.batch_variant_id) || []
            ) || [],
        [batch]
    );

    // Use the first supplierUnit as the main supplier unit
    const mainSupplierUnits = supplierUnits.length > 0 ? [supplierUnits[0]] : [];

    const [stockUnits, setStockUnits] = useState<StockUnitData[]>(mainSupplierUnits);
    const [detailedStockUnits, setDetailedStockUnits] = useState<StockUnitData[]>(() =>
        supplierUnits.map((unit) => ({
            stock: unit.quantity_per_unit,
            price: unit.price % 1 === 0 ? unit.price.toString() : unit.price.toFixed(2),
            unit: unit.unit?.name,
            conversionQty: unit.ConversionRate?.[0]?.conversion_rate || "",
            conversionUnit: unit.ConversionRate?.[0]?.toUnit?.name || "",
        }))
    );

    const [stock, setStock] = useState("");
    const [price, setPrice] = useState("");
    const [unit, setUnit] = useState("");
    const [unitOptions, setUnitOptions] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUnits, setFilteredUnits] = useState<string[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);


        const [originalData] = useState<StockUnitData[]>(() =>
            supplierUnits.map((unit) => ({
                supplierUnitId: unit.supplier_unit_id, // Add this
                supplierId: unit.supplier_id, // Add supplier ID from existing data
                stock: unit.quantity_per_unit.toString(),
                price: unit.price.toFixed(2),
                unit: unit.unit?.name || "",
                conversionQty: unit.ConversionRate?.[0]?.conversion_rate?.toString() || "",
                conversionUnit: unit.ConversionRate?.[0]?.toUnit?.name || ""
            }))
        );

        // Update the ref exposure
        useImperativeHandle(ref, () => ({
            getStockData: () => ({
                batchVariantId: batch.batch_variant_id,
                currentUnits: detailedStockUnits,
                originalUnits: originalData
            })
        }));


        useEffect(() => {
        if (batch && batch.supplierUnits) {
            const details = batch.supplierUnits.map((unit) => ({
                stock: unit.quantity_per_unit,
                price: unit.price % 1 === 0 ? unit.price.toString() : unit.price.toFixed(2),
                unit: unit.unit?.name,
                conversionQty: unit.ConversionRate?.[0]?.conversion_rate || "",
                conversionUnit: unit.ConversionRate?.[0]?.toUnit.name || "",
            }));
            setDetailedStockUnits(details);
        }
    }, [batch]);

    useEffect(() => {
        // Initialize main inputs only once when detailedStockUnits is first loaded
        if (detailedStockUnits.length > 0 && !stock && !price && !unit) {
            setStock(detailedStockUnits[0].stock);
            setPrice(detailedStockUnits[0].price);
            setUnit(detailedStockUnits[0].unit);
        }
    }, [detailedStockUnits]); // Only run when detailedStockUnits changes


    useEffect(() => {
        if (detailedStockUnits.length === 0) {
            addStockUnit();
        }
    }, []);

    // Calculate used units including all units and conversion units from detailedStockUnits
    const usedUnits = useMemo(
        () => detailedStockUnits.flatMap(u => [u.unit, u.conversionUnit]).filter(Boolean),
        [detailedStockUnits]
    );


    useEffect(() => {
        if (units) {
            // Extract unit names from the units array
            setUnitOptions(units.map((unit) => unit.name));
        }
    }, [units]);

    // In the InventoryCard component
// Update first row when main inputs change (with condition)
    useEffect(() => {
        if (detailedStockUnits.length > 0) {
            const firstUnit = detailedStockUnits[0];
            if (firstUnit.stock !== stock || firstUnit.price !== price) {
                const updatedUnits = [...detailedStockUnits];
                updatedUnits[0] = {
                    ...firstUnit,
                    stock: stock,
                    price: price
                };
                setDetailedStockUnits(updatedUnits);
            }
        }
    }, [stock, price]); // Only run when stock/price change

    useEffect(() => {
        if (searchTerm) {
            const filtered = unitOptions
                .filter((name) => !usedUnits.includes(name))
                .filter((name) =>
                    name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            setFilteredUnits(filtered);
            setDropdownVisible(true);
        } else {
            setFilteredUnits([]);
            setDropdownVisible(false);
        }
    }, [searchTerm, unitOptions, usedUnits]);

    // In the logging useEffect
    // useEffect(() => {
    //     console.log("Detailed Stock Units Updated:", detailedStockUnits);
    //     detailedStockUnits.forEach((unit, index) => {
    //         // Find the matching supplier unit by index and conversion details
    //         const supplierUnit = batch?.batch?.batchVariants
    //             ?.flatMap(bv => bv.SupplierUnit)
    //             ?.find(su =>
    //                 su.batch_variant_id === batchVariantId &&
    //                 su.quantity_per_unit === Number(unit.stock) &&
    //                 su.price === Number(unit.price) &&
    //                 su.unit?.name === unit.unit
    //             );
    //
    //         const conversionRate = supplierUnit?.ConversionRate?.[0];
    //
    //         console.log(`Row ${index + 1}:`, {
    //             batchId: batch?.batch_id,
    //             batchVariantId: batchVariantId,
    //             supplierUnitId: supplierUnit?.supplier_unit_id || "Not saved yet",
    //             conversionRateId: conversionRate?.conversion_id || "Not saved yet",
    //             conversionRate: conversionRate?.conversion_rate || "N/A",
    //             fromUnit: conversionRate?.fromUnit?.name || "N/A",
    //             toUnit: conversionRate?.toUnit?.name || "N/A",
    //             ...unit,
    //         });
    //     });
    // }, [detailedStockUnits, batch, batchVariantId]);

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
        const lastUnit = detailedStockUnits[detailedStockUnits.length - 1];
        const newUnit: StockUnitData = {
            stock: "",
            price: "",
            unit: lastUnit?.conversionUnit || "", // Inherit previous conversion unit
            conversionQty: "",
            conversionUnit: "",
        };
        setDetailedStockUnits([...detailedStockUnits, newUnit]);
    };

        const removeStockUnit = (index: number) => {
            const updatedUnits = [...detailedStockUnits];
            const removedUnit = updatedUnits[index];

            // Remove the target unit
            updatedUnits.splice(index, 1);

            // Update previous unit's conversion if needed
            if (index > 0) {
                const prevIndex = index - 1;

                // If there's a next unit after removal
                if (prevIndex < updatedUnits.length - 1) {
                    updatedUnits[prevIndex] = {
                        ...updatedUnits[prevIndex],
                        conversionUnit: updatedUnits[prevIndex + 1].unit,
                        conversionQty: updatedUnits[prevIndex + 1].conversionQty
                    };
                } else {
                    // If no next unit, clear conversion
                    updatedUnits[prevIndex] = {
                        ...updatedUnits[prevIndex],
                        conversionUnit: "",
                        conversionQty: ""
                    };
                }
            }

            // Update following units' base unit
            if (index < updatedUnits.length) {
                updatedUnits.forEach((unit, i) => {
                    if (i >= index && i > 0) {
                        updatedUnits[i].unit = updatedUnits[i - 1].conversionUnit;
                    }
                });
            }

            setDetailedStockUnits(updatedUnits);
        };

    const updateStockUnit = (
        index: number,
        field: keyof StockUnitData,
        value: string
    ) => {
        let updatedUnits = [...detailedStockUnits];

        // Update the current unit
        updatedUnits[index] = {
            ...updatedUnits[index],
            [field]: value
        };

        // Handle conversion unit inheritance
        if (field === "conversionUnit" && index + 1 < updatedUnits.length) {
            updatedUnits[index + 1].unit = value;
        }

        // Check if we should add a new row
        if ((field === "conversionQty" || field === "conversionUnit") &&
            index === updatedUnits.length - 1) {
            const currentUnit = updatedUnits[index];

            if (currentUnit.conversionQty.trim() !== "" &&
                currentUnit.conversionUnit.trim() !== "") {
                // Add new row with inherited unit
                updatedUnits.push({
                    stock: "",
                    price: "",
                    unit: currentUnit.conversionUnit,
                    conversionQty: "",
                    conversionUnit: ""
                });
            }
        }

        // Sync with top-level inputs
        if (index === 0) {
            if (field === "stock" && updatedUnits[0].stock !== stock) {
                setStock(value);
            }
            if (field === "price" && updatedUnits[0].price !== price) {
                setPrice(value);
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
                                                    value={stock}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d*$/.test(value)) {
                                                            setStock(value);
                                                            // Update first row in detailed units
                                                            updateStockUnit(0, "stock", value);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                                <Label className="text-left">Price</Label>
                                                <Input
                                                    placeholder="0000.00"
                                                    value={price}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d*\.?\d*$/.test(value)) {
                                                            setPrice(value);
                                                            // Update first row in detailed units
                                                            updateStockUnit(0, "price", value);
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
                                    usedUnits={usedUnits}
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
},

);


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
                       usedUnits,
                       onRemove,
                       onUpdate,
                   }: {
    unitData: StockUnitData;
    unitOptions: string[];
    previousUnits?: string;
    usedUnits: string[];
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


// In the StockUnit component
    useEffect(() => {
        // Only update if values actually changed
        if (unitData.stock !== stock) setStock(unitData.stock);
        if (unitData.price !== price) setPrice(unitData.price);
        if (unitData.conversionQty !== conversionQty) setConversionQty(unitData.conversionQty);
        if (unitData.conversionUnit !== conversionUnit) setConversionUnit(unitData.conversionUnit);
    }, [unitData]); // Still watch unitData, but only update when values differ

    // Update local state and propagate changes to the parent
    const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStock(value);
        onUpdate("stock", value); // Propagate changes to the parent
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setPrice(value);
            onUpdate("price", value);
        }
    };

    const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') return;

        const numberValue = parseFloat(value);
        if (!isNaN(numberValue)) {
            const formattedValue = numberValue % 1 === 0
                ? numberValue.toString()
                : numberValue.toFixed(2);
            setPrice(formattedValue);
            onUpdate("price", formattedValue);
        }
    };

    const handleConversionQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setConversionQty(value);
        onUpdate("conversionQty", value); // Propagate changes to the parent
    };

    const handleSelectUnit = (selectedUnit: string) => {
        if (usedUnits.includes(selectedUnit) && selectedUnit !== unitData.conversionUnit) {
            return; // Prevent selecting duplicate units
        }
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

    useEffect(() => {
        if (searchTerm) {
            setFilteredUnits(
                unitOptions
                    .filter(unit =>
                        !usedUnits.includes(unit) ||
                        unit === unitData.conversionUnit
                    )
                    .filter(unitName =>
                        unitName.toLowerCase().includes(searchTerm.toLowerCase())
                    )
            );
            setDropdownVisible(true);
        } else {
            setFilteredUnits([]);
            setDropdownVisible(false);
        }
    }, [searchTerm, unitOptions, usedUnits, unitData.conversionUnit]);


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
                        onBlur={handlePriceBlur}
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
