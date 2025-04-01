import {
  ArrowDownRight,
  ArrowLeft,
  CornerDownRight,
  Plus,
  X,
} from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import ViewConversion from "./view-conversion";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";

interface StockCardV2Props {
  item: {
    inventory_id: number;
    variant: {
      name: string | undefined;
      item: {
        name: string;
        brand: {
          name: string;
        };
        item_id?: number;
      };
    };
    variant_id: number;
  };
  onRemove: () => void;
  onStockChange: (inventoryId: number, totalStock: string) => void;
  onPriceChange: (inventoryId: number, price: string) => void;
  onUnitChange: (inventoryId: number, unit: string) => void;
  onConversionChange: (
    conversions: { qty: string; unit: string; price: string; stock: string }[],
  ) => void;
  onErrorChange: (
    inventoryId: number,
    hasError: boolean,
    errorDetails: {
      mainUnit: boolean;
      stock: boolean;
      price: boolean;
      conversions: boolean;
    },
  ) => void;
}

interface ConversionData {
  id: number;
  qty: string; // This is the conversion quantity (e.g., 111, 222)
  unit: string; // The unit name (e.g., Pieces, Sub-Pieces)
  stock: string; // The actual stock amount (e.g., 100, 50)
  price: string; // The price per unit
  level: number; // Position in the conversion chain
}

// Add this interface for preset data
interface Preset {
  presetId: number;
  mainUnit: string;
  mainPrice: number;
  conversions: {
    fromUnit: string;
    toUnit: string;
    conversionRate: number;
    price: number;
  }[];
  conversionCount: number;
}

