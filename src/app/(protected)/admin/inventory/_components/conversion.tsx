import { CornerDownRight, X } from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";

interface ConversionProps {
  data: {
    id: number;
    qty: string;
    unit: string;
    stock: string;
    price: string;
  };
  position: number;
  onRemove: () => void;
  onUpdate: (data: ConversionProps["data"]) => void;
  onPriceBlur?: (price: string) => void;
  usedUnits?: string[]; // Array of units that are already in use
}

const Conversion = ({ data, onRemove, onUpdate, onPriceBlur, position, usedUnits = [] }: ConversionProps) => {
  const [inputValue, setInputValue] = useState(data.unit);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showQtyError, setShowQtyError] = useState(false);
  const [showPriceError, setShowPriceError] = useState(false);
  const [rawPriceInput, setRawPriceInput] = useState("");
  
  // Use a ref instead of state to track dropdown selection - refs update immediately
  const wasSelectedFromDropdown = useRef(false);

  const { data: units } = api.restock.getUnits.useQuery();
  const unitOptions = units?.map((unit) => unit.name) ?? [];
  
  // Filter out units that are already in use, except for the current unit
  const availableUnitOptions = useMemo(() => {
    return unitOptions.filter(unit => 
      !usedUnits.includes(unit) || unit === data.unit
    );
  }, [unitOptions, usedUnits, data.unit]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const conversionRef = useRef<HTMLDivElement>(null);  // New ref for scrolling

  // Filter units for dropdown - show all available units or filtered by input
  const filteredUnits = inputValue
      ? availableUnitOptions.filter((name) =>
          name.toLowerCase().includes(inputValue.toLowerCase())
      )
      : availableUnitOptions;

  useEffect(() => {
    if (data.unit !== inputValue) {
      setInputValue(data.unit);
    }
  }, [data.unit, inputValue]);

  // If unit is in the valid options, consider it selected from dropdown
  useEffect(() => {
    if (data.unit && unitOptions.includes(data.unit)) {
      wasSelectedFromDropdown.current = true;
    }
  }, [data.unit, unitOptions]);

  const handleSelectUnit = (unitName: string) => {
    // Mark as selected from dropdown using the ref (immediate update)
    wasSelectedFromDropdown.current = true;
    
    // Update the input value and data
    setInputValue(unitName);
    setHighlightedIndex(-1);
    setIsDropdownVisible(false);
    onUpdate({
      ...data,
      unit: unitName,
    });
    
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleQtyChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "") || "";
    onUpdate({
      ...data,
      qty: numericValue,
    });
  };

  const handleUnitChange = (value: string) => {
    onUpdate({
      ...data,
      unit: value,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
          inputRef.current &&
          dropdownRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
        
        // Only clear if not in valid options AND not selected from dropdown
        const isValidUnit = unitOptions.includes(data.unit);
        
        if (!isValidUnit && data.unit && !wasSelectedFromDropdown.current) {
          setInputValue("");
          onUpdate({
            ...data,
            unit: "",
          });
        }
        
        // Show error if quantity exists but no unit
        setShowError(!data.unit && data.qty !== "");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [data, onUpdate, unitOptions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
          prev < filteredUnits.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const selectedUnit = filteredUnits[highlightedIndex];
      if (selectedUnit) {
        handleSelectUnit(selectedUnit);
      }
    } else if (e.key === "Escape") {
      setInputValue("");
      setHighlightedIndex(-1);
    }
  };

  // Utility function to format prices consistently
  const formatPrice = (price: string | number | undefined): string => {
    if (!price && price !== 0) return "";
    
    const priceStr = typeof price === 'number' ? price.toString() : (price || "");
    
    if (priceStr.includes('.')) {
      const [whole, decimal = ''] = priceStr.split('.');
      return `${whole}.${decimal.padEnd(2, '0').slice(0, 2)}`;
    }
    
    return priceStr ? `${priceStr}.00` : "";
  };

  const handlePriceChange = (value: string) => {
    // Remove any non-digit or non-dot characters
    let numericValue = value.replace(/[^\d.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + "." + (parts[1] || "").slice(0, 2);
    }

    // Keep track of the raw input for display during typing
    setRawPriceInput(numericValue);

    onUpdate({
      ...data,
      price: numericValue,
    });
  };

  // Add focus handler
  const handlePriceFocus = () => {
    // When focusing, use the current value for raw input
    setRawPriceInput(data.price);
  };

  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If value is empty, just keep it empty
    if (!value || value.trim() === '') {
      setRawPriceInput("");
      onUpdate({
        ...data,
        price: '',
      });
      
      if (onPriceBlur) {
        onPriceBlur('');
      }
      return;
    }
    
    // Format using utility function
    const formattedValue = formatPrice(value);
    setRawPriceInput(""); // Clear raw input since we're not editing anymore
    
    onUpdate({
      ...data,
      price: formattedValue,
    });

    if (onPriceBlur) {
      onPriceBlur(formattedValue);
    }
  };

  // Auto scroll to the last added conversion when it's updated
  useEffect(() => {
    // Only scroll into view when newly added and not on every data change
    // This prevents the annoying scrolling behavior when clicking anywhere
    if (conversionRef.current && position === 1 && data.qty === "" && data.unit === "" && data.price === "") {
      conversionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []); // Empty dependency array means this only runs once when component mounts

  // Check for incomplete fields when any field is touched 
  const checkIncompleteFields = useCallback(() => {
    // Only show qty error if unit or price has value but qty is empty
    setShowQtyError(!!((data.qty === '') && (data.unit !== '' || data.price !== '')));
    
    // Only show unit error if qty or price has value but unit is empty
    setShowError(!!((data.unit === '') && (data.qty !== '' || data.price !== '')));
    
    // Only show price error if qty or unit has value but price is empty
    setShowPriceError(!!((data.price === '') && (data.qty !== '' || data.unit !== '')));
  }, [data.qty, data.unit, data.price]);

  // Add effect to check fields when data changes
  useEffect(() => {
    checkIncompleteFields();
  }, [data, checkIncompleteFields]);

  return (
      <div className="mt-4" ref={conversionRef}>
        <div className="flex gap-4">
          <div className="flex w-3/5 flex-col gap-1">
            <div className="flex">
              <div className="flex items-center">
                <div className="flex h-10 w-12 items-end justify-center !p-1">
                  <CornerDownRight
                      className="!h-5 !w-5 text-slate-400"
                      strokeWidth={2.5}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-sm text-slate-400">
                        Conversion {position}
                      </Label>
                      <div className="flex w-full">
                        <div className="w-1/2">
                          <Input
                              type="number"
                              step="0"
                              min="0"
                              className="rounded-r-none bg-white text-slate-700 shadow-none"
                              placeholder="Qty"
                              value={data.qty}
                              onChange={(e) => {
                                const value =
                                    e.target.value.replace(/[^\d]/g, "") || "";
                                onUpdate({
                                  ...data,
                                  qty: value,
                                });
                              }}
                              onBlur={() => checkIncompleteFields()}
                          />
                          
                          {showQtyError && (
                            <p className="mt-1 text-sm text-rose-400">
                              Quantity required.
                            </p>
                          )}
                        </div>
                        <Separator orientation="vertical" className="h-auto w-1 bg-slate-200" />
                        <div className="relative w-1/2">
                          <Input
                              ref={inputRef}
                              className="rounded-l-none bg-white text-slate-700 shadow-none"
                              placeholder="Unit"
                              value={inputValue}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^[a-zA-Z ]*$/.test(value)) {
                                  setInputValue(value);
                                  setHighlightedIndex(-1);
                                  setIsDropdownVisible(true);
                                  // Reset selection flag when manually typing
                                  wasSelectedFromDropdown.current = false;
                                  onUpdate({
                                    ...data,
                                    unit: value,
                                  });
                                }
                              }}
                              onFocus={() => {
                                setIsDropdownVisible(true);
                              }}
                              onBlur={(e) => {
                                if (
                                    !dropdownRef.current?.contains(e.relatedTarget)
                                ) {
                                  setTimeout(() => {
                                    setIsDropdownVisible(false);
                                    
                                    // Only clear if it wasn't selected and isn't valid
                                    const isValidUnit = unitOptions.includes(data.unit);
                                    
                                    if (!isValidUnit && data.unit && !wasSelectedFromDropdown.current) {
                                      setInputValue("");
                                      onUpdate({
                                        ...data,
                                        unit: "",
                                      });
                                    }
                                    
                                    // Show error if quantity exists but no unit
                                    setShowError(!data.unit && data.qty !== "");
                                  }, 200);
                                }
                              }}
                              onKeyDown={handleKeyDown}
                          />

                          {showError && (
                            <p className="mt-1 text-sm text-rose-400">
                              Please select a unit.
                            </p>
                          )}

                          {isDropdownVisible && (
                              <div
                                  ref={dropdownRef}
                                  className="fixed z-[9999] mt-1"
                                  style={{
                                    top: `${
                                        (inputRef.current?.getBoundingClientRect().bottom || 0) + 4
                                    }px`,
                                    left: `${
                                        inputRef.current?.getBoundingClientRect().left || 0
                                    }px`,
                                    width: `${inputRef.current?.offsetWidth || 0}px`,
                                  }}
                              >
                                <div className="rounded-md border border-slate-200 bg-white shadow-lg">
                                  <ScrollArea className="max-h-[200px]">
                                    {filteredUnits.length > 0 ? (
                                      filteredUnits.map((unitName, index) => (
                                          <div
                                              key={unitName}
                                              className={`cursor-pointer px-4 py-2 hover:bg-slate-100 ${highlightedIndex === index ? "bg-slate-200" : ""}`}
                                              onMouseDown={() => handleSelectUnit(unitName)}
                                          >
                                            {unitName}
                                          </div>
                                      ))
                                    ) : (
                                      <div className="px-4 py-2 text-slate-400 italic">
                                        {inputValue 
                                          ? "No matching units found" 
                                          : "All units are already in use"}
                                      </div>
                                    )}
                                  </ScrollArea>
                                </div>
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator orientation="vertical" className="h-auto w-px bg-slate-300" />
          <div className="flex w-2/5 flex-col gap-2">
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-slate-400">Unit Price</Label>
                <Input
                    type="text"
                    inputMode="decimal"
                    className="bg-white text-slate-700 shadow-none"
                    placeholder="Price"
                    value={rawPriceInput || (data.price ? formatPrice(data.price) : data.price)}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    onFocus={handlePriceFocus}
                    onBlur={(e) => {
                      handlePriceBlur(e);
                      checkIncompleteFields();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "." && data.price.includes(".")) {
                        e.preventDefault();
                      }
                    }}
                />
                
                {showPriceError && (
                  <p className="mt-1 text-sm text-rose-400">
                    Price required.
                  </p>
                )}
              </div>
              <Button
                  className="flex h-10 w-12 items-center justify-center bg-slate-100 !p-1 hover:!bg-slate-200/50"
                  onClick={onRemove}
              >
                <X className="!h-5 !w-5 text-slate-400" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Conversion;
