import { CornerDownRight, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  level: number;
  onRemove: () => void;
  onUpdate: (data: ConversionProps["data"]) => void;
}

const Conversion = ({ data, level, onRemove, onUpdate }: ConversionProps) => {
  const [inputValue, setInputValue] = useState(data.unit);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
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

  // Update inputValue when data.unit changes from parent
  useEffect(() => {
    if (data.unit !== inputValue) {
      setInputValue(data.unit);
    }
  }, [data.unit, inputValue]);

  const handleSelectUnit = (unitName: string) => {
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

  return (
    <div className="mt-4">
      <div className="flex gap-4">
        <div className="flex w-1/2 flex-col gap-1">
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
                    <Label className="flex items-center text-sm text-slate-400">
                      Conversion {level}
                    </Label>
                    <div className="flex w-full">
                      <div className="w-1/2">
                        <Input
                          type="number"
                          step="0"
                          min="0"
                          className="rounded-r-none bg-white text-slate-700 shadow-none"
                          placeholder="Qty."
                          value={data.qty}
                          onChange={(e) => {
                            const value =
                              e.target.value.replace(/[^\d]/g, "") || "0";
                            onUpdate({
                              ...data,
                              qty: value,
                            });
                          }}
                        />
                      </div>
                      <Separator
                        orientation="vertical"
                        className="h-auto w-1 bg-slate-200"
                      />
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
                              // Update parent immediately with the new value
                              onUpdate({
                                ...data,
                                unit: value,
                              });
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => {
                              if (
                                !dropdownRef.current?.contains(
                                  document.activeElement,
                                )
                              ) {
                                setIsDropdownVisible(false);
                                // Only update parent if value has changed and is valid
                                if (
                                  inputValue !== data.unit &&
                                  unitOptions.includes(inputValue)
                                ) {
                                  onUpdate({
                                    ...data,
                                    unit: inputValue,
                                  });
                                } else if (!unitOptions.includes(inputValue)) {
                                  // Reset to last valid value if current value is not valid
                                  setInputValue(data.unit);
                                }
                              }
                            }, 100);
                          }}
                          onKeyDown={handleKeyDown}
                        />

                        {isDropdownVisible &&
                          inputValue &&
                          filteredUnits.length > 0 && (
                            <div
                              ref={dropdownRef}
                              className="fixed z-[9999] mt-1"
                              style={{
                                top: `${(inputRef.current?.getBoundingClientRect().bottom || 0) + 4}px`,
                                left: `${inputRef.current?.getBoundingClientRect().left || 0}px`,
                                width: `${inputRef.current?.offsetWidth || 0}px`,
                              }}
                            >
                              <div className="rounded-md border border-slate-200 bg-white shadow-lg">
                                <ScrollArea className="max-h-[200px]">
                                  {filteredUnits.map((unitName, index) => (
                                    <div
                                      key={unitName}
                                      className={`cursor-pointer px-4 py-2 hover:bg-slate-100 ${highlightedIndex === index ? "bg-slate-200" : ""}`}
                                      onMouseDown={() =>
                                        handleSelectUnit(unitName)
                                      }
                                    >
                                      {unitName}
                                    </div>
                                  ))}
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
        <Separator
          orientation="vertical"
          className="h-auto w-px bg-slate-300"
        />
        <div className="flex w-1/2 flex-col gap-2">
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-slate-400">Stock</Label>
              <Input
                type="number"
                step="1"
                min="0"
                className="bg-white text-slate-700 shadow-none"
                placeholder="Stock"
                value={data.stock}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "") || "";
                  onUpdate({
                    ...data,
                    stock: value,
                  });
                }}
                onBlur={(e) => {
                  // If the field is empty when blurring, don't reset to "0"
                  // This ensures we can differentiate between empty and zero
                  const value =
                    e.target.value.trim() === ""
                      ? ""
                      : String(Number(e.target.value));
                  onUpdate({
                    ...data,
                    stock: value,
                  });
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-slate-400">Unit Price</Label>
              <Input
                type="number"
                step="0.25"
                min="0"
                className="bg-white text-slate-700 shadow-none"
                placeholder="Price"
                value={data.price}
                onChange={(e) => {
                  const value = e.target.value || "0.00";
                  onUpdate({
                    ...data,
                    price: value,
                  });
                }}
                onBlur={(e) => {
                  const value = e.target.value
                    ? Number(e.target.value).toFixed(2)
                    : "0.00";
                  onUpdate({
                    ...data,
                    price: value,
                  });
                }}
              />
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
