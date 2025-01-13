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
import { api } from "~/trpc/react"; // Correct import for TRPC hooks

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
  stockValue: string; // Controlled stock value from parent
  onStockChange: (newStock: number) => void; // Callback for stock changes
  onPriceChange: (newPrice: number) => void; // Callback for stock changes
  onUnitChange: (newUnit: string) => void; // Callback for unit changes
  onStockUnitsChange;
};

const StockCard = ({
  item,
  onRemove,
  stockValue,
  onStockChange,
  onPriceChange,
  onUnitChange,
  onConversionUnitChange,
  onConversionRateChange,
  onStockUnitsChange,
}: StockCardProps) => {
  const [stockUnits, setStockUnits] = useState<StockUnitData[]>([]);
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState(""); // This is for the selected unit
  const [unitOptions, setUnitOptions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // This is for the search input
  const [filteredUnits, setFilteredUnits] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1); // Index of the highlighted unit in the dropdown

  // Use TRPC to fetch units from the backend
  const { data: units, isLoading, isError } = api.restock.getUnits.useQuery();

  let content = null; // Handle conditional rendering outside hooks
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isError) {
    content = <p>Error loading units</p>;
  }

  // Whenever stockUnits change, notify the parent
  useEffect(() => {
    onStockUnitsChange(stockUnits);
  }, [stockUnits, onStockUnitsChange]); // Make sure onStockUnitsChange is called when stockUnits change

  useEffect(() => {
    if (stockUnits.length > 0) {
      setStock(stockUnits[0].stock);
      setPrice(stockUnits[0].price);
      setUnit(stockUnits[0].unit);
    }
  }, [stockUnits]);

  useEffect(() => {
    if (stockUnits.length === 0) {
      addStockUnit();
    }
  }, []);

  useEffect(() => {
    if (units) {
      // Set unit options when the units data is available
      setUnitOptions(units.map((unit) => unit.name));
    }
  }, [units]);

  useEffect(() => {
    // Filter units based on the search term
    if (searchTerm) {
      setFilteredUnits(
        unitOptions.filter((unitName) =>
          unitName.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
      setDropdownVisible(true);
    } else {
      setFilteredUnits([]);
      setDropdownVisible(false);
    }
  }, [searchTerm, unitOptions]);

  const handleSelectUnit = (unitName: string) => {
    setUnit(unitName); // Set the unit at the top level
    setSearchTerm(""); // Clear the search term once a unit is selected
    setDropdownVisible(false); // Hide the dropdown
    setHighlightedIndex(-1); // Reset the highlighted index to default
    onUnitChange(unitName);

    updateStockUnit(0, "unit", unitName); // Update all child units (if necessary)
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onUnitChange(value); // Notify parent of the new search term

    if (value === "") {
      setUnit(""); // Reset the unit if search term is cleared
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        prevIndex < filteredUnits.length - 1 ? prevIndex + 1 : prevIndex,
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleSelectUnit(filteredUnits[highlightedIndex]);
    }
  };

  const addStockUnit = () => {
    if (stockUnits.length > 0) {
      // Get the last stock unit for calculations
      const lastUnit = stockUnits[stockUnits.length - 1];
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
        setStockUnits([...stockUnits, newUnit]);
      } else {
        // Add a blank unit if calculations cannot be performed
        const blankUnit: StockUnitData = {
          stock: "",
          price: "",
          unit: "",
          conversionQty: "",
          conversionUnit: "",
        };
        setStockUnits([...stockUnits, blankUnit]);
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
      setStockUnits([initialUnit]);
    }
  };

  const removeStockUnit = (index: number) => {
    // Remove the selected row
    const updatedUnits = stockUnits.filter((_, i) => i !== index);

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

    // Update the state with recalculated rows
    setStockUnits(updatedUnits);
  };

  const updateStockUnit = (
    index: number,
    field: keyof StockUnitData,
    value: string,
  ) => {
    // Update the specific field of the current unit
    const updatedUnits = stockUnits.map((unit, i) =>
      i === index ? { ...unit, [field]: value } : unit,
    );

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
      setStockUnits(updatedUnits);
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
      if (
        !currentUnit.conversionUnit ||
        currentUnit.conversionUnit.trim() === ""
      ) {
        nextUnit.stock = "";
        nextUnit.price = "";
        continue;
      }

      if (
        !currentStock ||
        isNaN(currentStock) ||
        !currentPrice ||
        isNaN(currentPrice)
      ) {
        nextUnit.stock = "";
        nextUnit.price = "";
        continue;
      }

      // Perform calculations for the NEXT row
      if (conversionQty && conversionQty > 0 && !isNaN(conversionQty)) {
        nextUnit.stock = (currentStock * conversionQty).toString();
        nextUnit.price = (currentPrice / conversionQty).toFixed(2);
      } else {
        nextUnit.stock = "";
        nextUnit.price = "";
      }
    }

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
                    value={stockValue} // Controlled value from parent
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        // Allow only numeric input
                        onStockChange(value); // Notify parent of changes
                        updateStockUnit(0, "stock", value); // Propagate changes
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
                        // Allow digits and optional decimal
                        onPriceChange(value);
                        updateStockUnit(0, "price", value); // Propagate changes
                      }
                    }}
                  />
                </div>
                <div className="relative flex flex-col items-start gap-1">
                  <Label className="text-left">Unit</Label>
                  <Input
                    placeholder="Search Unit"
                    value={searchTerm || unit} // Use `unit` or `searchTerm`
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-Z ]*$/.test(value)) {
                        // Allow letters and spaces only
                        onUnitChange(value);
                        updateStockUnit(0, "unit", value); // Propagate changes
                        handleSearchChange(e);
                      }
                    }}
                    className="w-64 bg-emerald-100 text-black placeholder-slate-500"
                    // className="bg-emerald-100 text-black placeholder-slate-500 w-full sm:w-3/4 md:w-1/2"
                    onFocus={() => setDropdownVisible(true)} // Show dropdown on focus
                    onBlur={() => setDropdownVisible(false)} // Hide dropdown on blur
                    onKeyDown={handleKeyDown} // Handle arrow keys and Enter
                  />

                  {dropdownVisible && filteredUnits.length > 0 && (
                    <div
                      className="absolute left-0 top-full z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                      style={{ maxHeight: "200px", overflowY: "auto" }}
                    >
                      {filteredUnits.map((unitName, index) => (
                        <div
                          key={index}
                          className={`z-[99999] cursor-pointer px-4 py-2 hover:bg-emerald-100 ${
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
            </AccordionTrigger>
            <AccordionContent>
              <Separator orientation="horizontal" />
              <div className="mt-2 grid grid-cols-5 gap-3 pr-4">
                <div>Stock</div>
                <div>Price</div>
                <div>Unit (Single)</div>
                <div className="col-span-2">Conversion</div>
              </div>
              {stockUnits.map((unitData, index) => (
                <StockUnit
                  key={index}
                  unitData={unitData}
                  unitOptions={unitOptions}
                  inheritedUnit={index === 0 ? unit : undefined} // Pass top "Unit" value to the first StockUnit
                  inheritedStock={index === 0 ? stock : undefined} // Pass stock from the parent for the first layer
                  inheritedPrice={index === 0 ? price : undefined} // Pass price from the parent for the first layer
                  previousUnits={
                    index > 0 ? stockUnits[index - 1].conversionUnit : undefined
                  }
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
  const [filteredUnits, setFilteredUnits] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchTerm) {
      setFilteredUnits(
        unitOptions.filter((unitName) =>
          unitName.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
      setDropdownVisible(true);
    } else {
      setFilteredUnits([]);
      setDropdownVisible(false);
    }
  }, [searchTerm, unitOptions]);

  const handleSelectUnit = (selectedUnit: string) => {
    onUpdate("conversionUnit", selectedUnit); // Update conversionUnit in parent
    setSearchTerm("");
    setDropdownVisible(false);
    setHighlightedIndex(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      onUpdate("conversionUnit", ""); // Clear if search term is empty
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        prevIndex < filteredUnits.length - 1 ? prevIndex + 1 : prevIndex,
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleSelectUnit(filteredUnits[highlightedIndex]);
    }
  };

  return (
    <div className="mt-2 flex items-center">
      <div className="grid grid-cols-5 gap-3 pr-4">
        <div className="flex flex-col items-start gap-1">
          <Input
            placeholder="000"
            value={unitData.stock} // Use the value from `unitData`
            onChange={(e) => onUpdate("stock", e.target.value)}
            disabled
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <Input
            placeholder="0000.00"
            value={unitData.price} // Use the value from `unitData`
            onChange={(e) => onUpdate("price", e.target.value)}
            disabled
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <Input
            placeholder="Unit"
            value={unitData.unit || previousUnits} // Show `unitData.unit` or previous units
            disabled
            onChange={(e) => onUpdate("unit", e.target.value)}
          />
        </div>
        <div className="relative col-span-2 flex flex-col items-start gap-1">
          <div className="flex">
            <Input
              placeholder="Qty."
              className="rounded-r-none"
              value={unitData.conversionQty}
              onChange={(e) => {
                const value = e.target.value;
                // Allow only numbers and a single optional decimal point
                if (/^\d*\.?\d*$/.test(value)) {
                  onUpdate("conversionQty", value);
                }
              }}
            />
            <Input
              placeholder="Units"
              className="rounded-l-none"
              value={searchTerm || unitData.conversionUnit} // Show searchTerm or conversionUnit
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z]*$/.test(value)) {
                  handleSearchChange(e);
                }
              }}
              onFocus={() => setDropdownVisible(true)}
              onBlur={() => setDropdownVisible(false)}
              onKeyDown={handleKeyDown}
            />
          </div>
          {dropdownVisible && filteredUnits.length > 0 && (
            <div
              className="absolute left-0 top-full z-10 mt-1 w-full rounded-md bg-white shadow-lg"
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

export default StockCard;
