import { Box } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import MoreOptions from "../../_components/more-options";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import UnitLine from "./unit-line";

interface RestockItemsProps {
  variant: string;
  item: string;
  brand: string;
  quantity: number;
  mainUnit: string;
  unitConversion: {
    from: string;
    count: number;
    to: string;
  }[];
}

const RestockItem: React.FC<RestockItemsProps> = ({
  variant,
  item,
  brand,
  quantity,
  mainUnit,
  unitConversion,
}) => {
  return (
    <div className="rounded-lg bg-white/70 p-6">
      <div className="flex items-center justify-center">
        <div className="flex w-1/2 flex-col gap-4">
          <p>
            {brand} - {item} - {variant}
          </p>
          <div className="flex items-center gap-5 text-slate-400">
            <div className="flex items-center gap-3 text-slate-400">
              <Box className="h-4 w-4" />
              <p className="text-sm">{mainUnit}</p>
            </div>

            <Separator
              orientation="vertical"
              className="h-4 w-[1px] bg-slate-200"
            />

            <HoverCard>
              <HoverCardTrigger className="text-sm hover:underline">
                {unitConversion.length} Conversions
              </HoverCardTrigger>
              <HoverCardContent className="flex flex-col gap-3 shadow-none">
                {unitConversion.map((unit, index) => (
                  <UnitLine
                    key={index}
                    from={unit.from}
                    count={unit.count}
                    to={unit.to}
                  />
                ))}
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="h-16 w-[2px] rounded-lg bg-slate-200"
        />

        <div className="flex w-1/2 items-center justify-between pl-8">
          <div className="flex flex-col gap-4">
            <p>{quantity.toLocaleString()}</p>
            <div className="flex items-center gap-8 text-slate-400">
              <div className="flex items-center gap-3 text-slate-400">
                <p className="text-sm">Added Items</p>
              </div>
            </div>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreOptions />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-slate-700 shadow-none">
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  View item
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red">
                  Void
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestockItem;
