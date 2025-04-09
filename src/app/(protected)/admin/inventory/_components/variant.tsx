import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface VariantProps {
  onRemove: () => void;
  isOnlyVariant: boolean;
  value?: {
    variant: string;
    lowStock: number;
    veryLowStock: number;
  };
  onChange?: (value: {
    variant: string;
    lowStock: number;
    veryLowStock: number;
  }) => void;
}

const Variant = ({
  onRemove,
  isOnlyVariant,
  value = { variant: "", lowStock: 0, veryLowStock: 0 },
  onChange,
}: VariantProps) => {
  const hasStockError =
    value?.lowStock !== undefined &&
    value?.veryLowStock !== undefined &&
    value?.lowStock <= value?.veryLowStock &&
    value?.lowStock > 0 &&
    value?.veryLowStock > 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-slate-100 p-4">
      <Input
        placeholder="Variant Name"
        className="bg-white text-slate-700 placeholder-slate-300 shadow-none"
        value={value.variant}
        onChange={(e) => {
          onChange?.({
            ...value,
            variant: e.target.value,
          });
        }}
      />
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex w-full flex-col">
            <div className="flex w-full items-center">
              <div className="h-full w-2 rounded-l-lg bg-amber-500" />
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Low Stock Level"
                className="w-full rounded-l-none bg-white text-slate-700 placeholder-slate-300 shadow-none"
                value={value.lowStock === 0 ? "" : value.lowStock}
                onKeyDown={(e) => {
                  // Allow keyboard shortcuts and navigation keys
                  if (e.metaKey || e.ctrlKey || e.altKey) {
                    return;
                  }

                  // Allow only numeric keys, backspace, delete, tab, arrows
                  if (
                    !/^\d$/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                      "Home",
                      "End",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  onChange?.({
                    ...value,
                    lowStock: val === "" ? 0 : Number(val),
                  });
                }}
              />
            </div>
          </div>
          <div className="flex w-full flex-col">
            <div className="flex w-full items-center">
              <div className="h-full w-2 rounded-l-lg bg-rose-500" />
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Very Low Stock Level"
                className="w-full rounded-l-none bg-white text-slate-700 placeholder-slate-300 shadow-none"
                value={value.veryLowStock === 0 ? "" : value.veryLowStock}
                onKeyDown={(e) => {
                  // Allow keyboard shortcuts and navigation keys
                  if (e.metaKey || e.ctrlKey || e.altKey) {
                    return;
                  }

                  // Allow only numeric keys, backspace, delete, tab, arrows
                  if (
                    !/^\d$/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                      "Home",
                      "End",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  onChange?.({
                    ...value,
                    veryLowStock: val === "" ? 0 : Number(val),
                  });
                }}
              />
            </div>
          </div>
        </div>
        {hasStockError && (
          <p className="text-sm text-rose-500">
            {value.lowStock === value.veryLowStock
              ? "Low stock and Very Low Stock cannot have same value"
              : "Very low stock level must be less than low stock level"}
          </p>
        )}
      </div>
      {onRemove && (
        <Button
          className="mt-2 rounded-lg border-[3px] border-dashed border-slate-300 bg-slate-100 p-2 text-slate-400 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-400"
          onClick={onRemove}
          disabled={isOnlyVariant}
        >
          Remove Variant
        </Button>
      )}
    </div>
  );
};

export default Variant;
