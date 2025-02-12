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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";

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

  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg bg-white/70 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex max-w-[75%] flex-col gap-4">
          <p className="truncate">
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
            <p className="text-sm">{line_items.discount}</p>
          </div>
        </div>

        <div className="between flex items-center justify-between gap-4 pl-8">
          <div className="flex flex-col gap-4">
            <p>₱ {total_price.toLocaleString()}</p>
            <div className="flex items-center gap-8 text-slate-400">
              <div className="flex items-center gap-3 text-slate-400">
                <p className="text-sm">Subtotal</p>
              </div>
            </div>
          </div>
          {/*<div>
             <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreOptions />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-slate-700 shadow-none">
                <DropdownMenuItem
                  className="hover:!bg-slate-200 focus:!bg-slate-200"
                  onSelect={() => setOpen(true)} // Open the dialog when clicking "View item"
                >
                  View item
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu> */}

          {/* Dialog Component */}
          {/* <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Item Details</DialogTitle>
                  <DialogDescription>
                    <div>
                      <Label>
                        {line_items.variant.item.name} -{" "}
                        {line_items.variant.item.brand.name} -{" "}
                        {line_items.variant.name}
                      </Label>

                      <Label>{quantity}</Label>

                      <Label></Label>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog> 
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default InvoiceItem;