const StockCardV2 = ({
  item,
  onRemove,
  onStockChange,
  onPriceChange,
  onUnitChange,
  onConversionChange,
  onErrorChange,
}: StockCardV2Props) => {
  const { data: units } = api.restock.getUnits.useQuery();

  // Get the item ID for querying presets
  const itemId = item.variant.item.item_id;

  // Fetch presets for the current item
  const { data: presets } = api.restock.getItemPresets.useQuery(
    { itemId: itemId || 0 },
    { enabled: !!itemId },
  );

  // Filter out duplicate presets that might have the same structure
  const uniquePresets = React.useMemo(() => {
    if (!presets || !Array.isArray(presets)) return [];

    // Define a type guard function to check valid presets
    const isValidPreset = (p: any): p is Preset => {
      return (
        p !== null &&
        typeof p === "object" &&
        "conversionCount" in p &&
        p.conversionCount > 0 &&
        "mainUnit" in p &&
        "conversions" in p &&
        Array.isArray(p.conversions)
      );
    };

    // First filter out presets with zero conversions or invalid presets
    const validPresets = presets.filter(isValidPreset);

    // Create a unique key for each preset based on its structure
    const presetMap = new Map<string, Preset>();

    validPresets.forEach((preset) => {
      // Create a signature for this preset that combines main unit and all conversions
      const signature = `${preset.mainUnit}-${preset.conversions
        .map((c) => `${c.fromUnit}-${c.toUnit}-${c.conversionRate}`)
        .join("|")}`;

      // Only keep the first preset with this signature
      if (!presetMap.has(signature)) {
        presetMap.set(signature, preset);
      }
    });

    return Array.from(presetMap.values());
  }, [presets]);

  const unitOptions = units?.map((unit) => unit.name) ?? [];

  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Single state object to track input values and their validity
  const [errors, setErrors] = useState({
    mainUnit: true, // Default to true (invalid)
    stock: true, // Default to true (invalid)
    price: true, // Default to true (invalid)
    conversions: false, // Default to false (valid) since conversions are optional
  });

  const [mainStock, setMainStock] = useState("");
  const [mainPrice, setMainPrice] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [conversions, setConversions] = useState<ConversionData[]>([]);
  const [nextId, setNextId] = useState(1);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [showError, setShowError] = useState(false);
  const [mainStockError, setMainStockError] = useState<string>("");
  const [mainPriceError, setMainPriceError] = useState<string>("");

  // Applied preset ID
  const [appliedPresetId, setAppliedPresetId] = useState<number | null>(null);

  // Compute filtered units directly without state
  const filteredUnits = inputValue
    ? unitOptions.filter((name) =>
        name.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : [];

  const handleSelectUnit = (unitName: string) => {
    setInputValue(unitName);
    setHighlightedIndex(-1);
    setIsDropdownVisible(false);
    onUnitChange(item.inventory_id, unitName);
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

  // Use effect to notify parent of error status changes
  useEffect(() => {
    const hasError =
      errors.mainUnit || errors.stock || errors.price || errors.conversions;

    // Debounce error reporting to prevent excessive updates
    const timeoutId = setTimeout(() => {
      onErrorChange(item.inventory_id, hasError, errors);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [errors, item.inventory_id, onErrorChange]);

  // Validate main unit input
  const validateMainUnit = useCallback((value: string) => {
    const isValid = value.trim() !== "";
    setErrors((prev) => ({ ...prev, mainUnit: !isValid }));
    return isValid;
  }, []);

  // Validate stock input
  const validateStock = useCallback((value: string) => {
    const isValid = value.trim() !== "";
    setErrors((prev) => ({ ...prev, stock: !isValid }));
    return isValid;
  }, []);

  // Validate price input
  const validatePrice = useCallback((value: string) => {
    const isValid = value.trim() !== "";
    setErrors((prev) => ({ ...prev, price: !isValid }));
    return isValid;
  }, []);

  // Validate conversions
  const validateConversions = useCallback(() => {
    if (conversions.length === 0) {
      setErrors((prev) => ({ ...prev, conversions: false })); // No conversions is valid
      return true;
    }

    const hasInvalidConversion = conversions.some((conv) => {
      const hasQty = conv.qty?.trim() !== "";
      const hasUnit = conv.unit?.trim() !== "";
      return (hasQty && !hasUnit) || (!hasQty && hasUnit);
    });

    setErrors((prev) => ({ ...prev, conversions: hasInvalidConversion }));
    return !hasInvalidConversion;
  }, [conversions]);

  // Handle main unit input change
  const handleMainUnitChange = (value: string) => {
    setInputValue(value);
    setHighlightedIndex(-1);
    setIsDropdownVisible(true);
    setShowError(false);
    validateMainUnit(value);
    onUnitChange(item.inventory_id, value);
  };

  // Handle stock input change
  const handleStockChange = (value: string) => {
    const normalizedValue = value.replace(/[^\d]/g, "");
    setMainStock(normalizedValue);
    setMainStockError("");
    validateStock(normalizedValue);
    onStockChange(item.inventory_id, normalizedValue);
  };

  // Handle price input change
  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/[^\d.]/g, "");
    const parts = value.split(".");
    const formattedValue =
      parts.length > 2
        ? `${parts[0]}.${parts.slice(1).join("")}`
        : numericValue;
    setMainPrice(formattedValue);
    setMainPriceError("");
    validatePrice(formattedValue);
    onPriceChange(item.inventory_id, formattedValue);
  };

  // Handle showing dialog on blur for price
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setMainPriceError("Field cannot be empty");
      return;
    }

    // Format to 2 decimal places
    const normalizedValue = Number(value).toFixed(2);
    setMainPrice(normalizedValue);
    onPriceChange(item.inventory_id, normalizedValue);
  };

  // Add effect to initialize conversion stock with default values
  useEffect(() => {
    if (conversions.length > 0) {
      // Check if any conversion is missing a stock value
      const updatedConversions = conversions.map((conv) => {
        if (
          conv.stock === undefined ||
          conv.stock === null ||
          conv.stock === ""
        ) {
          return {
            ...conv,
            stock: "0", // Initialize with a default value
          };
        }
        return conv;
      });

      // If any conversions were updated, update state and notify parent
      if (
        updatedConversions.some(
          (conv, i) => conv.stock !== (conversions[i]?.stock ?? ""),
        )
      ) {
        setConversions(updatedConversions);

        // Update parent with the corrected data
        const conversionData = updatedConversions.map((conv) => ({
          qty: conv.qty,
          unit: conv.unit,
          price: conv.price,
          stock: conv.stock,
        }));
        onConversionChange(conversionData);
      }
    }
  }, [conversions, onConversionChange]);

  // Simplify the stock update effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Just pass the main stock value directly
      // Let the parent component calculate total stock if needed
      onStockChange(item.inventory_id, mainStock);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [mainStock, item.inventory_id, onStockChange]);

  // Handle conversion updates with validation and notify parent
  const handleUpdateConversion = useCallback(
    (updatedData: ConversionData) => {
      setConversions((prev) => {
        const newConversions = prev.map((conv) =>
          conv.id === updatedData.id ? updatedData : conv,
        );

        // Immediately update the parent with new conversion data
        const conversionData = newConversions.map((conv) => ({
          qty: conv.qty, // Conversion quantity
          unit: conv.unit, // Unit name
          price: conv.price, // Price per unit
          stock: conv.stock, // Actual stock amount
        }));
        setTimeout(() => onConversionChange(conversionData), 0);

        return newConversions;
      });

      // Schedule validation after state update
      setTimeout(() => validateConversions(), 0);
    },
    [validateConversions, onConversionChange],
  );

  // Add a ref for the ScrollArea content
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Modify the handleAddConversion function to include scrolling
  const handleAddConversion = () => {
    const nextLevel = conversions.length + 1;
    const newConversionId = nextId;

    setConversions((prev) => [
      ...prev,
      {
        id: newConversionId,
        qty: "", // Conversion quantity
        unit: "", // Unit name
        stock: "0", // Initialize with a proper default stock amount (0)
        price: "0.00",
        level: nextLevel,
      },
    ]);
    setNextId((prev) => prev + 1);

    // Immediately update the parent component
    setTimeout(() => {
      const updatedConversions = [
        ...conversions,
        {
          id: newConversionId,
          qty: "",
          unit: "",
          stock: "0",
          price: "0.00",
          level: nextLevel,
        },
      ];

      const conversionData = updatedConversions.map((conv) => ({
        qty: conv.qty,
        unit: conv.unit,
        price: conv.price,
        stock: conv.stock,
      }));

      onConversionChange(conversionData);
    }, 0);

    // Schedule validation after state update
    setTimeout(() => validateConversions(), 0);

    // Scroll to bottom after the conversion is added
    setTimeout(() => {
      const scrollArea = document.querySelector(
        `[data-conversion-scroll="${item.inventory_id}"]`,
      );
      const scrollViewport = scrollArea?.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }, 100);
  };

  const handleRemoveConversion = (id: number) => {
    setConversions((prev) => prev.filter((conv) => conv.id !== id));

    // Schedule validation after state update
    setTimeout(() => validateConversions(), 0);
  };

  // Handle applying a preset
  const handleApplyPreset = (preset: Preset | null) => {
    if (
      !preset ||
      typeof preset !== "object" ||
      !preset.mainUnit ||
      !Array.isArray(preset.conversions)
    ) {
      console.error("Invalid preset:", preset);
      return;
    }

    console.log("Applying preset:", preset);
    console.log("Preset has", preset.conversions.length, "conversions");

    // Update main unit and price
    setInputValue(preset.mainUnit);
    setMainPrice(preset.mainPrice.toFixed(2));
    onUnitChange(item.inventory_id, preset.mainUnit);
    onPriceChange(item.inventory_id, preset.mainPrice.toFixed(2));

    // Create conversions from preset data - we trust the server has sorted them properly
    const newConversions: ConversionData[] = preset.conversions.map(
      (conv, index) => {
        // Format the price with 2 decimal places
        const priceValue = conv.price ? conv.price.toFixed(2) : "0.00";

        return {
          id: nextId + index,
          qty: conv.conversionRate.toString(),
          unit: conv.toUnit,
          stock: "0", // Default stock value
          price: priceValue, // Use the formatted preset price
          level: index + 1,
        };
      },
    );

    console.log("Final newConversions:", newConversions);

    // Update state
    setConversions(newConversions);
    setNextId(nextId + newConversions.length);
    setAppliedPresetId(preset.presetId);

    // Notify parent component of conversions change
    const conversionData = newConversions.map((conv) => ({
      qty: conv.qty,
      unit: conv.unit,
      price: conv.price,
      stock: conv.stock,
    }));

    onConversionChange(conversionData);

    // Validate after applying preset
    setTimeout(() => {
      validateMainUnit(preset.mainUnit);
      validatePrice(preset.mainPrice.toString());
      validateConversions();
    }, 0);
  };

  return (
    <div className="rounded-lg bg-slate-100 p-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-700">
          {item.variant.item.name} - {item.variant.item.brand.name} -{" "}
          {item.variant.name || "N/A"}
        </p>
        <Button
          className="flex h-10 w-10 items-center justify-center bg-slate-100 !p-1 hover:!bg-slate-100"
          onClick={onRemove}
        >
          <X className="!h-5 !w-5 text-slate-400" strokeWidth={2.5} />
        </Button>
      </div>
      <div className="mt-4">
        <div className="flex gap-4">
          <div className="flex w-1/2 flex-col gap-1">
            <Label className="text-sm text-slate-400">Main Unit</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                className="bg-white text-slate-700 shadow-none"
                placeholder="Unit"
                value={inputValue}
                onChange={(e) => handleMainUnitChange(e.target.value)}
                onFocus={() => {
                  if (inputValue && filteredUnits.length > 0) {
                    setIsDropdownVisible(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    if (
                      !dropdownRef.current?.contains(document.activeElement)
                    ) {
                      setIsDropdownVisible(false);
                      setShowError(!inputValue);
                    }
                  }, 100);
                }}
                onKeyDown={handleKeyDown}
              />
              {showError && (
                <p className="text-red-500 mt-1 text-sm text-rose-400">
                  Please fill in the main unit.
                </p>
              )}

              {isDropdownVisible && inputValue && filteredUnits.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 top-full z-50 mt-1 w-full rounded-md bg-white shadow-lg"
                >
                  <ScrollArea className="max-h-[200px]">
                    {filteredUnits.map((unitName, index) => (
                      <div
                        key={unitName}
                        className={`cursor-pointer px-4 py-2 hover:bg-slate-100 ${
                          highlightedIndex === index ? "bg-slate-200" : ""
                        }`}
                        onMouseDown={() => handleSelectUnit(unitName)}
                      >
                        {unitName}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              <div className="absolute right-2 top-5 -translate-y-1/2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="cursor-pointer rounded-full border-2 border-dashed border-slate-400 p-1">
                    <Plus
                      className="h-4 w-4 text-slate-400"
                      strokeWidth={2.5}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="mt-2 w-56 shadow-none"
                  >
                    <DropdownMenuLabel className="text-slate-700">
                      Preset Conversions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {uniquePresets && uniquePresets.length > 0 ? (
                      uniquePresets.map((preset) => (
                        <ViewConversion
                          key={preset.presetId}
                          mainUnit={preset.mainUnit}
                          mainPrice={preset.mainPrice}
                          conversions={preset.conversions}
                          conversionCount={preset.conversionCount}
                          onSelect={() => handleApplyPreset(preset)}
                        />
                      ))
                    ) : (
                      <DropdownMenuItem disabled className="text-slate-400">
                        No presets available
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <Separator
            orientation="vertical"
            className="h-auto w-px bg-slate-300"
          />
          <div className="flex w-1/2 flex-col gap-2">
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-slate-400">Stock</Label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  className="bg-white text-slate-700 shadow-none"
                  placeholder="Stock"
                  value={mainStock}
                  onKeyDown={(e) => {
                    if (e.key === ".") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => handleStockChange(e.target.value)}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      setMainStockError("Field cannot be empty");
                    } else {
                      const normalizedValue = String(Number(value));
                      setMainStock(normalizedValue);
                    }
                  }}
                />
                {mainStockError && (
                  <p className="mt-1 text-sm text-rose-400">{mainStockError}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-sm text-slate-400">Unit Price</Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  className="bg-white text-slate-700 shadow-none"
                  placeholder="Price"
                  value={mainPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  onBlur={handlePriceBlur}
                />
                {mainPriceError && (
                  <p className="mt-1 text-sm text-rose-400">{mainPriceError}</p>
                )}
              </div>
              <div className="mt-6 flex h-10 w-12 items-center justify-center !p-1">
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
      </div>
      <div className="mt-4 h-[1px] border-t-[3px] border-dashed border-slate-300" />

      <ScrollArea className="h-40" data-conversion-scroll={item.inventory_id}>
        <div ref={scrollAreaRef} className="px-1 pb-1">
          {conversions.length === 0 ? (
            <p className="mt-6 text-center text-sm italic text-slate-400">
              No conversions
            </p>
          ) : (
            conversions.map((conversion, index) => (
              <Conversion
                key={conversion.id}
                data={conversion}
                level={index + 1}
                onRemove={() => handleRemoveConversion(conversion.id)}
                onUpdate={(data) =>
                  handleUpdateConversion({ ...data, level: index + 1 })
                }
              />
            ))
          )}
        </div>
      </ScrollArea>

      <Button
        className="mt-4 w-full cursor-pointer rounded-lg border-[3px] border-dashed border-slate-300 bg-slate-200/70 p-2 hover:bg-slate-200"
        onClick={handleAddConversion}
        disabled={conversions.length >= 5}
      >
        <p className="text-center text-sm text-slate-500">+ Add a conversion</p>
      </Button>
    </div>
  );
};

export default StockCardV2;
