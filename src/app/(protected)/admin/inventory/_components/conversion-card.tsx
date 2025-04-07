import { ArrowLeft, CornerDownRight, Plus, X } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Conversion from "./conversion";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";
import { toast } from 'sonner';

interface PresetData {
  id: number;
  mainUnit: string;
  mainPrice: number | string; // Allow both number and string
  isExisting?: boolean;
  conversions: Array<{
    qty?: string;
    unit?: string;
    price?: string | number;
    quantity?: number; // For backward compatibility
  }>;
}

interface ConversionData {
  id: number;
  qty: string;
  unit: string;
  stock: string;
  price: string;
}

interface ConversionCardProps {
  preset: PresetData;
  onUpdate: (preset: PresetData) => void;
  onRemove?: () => void;
}

const ConversionCard = ({
  preset,
  onUpdate,
  onRemove,
}: ConversionCardProps) => {
  const [mainStock, setMainStock] = useState("0");
  const [mainPrice, setMainPrice] = useState("0.00");
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [conversions, setConversions] = useState<ConversionData[]>([]);
  const [nextId, setNextId] = useState(1);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showMainUnitError, setShowMainUnitError] = useState(false);
  const [showMainPriceError, setShowMainPriceError] = useState(false);
  const [rawPriceInput, setRawPriceInput] = useState("");
  
  // Add ref to track if unit was selected from dropdown
  const wasMainUnitSelectedFromDropdown = useRef(false);
  
  // Add ref for scroll area to enable auto-scrolling
  const scrollAreaContainerRef = useRef<HTMLDivElement>(null);

  const { data: units } = api.restock.getUnits.useQuery();
  const unitOptions = units?.map((unit) => unit.name) ?? [];
  
  // Collect all units used in conversion fields (excluding empty values)
  const usedUnitsInConversions = preset.conversions
    .map(conv => conv.unit || '')
    .filter(unit => unit !== '' && unit !== preset.mainUnit);

  // Filter out units that are already used in conversions
  const availableUnitsForMain = unitOptions.filter(
    unit => !usedUnitsInConversions.includes(unit) || unit === preset.mainUnit
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure preset always has at least one conversion row
  useEffect(() => {
    if (preset.conversions.length === 0) {
      onUpdate({
        ...preset,
        conversions: [{ qty: "", unit: "", price: "" }]
      });
    }
  }, []);

  // Show filtered units or all available units
  const filteredUnits = inputValue
    ? availableUnitsForMain.filter((name) =>
        name.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : availableUnitsForMain;

  const handleSelectUnit = (unitName: string) => {
    // Mark as selected from dropdown
    wasMainUnitSelectedFromDropdown.current = true;
    
    // Update the state
    setInputValue(unitName);
    setHighlightedIndex(-1);
    setIsDropdownVisible(false);
    
    // Clear main unit error immediately since we now have a valid unit
    setShowMainUnitError(false);
    
    // Update preset with new main unit
    onUpdate({ ...preset, mainUnit: unitName });
    
    // Check if main price is empty
    const hasEmptyPrice = !preset.mainPrice || preset.mainPrice === "";
    
    // Show error if unit is selected but price is empty
    setShowMainPriceError(hasEmptyPrice);
    
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // If main unit is already a valid unit option, mark it as selected
  useEffect(() => {
    if (preset.mainUnit && unitOptions.includes(preset.mainUnit)) {
      wasMainUnitSelectedFromDropdown.current = true;
      // Also clear any main unit error if there's a valid unit
      setShowMainUnitError(false);
    }
  }, [preset.mainUnit, unitOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
        
        // Only clear if it wasn't selected from dropdown and isn't valid
        const isValidUnit = unitOptions.includes(inputValue);
        
        if (!isValidUnit && inputValue && !wasMainUnitSelectedFromDropdown.current) {
          setInputValue("");
          onUpdate({ ...preset, mainUnit: "" });
        } else if (isValidUnit) {
          // If it's a valid unit, consider it as selected even if not from dropdown
          wasMainUnitSelectedFromDropdown.current = true;
        }
        
        // Show error if main unit is empty
        setShowMainUnitError(!preset.mainUnit);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputValue, unitOptions, preset, onUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredUnits.length - 1 ? prev + 1 : prev,
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

  // Handle main unit change
  const handleMainUnitChange = (value: string) => {
    onUpdate({ ...preset, mainUnit: value });
  };

  // Replace the existing handleMainPriceChange with this:
  const handleMainPriceChange = (value: string) => {
    // Remove any non-digit or non-dot characters
    let numericValue = value.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      numericValue = parts[0] + '.' + (parts[1] || '').slice(0, 2);
    }

    // Update the raw input for display during typing
    setRawPriceInput(numericValue);
    
    // Also update the actual value
    onUpdate({ ...preset, mainPrice: numericValue });
    
    // Check if price is empty and unit has value - show error
    const isEmpty = numericValue === '';
    const hasUnit = preset.mainUnit !== '';
    setShowMainPriceError(isEmpty && hasUnit);
  };

  // Add this blur handler
  const handleMainPriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || value.trim() === '') {
      setRawPriceInput("");
      onUpdate({ ...preset, mainPrice: '' });
      
      // Show error if main unit exists but price is empty
      setShowMainPriceError(!!preset.mainUnit);
      return;
    }

    // Format using the utility function
    const formattedValue = formatPrice(value);
    setRawPriceInput(""); // Clear raw input since we're not editing anymore
    onUpdate({ ...preset, mainPrice: formattedValue });
    
    // Clear error if price is valid
    setShowMainPriceError(false);
  };

  // Add this focus handler
  const handleMainPriceFocus = () => {
    // When focusing, set the raw input to the current value
    // This allows the user to continue editing the current value
    setRawPriceInput(preset.mainPrice.toString());
  };

  // Handle conversion changes
  const handleConversionChange = (
      index: number,
      newData: { qty?: string; unit?: string; price?: string },
  ) => {
    // Format price to 2 decimal places if it exists
    if (newData.price) {
      let priceValue = newData.price.replace(/[^\d.]/g, '');
      const parts = priceValue.split('.');

      if (parts.length > 2) {
        priceValue = parts[0] + '.' + parts.slice(1).join('');
      }

      if (parts.length === 2) {
        priceValue = parts[0] + '.' + (parts[1] || '').slice(0, 2);
      }

      newData.price = priceValue;
    }

    const newConversions = [...preset.conversions];
    newConversions[index] = {
      ...newConversions[index],
      ...newData,
    };
    onUpdate({ ...preset, conversions: newConversions });
  };

  // Add this blur handler for conversion prices
  const handleConversionPriceBlur = (index: number, price: string) => {
    // Format using the utility function
    const formattedPrice = formatPrice(price);

    const newConversions = [...preset.conversions];
    newConversions[index] = {
      ...newConversions[index],
      price: formattedPrice
    };
    onUpdate({ ...preset, conversions: newConversions });
  };

  const handleAddConversion = () => {
    if (preset.conversions.length < 5) {
      // Check if any existing conversion row is incomplete
      const hasIncompleteConversions = preset.conversions.some(conv => 
        (!conv.qty || !conv.unit || !conv.price) && 
        (conv.qty || conv.unit || conv.price) // At least one field has a value (not completely empty)
      );
      
      if (hasIncompleteConversions) {
        toast("❌ Incomplete conversion", {
          description: "Please complete all conversion fields before adding a new row",
          duration: 4000,
        });
        return;
      }
      
      onUpdate({
        ...preset,
        conversions: [...preset.conversions, { qty: "", unit: "", price: "" }],
      });
      
      // Reset dropdown state to show updated available units
      setIsDropdownVisible(false);
      
      // Scroll to the bottom of the conversion area
      setTimeout(() => {
        if (scrollAreaContainerRef.current) {
          const scrollContainer = scrollAreaContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 100); // Small delay to ensure the new row is rendered
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

  const handleRemoveConversion = (index: number) => {
    const newConversions = preset.conversions.filter((_, i) => i !== index);
    onUpdate({ ...preset, conversions: newConversions });
    // Reset dropdown state to show updated available units
    setIsDropdownVisible(false);
  };

  const handleUpdateConversion = useCallback((updatedData: ConversionData) => {
    setConversions((prev) => {
      const newConversions = prev.map((conv) =>
        conv.id === updatedData.id ? updatedData : conv,
      );
      return newConversions;
    });
  }, []);

  return (
    <div className="rounded-lg bg-slate-100 p-4">
      <div className="flex gap-4">
        <div className="flex w-3/5 flex-col gap-1">
          <Label className="text-sm text-slate-400">Main Unit</Label>
          <div className="relative">
            <Input
              ref={inputRef}
              className="bg-white text-slate-700 shadow-none"
              placeholder="Unit"
              value={preset.mainUnit}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z ]*$/.test(value)) {
                  onUpdate({ ...preset, mainUnit: value });
                  setInputValue(value);
                  setHighlightedIndex(-1);
                  setIsDropdownVisible(true);
                  // Reset selection flag when manually typing
                  wasMainUnitSelectedFromDropdown.current = false;
                  
                  // Clear error if they've entered a valid unit
                  if (unitOptions.includes(value)) {
                    setShowMainUnitError(false);
                  }
                }
              }}
              onFocus={() => {
                setInputValue(preset.mainUnit); // Sync inputValue with preset.mainUnit
                setIsDropdownVisible(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  if (!dropdownRef.current?.contains(document.activeElement)) {
                    setIsDropdownVisible(false);
                    
                    // Only clear if not a valid unit and not selected from dropdown
                    const isValidUnit = unitOptions.includes(preset.mainUnit);
                    
                    if (!isValidUnit && preset.mainUnit && !wasMainUnitSelectedFromDropdown.current) {
                      setInputValue("");
                      onUpdate({ ...preset, mainUnit: "" });
                    } else if (isValidUnit) {
                      // If it's a valid unit, consider it as selected even if not from dropdown
                      wasMainUnitSelectedFromDropdown.current = true;
                    }
                    
                    // Show error if main unit is empty
                    setShowMainUnitError(!preset.mainUnit);
                  }
                }, 100);
              }}
              onKeyDown={handleKeyDown}
            />
            
            {showMainUnitError && (
              <p className="mt-1 text-sm text-rose-400">
                Please select a unit.
              </p>
            )}

            {isDropdownVisible && (
              <div
                ref={dropdownRef}
                className="absolute left-0 top-full z-50 mt-1 w-full rounded-md bg-white shadow-lg"
              >
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
            )}
          </div>
        </div>
        <Separator
          orientation="vertical"
          className="h-auto w-px bg-slate-300"
        />
        <div className="flex w-2/5 flex-col gap-2">
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-slate-400">Unit Price</Label>
              <Input
                  type="text" // Changed from "number" to "text" for better control
                  inputMode="decimal" // Shows numeric keyboard on mobile
                  className="bg-white text-slate-700 shadow-none"
                  placeholder="Price"
                  value={rawPriceInput || formatPrice(preset.mainPrice)}
                  onChange={(e) => handleMainPriceChange(e.target.value)}
                  onFocus={handleMainPriceFocus}
                  onBlur={handleMainPriceBlur}
                  onKeyDown={(e) => {
                    // Prevent entering more than 2 decimal places
                    if (e.key === '.' && (preset.mainPrice.toString().includes('.') ||
                        (e.key === '.' && e.currentTarget.value.includes('.')))) {
                      e.preventDefault();
                    }
                  }}
              />
              
              {showMainPriceError && (
                <p className="mt-1 text-sm text-rose-400">
                  Price required.
                </p>
              )}
            </div>
            <div className="flex h-10 w-12 items-center justify-center !p-1">
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <ArrowLeft
                      className="!h-5 !w-5 text-slate-400"
                      strokeWidth={2.5}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="my-4 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-none">
                    This is your main unit.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 h-[1px] border-t-[3px] border-dashed border-slate-300" />

      <div ref={scrollAreaContainerRef} className="relative">
        <ScrollArea className="h-40">
          <div className="px-1 pb-1">
            {preset.conversions.length === 0 ? (
              <p className="mt-6 text-center text-sm italic text-slate-400">
                No conversions
              </p>
            ) : (
              preset.conversions.map((conv, index) => {
                  // Collect all units used in this preset except the current conversion's unit
                  const usedUnits = preset.conversions
                      .filter((_, i) => i !== index)
                      .map(c => c.unit || '')
                      .filter(Boolean);
                  
                  // Include the main unit in used units if it exists
                  if (preset.mainUnit) {
                      usedUnits.push(preset.mainUnit);
                  }
                  
                  return (
                      <Conversion
                          key={index}
                          data={{
                            id: index,
                            qty: conv.qty || '',
                            unit: conv.unit || '',
                            stock: "0",
                            price: formatPrice(conv.price)
                          }}
                          position={index + 1}
                          onUpdate={(newData) => handleConversionChange(index, newData)}
                          onRemove={() => handleRemoveConversion(index)}
                          onPriceBlur={(price) => handleConversionPriceBlur(index, price)}
                          usedUnits={usedUnits}
                      />
                  );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button
            className="w-full rounded-lg border-[3px] border-dashed border-slate-300 bg-slate-100 p-2 text-slate-400 hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-400"
            onClick={handleAddConversion}
            disabled={preset.conversions.length >= 5}
        >
          {preset.conversions.length >= 5
              ? "Maximum 5 conversions reached"
              : "+ Add a conversion"}
        </Button>
        
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                className="w-full rounded-lg border-[3px] border-dashed border-slate-300 bg-slate-100 p-2 text-slate-400 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-400"
                onClick={onRemove}
                disabled={!onRemove}
              >
                Remove Preset
              </Button>
            </TooltipTrigger>
            {!onRemove && (
              <TooltipContent className="my-4 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-none">
                At least one preset is required
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ConversionCard;
