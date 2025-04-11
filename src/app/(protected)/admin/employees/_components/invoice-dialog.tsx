import { Calendar, X } from "lucide-react";
import { Poppins } from "next/font/google";
import React, { useState } from "react";
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
import EmployeeActivityCard from "./employee-activity-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface InvoiceDialogProps {
  invoice: any;
  id: string;
  activity: any;
  context: string;
}

const InvoiceDialog = ({ activity, context }: InvoiceDialogProps) => {
  const invoiceNumber = activity.invoice_number || 0;
  const createdAt = activity.created_at || new Date();
  const grandTotal = activity.total_amount || 0;
  const lineItems = activity.line_items || [];

  // Get formatted customer name
  const customerCompany = activity.customer?.Personal_Details?.company || "";
  const customerFirstName = activity.customer?.Personal_Details?.first_name || "";
  const customerLastName = activity.customer?.Personal_Details?.last_name || "";
  const customerName = customerCompany || `${customerFirstName} ${customerLastName}`;
  const customerTerm = activity.customer?.term || "";

  // Get formatted clerk name
  const clerkFirstName = activity.invoiceClerk?.Personal_Details?.first_name || "";
  const clerkLastName = activity.invoiceClerk?.Personal_Details?.last_name || "";
  const clerkName = `${clerkFirstName} ${clerkLastName}`.trim();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
      <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
          }}
      >
        <DialogTrigger asChild>
          <div>
            <EmployeeActivityCard
                type="invoice"
                activity={{
                  id: invoiceNumber,
                  created_at: createdAt,
                  total: grandTotal
                }}
            />
          </div>
        </DialogTrigger>
        <DialogContent
            className="flex max-h-[80%] !w-full !max-w-3xl flex-col [&>button]:hidden"
        >
          <DialogHeader className={`text-xl ${poppins.className} font-normal`}>
            <div className="flex items-center justify-between">
              <div className="flex h-full flex-col justify-between gap-2">
                <DialogTitle className="text-xl font-normal text-slate-700">
                  Invoice #{invoiceNumber}
                </DialogTitle>
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <DialogDescription className="text-sm tracking-wide">
                    {new Date(createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </DialogDescription>
                </div>
              </div>
              <DialogClose asChild>
                <Button variant={"secondary"} className="h-12 w-12 text-slate-700">
                  <X className="!h-6 !w-6 text-slate-400" strokeWidth={2.5} />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <Separator orientation="horizontal" className="h-[2px]" />

          <div className="flex gap-3">
            <div className="group flex w-full flex-col gap-2">
              <Label className="text-slate-400">
                {context === "customer" ? "Recorded by & Term" : "Customer & Term"}
              </Label>
              <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
                <Input
                    className="w-3/4 rounded-r-none bg-slate-100 text-slate-700 shadow-none"
                    disabled={true}
                    defaultValue={context === "customer" ? clerkName : customerName}
                />
                <Separator orientation="vertical" className="w-[3px]" />
                <Input
                    className="w-1/4 rounded-l-none bg-slate-100 text-slate-700 shadow-none"
                    disabled={true}
                    defaultValue={customerTerm}
                />
              </div>
            </div>
          </div>

          {/* Invoice items table */}
          <div>
            <Table className="w-full table-fixed">
              <TableHeader className="sticky top-0 rounded-lg bg-slate-100">
                <TableRow className="border-none">
                  <TableHead className="w-48 rounded-l-xl">Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="rounded-r-xl">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="h-40" type="always">
              <Table className="w-full table-fixed">
                <TableBody>
                  {lineItems.length > 0 ? (
                      lineItems.map((item: any, index: number) => (
                          <TableRow key={index} className="border-none text-slate-700">
                            <TableCell className="w-48 rounded-l-xl">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="line-clamp-1 text-left hover:cursor-text">
                                    {item.variant?.item?.name || "Item"} - {item.variant?.item?.brand?.name || "Brand"} - {item.variant?.name || "Variant"}
                                  </TooltipTrigger>
                                  <TooltipContent className="text-slate-700 shadow-none">
                                    {item.variant?.item?.name || "Item"} - {item.variant?.item?.brand?.name || "Brand"} - {item.variant?.name || "Variant"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unit?.name || ""}</TableCell>
                            <TableCell>{item.unit_price}</TableCell>
                            <TableCell>{item.discount || 0}%</TableCell>
                            <TableCell className="rounded-r-xl">
                              ₱{item.total_price?.toLocaleString() || 0}
                            </TableCell>
                          </TableRow>
                      ))
                  ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="rounded-xl text-slate-700 text-center">
                          No items available
                        </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <Separator orientation="horizontal" className="h-[2px]" />

          <div className="flex items-center justify-between">
            <div className="flex h-full flex-col justify-between gap-1">
              <p className="text-base font-normal text-slate-700">
                ₱{grandTotal?.toLocaleString() || 0}
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <p className="text-sm tracking-wide">Grand Total</p>
                <Separator
                    orientation="vertical"
                    className="h-4 w-[2px] bg-slate-200"
                />
                <p className="text-sm tracking-wide">{activity.discount || "0%"} discount</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button
                    variant={"secondary"}
                    className="text-slate-700 hover:bg-slate-200"
                >
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
};

export default InvoiceDialog;
