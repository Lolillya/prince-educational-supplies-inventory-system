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

interface PresetData {
  id: number;
  mainUnit: string;
  mainPrice: number | string; // Allow both number and string
  conversions: Array<{
    qty?: string;
    unit?: string;
    price?: string | number;
    quantity?: number; // For backward compatibility
    unit?: string;
    price?: number | string;
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

  const { data: units } = api.restock.getUnits.useQuery();
  const unitOptions = units?.map((unit) => unit.name) ?? [];

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUnits = inputValue
    ? unitOptions.filter((name) =>
        name.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : [];

  const handleSelectUnit = (unitName: string) => {
    setInputValue(unitName);
    onUpdate({ ...preset, mainUnit: unitName });
    if (inputRef.current) {
      inputRef.current.blur();
    }
    setHighlightedIndex(-1);
    setIsDropdownVisible(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
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
        if (!unitOptions.includes(inputValue)) {
          setInputValue("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputValue, unitOptions]);

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
      numericValue = parts[0] + '.' + parts[1].slice(0, 2);
    }

    onUpdate({ ...preset, mainPrice: numericValue });
  };
  // Add this blur handler
  const handleMainPriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      onUpdate({ ...preset, mainPrice: '0.00' });
      return;
    }

    // Format to exactly 2 decimal places
    let formattedValue = value;
    if (value.includes('.')) {
      const [whole, decimal] = value.split('.');
      const paddedDecimal = decimal.padEnd(2, '0').slice(0, 2);
      formattedValue = `${whole}.${paddedDecimal}`;
    } else if (value) {
      formattedValue = `${value}.00`;
    }

    onUpdate({ ...preset, mainPrice: formattedValue });
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
        priceValue = parts[0] + '.' + parts[1].slice(0, 2);
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
    let formattedPrice = price;
    if (price.includes('.')) {
      const [whole, decimal] = price.split('.');
      formattedPrice = `${whole}.${decimal.padEnd(2, '0').slice(0, 2)}`;
    } else if (price) {
      formattedPrice = `${price}.00`;
    }

    const newConversions = [...preset.conversions];
    newConversions[index] = {
      ...newConversions[index],
      price: formattedPrice
    };
    onUpdate({ ...preset, conversions: newConversions });
  };
  const handleAddConversion = () => {
    if (preset.conversions.length < 5) {
      onUpdate({
        ...preset,
        conversions: [...preset.conversions, { qty: "", unit: "", price: "" }],
      });
    }
  };

  const handleRemoveConversion = (index: number) => {
    const newConversions = preset.conversions.filter((_, i) => i !== index);
    onUpdate({ ...preset, conversions: newConversions });
  };

  const handleUpdateConversion = useCallback((updatedData: ConversionData) => {
    setConversions((prev) => {
      const newConversions = prev.map((conv) =>
        conv.id === updatedData.id ? updatedData : conv,
      );
      return newConversions;
    });
  }, []);

  // const handleAddConversion = () => {
  // 	setConversions(prev => [...prev, {
  // 		id: nextId,
  // 		qty: "",
  // 		unit: "",
  // 		stock: "0",
  // 		price: "0.00"
  // 	}]);
  // 	setNextId(prev => prev + 1);
  // };

  // const handleRemoveConversion = (id: number) => {
  // 	setConversions(prev => prev.filter(conv => conv.id !== id));
  // };

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
              // value={preset.mainUnit}
              value={preset.mainUnit}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z ]*$/.test(value)) {
                  onUpdate({ ...preset, mainUnit: value });
                  setInputValue(value);
                  setHighlightedIndex(-1);
                  setIsDropdownVisible(true);
                }
              }}
              onFocus={() => {
                if (inputValue && filteredUnits.length > 0) {
                  setIsDropdownVisible(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  if (!dropdownRef.current?.contains(document.activeElement)) {
                    setIsDropdownVisible(false);
                  }
                }, 100);
              }}
              onKeyDown={handleKeyDown}
            />

            {isDropdownVisible && inputValue && filteredUnits.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 top-full z-50 mt-1 w-full rounded-md bg-white shadow-lg"
              >
                <ScrollArea className="max-h-[200px]">
                  {filteredUnits.map((unitName, index) => (
                    <div
                      key={unitName}
                      className={`cursor-pointer px-4 py-2 hover:bg-slate-100 ${highlightedIndex === index ? "bg-slate-200" : ""}`}
                      onMouseDown={() => handleSelectUnit(unitName)}
                    >
                      {unitName}
                    </div>
                  ))}
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
                  value={typeof preset.mainPrice === 'number'
                      ? preset.mainPrice.toFixed(2)
                      : preset.mainPrice}
                  onChange={(e) => handleMainPriceChange(e.target.value)}
                  onBlur={handleMainPriceBlur}
                  onKeyDown={(e) => {
                    // Prevent entering more than 2 decimal places
                    if (e.key === '.' && (preset.mainPrice.toString().includes('.') ||
                        (e.key === '.' && e.currentTarget.value.includes('.')))) {
                      e.preventDefault();
                    }
                  }}
              />
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

      <ScrollArea className="h-40">
        <div className="px-1 pb-1">
          {preset.conversions.length === 0 ? (
            <p className="mt-6 text-center text-sm italic text-slate-400">
              No conversions
            </p>
          ) : (
            preset.conversions.map((conv, index) => (
                <Conversion
                    key={index}
                    data={{
                      id: index,
                      qty: conv.qty || '',
                      unit: conv.unit || '',
                      stock: "0",
                      price: typeof conv.price === 'number'
                          ? conv.price.toFixed(2)
                          : conv.price || '0.00'
                    }}
                    position={index + 1} // Add this line to show position number
                    onUpdate={(newData) => handleConversionChange(index, newData)}
                    onRemove={() => handleRemoveConversion(index)}
                    onPriceBlur={(price) => handleConversionPriceBlur(index, price)}
                />
            ))
          )}
        </div>
      </ScrollArea>

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
        {onRemove && (
          <Button
            className="w-full rounded-lg border-[3px] border-dashed border-slate-300 bg-slate-100 p-2 text-slate-400 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-400"
            onClick={onRemove}
          >
            Remove Preset
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConversionCard;
