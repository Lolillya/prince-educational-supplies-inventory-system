import { Calendar, Pin, Truck } from "lucide-react";
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
import { type RestockProps } from "../page";
import RestockItem from "./restock-item";
import ViewFullRestock from "./view-full-restock";
import DropdownFullRestock from "~/app/(protected)/admin/restock/_components/dropdown-full-restock";

const RestockRecord: React.FC<RestockProps> = ({
  restockId,
  date,
  supplier,
  restockClerk,
  addedStock,
  restockItems,
  notes
}) => {
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-slate-100 p-6 text-slate-700">
      <div className="flex items-center justify-between px-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-xl">#{restockId}</p>
            <Pin className="h-5 w-5 rotate-45 text-amber-400" />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center">
                <MoreOptions className="!h-1 !w-1 !rounded-lg" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-slate-700 shadow-none">
                {/*<DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">*/}
                {/*  Print*/}
                {/*</DropdownMenuItem>*/}
                {/*<DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">*/}
                {/*  Export*/}
                {/*</DropdownMenuItem>*/}
                <DropdownMenuSeparator />
                {/*<DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">*/}
                {/*  View Restock*/}
                {/*</DropdownMenuItem>*/}
                <DropdownFullRestock
                    restockId={restockId}
                    date={date}
                    supplier={supplier}
                    restockClerk={restockClerk}
                    addedStock={addedStock}
                    restockItems={restockItems}
                    notes={notes}
                />
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  View Supplier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red">
                  Void
                </DropdownMenuItem>
                {/*<DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red">*/}
                {/*  Delete*/}
                {/*</DropdownMenuItem>*/}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-3 text-slate-400">
              <Calendar className="h-4 w-4" />
              <p className="text-sm">
                {new Date(date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <Separator
              orientation="vertical"
              className="h-6 w-[2px] bg-slate-200"
            />
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4" />
              <p className="text-sm">{supplier}</p>
            </div>
          </div>
        </div>

        {/* <Separator
          orientation="vertical"
          className="h-16 w-[2px] rounded-lg bg-slate-200"
        /> */}

        <div className="flex items-center justify-between pl-8">
          <div className="flex flex-col gap-2">
            <p className="text-xl text-right">{addedStock.toLocaleString()}</p>
            <p className="text-sm text-right text-slate-400">Added Stock</p>
          </div>
          {/* <div>
          </div> */}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {restockItems.slice(0, 2).map((item, index) => {
          return (
            <RestockItem
              key={index}
              variant={item.variant}
              item={item.item}
              brand={item.brand}
              quantity={item.quantity}
              mainUnit={item.mainUnit}
              unitConversion={item.unitConversion.map(conv => ({
                from: conv.from,
                count: conv.count,
                to: conv.to,
                price: conv.price ?? 0 // Use nullish coalescing for price
              }))}
            />
          );
        })}

        <div className="flex items-center justify-between rounded-lg bg-white/70 px-6 py-3 text-slate-400">
          {restockItems.length > 2 ? (
            <p>
              {restockItems.length - 2} more item
              {restockItems.length - 2 > 1 ? "s" : ""}...
            </p>
          ) : (
            restockItems.length <= 2 && <p>No more items...</p>
          )}
          <div className="flex items-center gap-2">
            <ViewFullRestock
              restockId={restockId}
              date={date}
              supplier={supplier}
              restockClerk={restockClerk}
              addedStock={addedStock}
              restockItems={restockItems}
             notes={notes}/>
            {/* <Separator
              orientation="vertical"
              className="h-6 w-[2px] bg-slate-200"
            /> */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default RestockRecord;
