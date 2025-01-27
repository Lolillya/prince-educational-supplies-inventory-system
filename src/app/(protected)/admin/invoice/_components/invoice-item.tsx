import { Banknote, Box, SquarePercent } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import MoreOptions from "../../_components/more-options";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { InvoiceProps } from "../page";

type orderItem = InvoiceProps["orderItem"][0];

type orderItemProps = {
  orderItem: orderItem;
};

const InvoiceItem: React.FC<orderItemProps> = ({ orderItem }) => {
  const {
    // item,
    // variant,
    // brand,
    quantity,
    unit,
    unit_price,
    discountValue,
    total_price,
  } = orderItem;

  return (
    <div className="rounded-lg bg-white/70 p-6">
      <div className="flex items-center justify-center">
        <div className="flex w-1/2 flex-col gap-4">
          <p>
            {orderItem.variant.item.name} - {orderItem.variant.item.brand.name}{" "}
            - {orderItem.variant.name}
          </p>
          <div className="flex items-center gap-5 text-slate-400">
            <div className="flex items-center gap-3 text-slate-400">
              <Box className="h-4 w-4" />
              <p className="text-sm">
                {quantity} {unit}
              </p>
            </div>
            <Separator
              orientation="vertical"
              className="h-4 w-[1px] bg-slate-200"
            />
            <p className="text-sm">₱ {unit_price.toLocaleString()}</p>
            <Separator
              orientation="vertical"
              className="h-4 w-[1px] bg-slate-200"
            />
            <p className="text-sm">{discountValue} discount</p>
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="h-16 w-[2px] rounded-lg bg-slate-200"
        />

        <div className="flex w-1/2 items-center justify-between pl-8">
          <div className="flex flex-col gap-4">
            <p>₱ {total_price.toLocaleString()}</p>
            <div className="flex items-center gap-8 text-slate-400">
              <div className="flex items-center gap-3 text-slate-400">
                <p className="text-sm">Subtotal</p>
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

export default InvoiceItem;
