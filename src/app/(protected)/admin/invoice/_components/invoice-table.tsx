import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import MoreOptions from "../../_components/more-options";

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
  }[];
  isEditing: boolean;
};

const InvoiceTable: React.FC<Props> = ({ line_items, isEditing }) => {
  return (
    <div>
      <Table className="w-full table-fixed">
        <TableHeader className="sticky top-0 rounded-lg bg-slate-100">
          <TableRow className="border-none">
            <TableHead className="w-48 rounded-l-xl">Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Discount</TableHead>
            {isEditing ? (
              <>
                <TableHead>Subtotal</TableHead>
                <TableHead className="w-20 rounded-r-xl"></TableHead>
              </>
            ) : (
              <TableHead className="rounded-r-xl">Subtotal</TableHead>
            )}
          </TableRow>
        </TableHeader>
      </Table>
      <ScrollArea className="h-40" type="always">
        <Table className="w-full table-fixed">
          <TableBody>
            {line_items.map((item, index) => (
              <TableRow key={index} className="border-none text-slate-700">
                <TableCell className="w-48 rounded-l-xl">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="line-clamp-1 text-left hover:cursor-text">
                        {item.variant.item.name} -{" "}
                        {item.variant.item.brand.name} - {item.variant.name}
                      </TooltipTrigger>
                      <TooltipContent className="text-slate-700 shadow-none">
                        {item.variant.item.brand.name} -{" "}
                        {item.variant.item.name} - {item.variant.name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit.name}</TableCell>
                <TableCell>{item.unit_price}</TableCell>
                <TableCell>{item.discount}</TableCell>
                {isEditing ? (
                  <>
                    <TableCell>{item.total_price}</TableCell>
                    <TableCell className="w-20 rounded-r-xl">
                      <Popover>
                        <PopoverTrigger>
                          <MoreOptions className="!h-1 !w-1" />
                        </PopoverTrigger>
                        <PopoverContent
                          className="shadow-none"
                          popoverTarget=""
                        >
                          <p className="font-medium text-slate-700">
                            {item.variant.item.brand.name} -{" "}
                            {item.variant.item.name} - {item.variant.name}
                          </p>
                          <div className="mt-4 flex flex-col gap-2">
                            <div>
                              <Label className="text-slate-400">Quantity</Label>
                              <Input
                                className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
                                defaultValue={item.quantity}
                              />
                            </div>
                            <div>
                              <Label className="text-slate-400">Price</Label>
                              <Input
                                className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
                                defaultValue={item.unit_price}
                              />
                            </div>
                            <div>
                              <Label className="text-slate-400">Discount</Label>
                              <Input
                                className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
                                defaultValue={0}
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex w-full gap-2">
                            <Button className="w-1/2 bg-slate-200 text-slate-700 hover:bg-slate-300">
                              Cancel
                            </Button>
                            <Button className="w-1/2 bg-teal-100 text-green hover:bg-teal-200">
                              Update
                            </Button>
                          </div>
                          <Separator className="mt-4" />
                          <div className="mt-4 w-full">
                            <Button className="w-full bg-rose-100 text-red hover:bg-rose-200">
                              Void Item
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </>
                ) : (
                  <TableCell className="rounded-r-xl">
                    {item.total_price}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default InvoiceTable;
