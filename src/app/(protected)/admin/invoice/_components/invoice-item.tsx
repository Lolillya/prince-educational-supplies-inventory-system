import { Box } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import MoreOptions from "../../_components/more-options";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Props = {
  line_items: {
    quantity: number;
    unit_price: number;
    discount: number;
    total_price: number;
    unit: {
      name: string;
    };
    variant: {
      name: string;
      item: {
        name: string;
        brand: {
          name: string;
        };
      };
    };
  };
};

const InvoiceItem: React.FC<Props> = ({ line_items }: Props) => {
  const { quantity, unit, unit_price, total_price } = line_items;

  return (
    <div className="rounded-lg bg-white/70 p-3">
      <div className="flex items-center justify-center">
        <div className="flex w-1/2 gap-4">
          <p>
            {line_items.variant.item.name} -{" "}
            {line_items.variant.item.brand.name} - {line_items.variant.name}
          </p>
          <div className="flex items-center gap-5 text-slate-400">
            <div className="flex items-center gap-3 text-slate-400">
              <Box className="h-4 w-4" />
              <p className="text-sm">
                {quantity} {unit.name}
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
            <p className="text-sm">{line_items.discount}% Discount</p>
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="h-6 w-[2px] rounded-lg bg-slate-200"
        />

        <div className="flex w-1/2 items-center justify-between pl-8">
          <div className="flex gap-4">
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItem;
