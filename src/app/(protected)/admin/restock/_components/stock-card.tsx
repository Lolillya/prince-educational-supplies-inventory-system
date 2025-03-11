import React, { useState, useEffect, useMemo } from "react";
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
  onStockUnitsChange: (stockUnits: StockUnitData[]) => void; // Add this type
};

const StockCard = ({
  item,
  onRemove,
  stockValue,
  onStockChange,
  onPriceChange,
  onUnitChange,
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
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Use TRPC to fetch units from the backend
  const { data: units, isLoading, isError } = api.restock.getUnits.useQuery();

  let content = null; // Handle conditional rendering outside hooks
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isError) {
    content = <p>Error loading units</p>;
  }

  // Calculate used units including main unit and all conversion units
  const usedUnits = useMemo(
    () => [
      unit,
      ...stockUnits.map((u) => u.conversionUnit).filter(Boolean),
    ],
    [unit, stockUnits]
  );

  // Whenever stockUnits change, notify the parent
  useEffect(() => {
    onStockUnitsChange(stockUnits);
  }, [stockUnits, onStockUnitsChange]); // Make sure onStockUnitsChange is called when stockUnits change

  useEffect(() => {
    if (stockUnits.length > 0 && stockUnits[0]?.stock) {
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
    // Auto-open accordion if required fields are filled
    if (stockValue && stockUnits[0]?.price && unit) {
      setAccordionOpen(true);
    }
  }, [stockValue, stockUnits, unit]);


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

  // Update filtered units for main unit dropdown
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
      const selectedUnit = filteredUnits[highlightedIndex];
      if (selectedUnit) {
        handleSelectUnit(selectedUnit);
      }
    }
  };

  const addStockUnit = () => {
    const newUnit: StockUnitData = {
      stock: "",
      price: "",
      unit: "",
      conversionQty: "",
      conversionUnit: "",
    };
    setStockUnits([...stockUnits, newUnit]);
  };

  const removeStockUnit = (index: number) => {
    const updatedUnits = stockUnits.filter((_, i) => i !== index);
    setStockUnits(updatedUnits);
  };

  const updateStockUnit = (
    index: number,
    field: keyof StockUnitData,
    value: string
  ) => {
    const updatedUnits = stockUnits.map((unit, i) =>
      i === index ? { ...unit, [field]: value } : unit
    );

    // Auto-add new card when both conversion fields are filled in the last unit
    if (index === updatedUnits.length - 1) {
      const currentUnit = updatedUnits[index];
      if (currentUnit?.conversionQty && currentUnit?.conversionUnit) {
        updatedUnits.push({
          stock: "",
          price: "",
          unit: "",
          conversionQty: "",
          conversionUnit: "",
        });
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
        <Accordion type="single" value={accordionOpen ? "item-1" : ""}>
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
                        onStockChange(Number(value)); // Convert string to number
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
                        onPriceChange(Number(value)); // Convert string to number
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
                          className={`z-[99999] cursor-pointer px-4 py-2 hover:bg-emerald-100 ${highlightedIndex === index ? "bg-emerald-200" : ""
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
                  usedUnits={usedUnits}
                  inheritedUnit={index === 0 ? unit : undefined}
                  inheritedStock={index === 0 ? stock : undefined}
                  inheritedPrice={index === 0 ? price : undefined}
                  previousUnits={
                    index > 0 && stockUnits[index - 1]?.conversionUnit
                      ? stockUnits[index - 1]?.conversionUnit
                      : undefined
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
  usedUnits,
  onRemove,
  onUpdate,
  inheritedUnit,
  inheritedStock,
  inheritedPrice,
}: {
  unitData: StockUnitData;
  unitOptions: string[];
  previousUnits?: string;
  usedUnits: string[];
  onRemove: () => void;
  onUpdate: (field: keyof StockUnitData, value: string) => void;
  inheritedUnit?: string;
  inheritedStock?: string;
  inheritedPrice?: string;
}) => {
  const [filteredUnits, setFilteredUnits] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleSelectUnit = (selectedUnit: string) => {
    if (usedUnits.includes(selectedUnit) && selectedUnit !== unitData.conversionUnit) {
      return; // Prevent selecting duplicate units
    }
    onUpdate("conversionUnit", selectedUnit);
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
      const selectedUnit = filteredUnits[highlightedIndex];
      if (selectedUnit) {
        handleSelectUnit(selectedUnit);
      }
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
          // disabled
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <Input
            placeholder="0000.00"
            value={unitData.price} // Use the value from `unitData`
            onChange={(e) => onUpdate("price", e.target.value)}
          // disabled
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
                  className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${highlightedIndex === index ? "bg-emerald-200" : ""
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
