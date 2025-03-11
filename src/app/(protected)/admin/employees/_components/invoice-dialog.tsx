import { Calendar, Printer } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import RecordEditor from "../../_components/record-editor";
import RecordExpand from "../../_components/record-expand";
import EmployeeActivityCard from "./employee-activity-card";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface InvoiceDialogProps {
  invoice: {
    invoice_number: number;
    created_at: Date;
    total_amount: number;
    invoiceClerk: {
      Personal_Details: {
        first_name: string;
        last_name: string;
        company: string;
      };
    };
  };
  id: string;
  activity: any;
  context: string;
}

const InvoiceDialog = ({ activity }: InvoiceDialogProps) => {
  const grandTotal = activity.line_items?.reduce(
    (sum: number, li: any) => sum + li.total_price, 0
  ) || 0;

  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleEdit = () => {
    setIsEditing((prev) => !prev);
    setShowWarning(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      if (isEditing) {
        setShowWarning(true);
        event.preventDefault();
      }
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (isEditing) {
            setShowWarning(true);
            return;
          }
        }
        setIsDialogOpen(open);
        if (!open) {
          setShowWarning(false);
        }
      }}
    >
      <DialogTrigger>
        <EmployeeActivityCard
          type="invoice"
          activity={{
            id: activity.invoice_number,
            created_at: activity.created_at,
            total: activity.total_amount
          }}
        />
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[80%] !w-full !max-w-3xl flex-col [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className={`text-xl ${poppins.className} font-normal`}>
          <div className="flex items-center justify-between">
            <div className="flex h-full flex-col justify-between gap-2">
              <DialogTitle className="text-xl font-normal text-slate-700">
                Invoice #{activity.invoice_number}
              </DialogTitle>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="h-4 w-4" />
                <DialogDescription className="text-sm tracking-wide">
                  {new Date(activity.created_at).toLocaleDateString()}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
              <RecordExpand />
            </div>
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
                defaultValue={"Customer"}
              />{" "}
              {/** Please pass real data here */}
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
                defaultValue={"Employee"}
              />{" "}
              {/** Please pass real data here */}
            </div>
          </div>
        </div>

        {/* <InvoiceTable orderItem={line_items} isEditing={isEditing} /> */}
        <p>
          Note: Gi tanggal ko ang RestockTable component and other functionality
          for now kay di ko sure kung tama ang pag reference sa db......... but
          this is how it should look like oke?
        </p>

        <Separator orientation="horizontal" className="h-[2px]" />

        <Textarea
          className="!min-h-16 resize-none border-none bg-slate-100 text-slate-700 focus:outline focus:outline-2 focus:outline-slate-200"
          placeholder="Your record notes..."
          disabled={!isEditing}
        />

        <div className="flex items-center justify-between">
          <div className="flex h-full flex-col justify-between gap-1">
            <p className="text-base font-normal text-slate-700">
              ₱{5000} {/** Please pass real data here */}
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <p className="text-sm tracking-wide">Grand Total</p>
              <Separator
                orientation="vertical"
                className="h-4 w-[2px] bg-slate-200"
              />
              <p className="text-sm tracking-wide">{"0%"} discount</p>{" "}
              {/** Please pass real data here */}
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

export default InvoiceDialog;
