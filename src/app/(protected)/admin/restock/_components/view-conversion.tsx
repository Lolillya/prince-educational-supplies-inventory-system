import { CornerDownRight } from "lucide-react";
import React from "react";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

interface ConversionData {
  fromUnit: string;
  toUnit: string;
  conversionRate: number;
  price: number;
}

interface ViewConversionProps {
  mainUnit: string;
  mainPrice: number;
  conversions: ConversionData[];
  conversionCount: number;
  onSelect: () => void;
}

const ViewConversion = ({
  mainUnit,
  mainPrice,
  conversions,
  conversionCount,
  onSelect,
}: ViewConversionProps) => {
  console.log(
    `ViewConversion: ${mainUnit} with ${conversions.length} conversions (conversionCount: ${conversionCount})`,
  );
  conversions.forEach((conv, i) => {
    console.log(
      `  [${i}]: ${conv.fromUnit} → ${conv.toUnit}, Rate: ${conv.conversionRate}, Price: ${conv.price}`,
    );
  });

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <DropdownMenuItem
          className="hover:!bg-slate-200 focus:!bg-slate-200"
          onClick={onSelect}
        >
          <span className="w-full font-medium">
            {mainUnit}{" "}
            <span className="ml-1 text-slate-500">({conversionCount})</span>
          </span>
        </DropdownMenuItem>
      </HoverCardTrigger>
      <HoverCardContent
        className="ml-2 w-64 rounded-md border border-slate-200 bg-white p-2 shadow-none"
        side="right"
        align="center"
      >
        <div className="flex flex-col gap-1">
          <div className="flex w-full items-end justify-between">
            <p className="text-sm text-slate-500">
              {mainUnit}{" "}
              <span className="ml-2 text-sm text-slate-400">main</span>
            </p>
            <p className="text-sm font-medium text-slate-500">
              ₱{mainPrice.toFixed(2)}
            </p>
          </div>

          {conversions.map((conversion, index) => (
            <div key={index} className="flex w-full items-end justify-between">
              <div className="flex items-center gap-2">
                <CornerDownRight
                  className="h-3 w-3 text-slate-400"
                  strokeWidth={2.5}
                />
                <p className="text-sm text-slate-500">
                  {conversion.conversionRate} {conversion.toUnit}
                </p>
              </div>
              <p className="text-sm font-medium text-slate-500">
                ₱{conversion.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ViewConversion;
