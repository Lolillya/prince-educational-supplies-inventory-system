import { ArrowUpRight, Calendar, Printer } from "lucide-react";
import { Poppins } from "next/font/google";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import RecordEditor from "../../_components/record-editor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type InvoiceProps = {
  invoiceId: number;
  date: string;
  customer: string;
  grandTotal: number;
  discountValue: string;
  orderItems: {
    variant: string;
    item: string;
    brand: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discountValue: string;
    subtotal: number;
  }[];
};

const ViewFullInvoice: React.FC<InvoiceProps> = ({
  invoiceId,
  date,
  customer,
  grandTotal,
  discountValue,
  orderItems,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  //   console.log(orderItems);

  const handleEdit = () => {
    setIsEditing((prev) => !prev);
    setShowWarning(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    console.log("Key pressed:", event.key); // Log the key pressed
    if (event.key === "Escape") {
      console.log("Escape key pressed");
      if (isEditing) {
        console.log("Editing is enabled, showing warning");
        setShowWarning(true); // Ensure state is updated
        event.preventDefault();
      }
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!isEditing) {
          setIsDialogOpen(open);
        }
      }}
    >
      <DialogTrigger>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200 hover:text-slate-500">
          View All
          <ArrowUpRight strokeWidth={2.5} className="h-4 w-4" />
        </div>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[80%] !w-full !max-w-3xl flex-col [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader
          className={`text-xl ${poppins.className} h-full font-normal`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-full flex-col justify-between gap-2">
              <DialogTitle className="text-xl font-normal text-slate-700">
                #{invoiceId}
              </DialogTitle>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="h-4 w-4" />
                <DialogDescription className="text-sm tracking-wide">
                  {date}
                </DialogDescription>
              </div>
            </div>
            <RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
          </div>
        </DialogHeader>

        <Separator orientation="horizontal" className="h-[2px]" />

        <div className="flex gap-3">
          <div className="group flex w-1/2 flex-col gap-2">
            <Label className="text-slate-400">Customer & Term</Label>
            <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
              <Input
                className="w-3/4 rounded-r-none bg-slate-100 text-slate-700 shadow-none"
                disabled={!isEditing}
                value={customer}
              />
              <Separator orientation="vertical" className="w-[3px]" />
              <Input
                className="w-1/4 rounded-l-none bg-slate-100 text-slate-700 shadow-none"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="group flex w-1/2 flex-col gap-2">
            <Label className="text-slate-400">Recorded by</Label>
            <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
              <Input
                className="bg-slate-100 text-slate-700 shadow-none"
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <Table className="w-full table-fixed border-collapse">
          <TableHeader className="sticky top-0">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Subtotal</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="w-full overflow-y-auto">
            {orderItems.map((item, index) => (
              <TableRow key={index} className="w-full">
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.variant}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.unitPrice}</TableCell>
                <TableCell>{item.discountValue}</TableCell>
                <TableCell>{item.subtotal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Separator orientation="horizontal" className="h-[2px]" />

        <div className="flex items-center justify-between">
          <div className="flex h-full flex-col justify-between gap-1">
            <p className="text-base font-normal text-slate-700">
              ₱{grandTotal}
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <p className="text-sm tracking-wide">Grand Total</p>
              <Separator
                orientation="vertical"
                className="h-4 w-[2px] bg-slate-200"
              />
              <p className="text-sm tracking-wide">{discountValue} discount</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DialogClose asChild disabled={isEditing}>
              <Button
                variant={"secondary"}
                className="text-slate-700 hover:bg-slate-200"
                disabled={isEditing}
              >
                Close
              </Button>
            </DialogClose>
            <Button className="bg-green hover:bg-green/80" disabled={isEditing}>
              <Printer />
              Print Invoice
            </Button>
          </div>
        </div>
        {showWarning && (
          <p className="text-right text-sm text-orange-400">
            Whoops! Don't forget to save your changes.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewFullInvoice;
