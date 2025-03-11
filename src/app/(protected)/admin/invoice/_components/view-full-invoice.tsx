import { ArrowUpRight, Calendar, Printer } from "lucide-react";
import { useEffect, useState } from "react";
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
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import RecordExpand from "../../_components/record-expand";
import { type InvoiceProps } from "../page";
import InvoiceTable from "./invoice-table";

const ViewFullInvoice: React.FC<InvoiceProps> = ({
  invoice_number,
  invoice_id,
  date,
  customer,
  invoiceClerk,
  grandTotal,
  line_items,
  notes,
  handleExport,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [customerNotes, setCustomerNotes] = useState<string>(notes);
  const [initialNotes, setInitialNotes] = useState<string>(notes);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const { mutateAsync: saveInvoice, isPending: isSavingInvoice } =
    api.invoice.saveNotes.useMutation();

  const handleSaveInvoice = async () => {
    const invoiceData = {
      notes: {
        invoice_number: invoice_number,
        invoice_id: invoice_id,
        notes: customerNotes,
      },
    };

    try {
      await saveInvoice(invoiceData);
      toast({
        title: "Success",
        description: "Invoice created successfully!",
        variant: "default",
      });
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message?: string }).message ?? errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      if (isEditing) {
        setShowWarning(true);
        event.preventDefault();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCustomerNotes(newValue);
    setHasChanges(newValue !== initialNotes);
  };

  useEffect(() => {
    setInitialNotes(customerNotes); // Set initial notes when the component mounts
  }, []);

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
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200 hover:text-slate-500">
          View Details
          <ArrowUpRight strokeWidth={2.5} className="h-4 w-4" />
        </div>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[80%] !w-full !max-w-3xl flex-col [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className={`h-full text-xl font-normal`}>
          <div className="flex items-center justify-between">
            <div className="flex h-full flex-col justify-between gap-2">
              <DialogTitle className="text-xl font-normal text-slate-700">
                #{invoice_number}
              </DialogTitle>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="h-4 w-4" />
                <DialogDescription className="text-sm tracking-wide">
                  {date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* <RecordEditor isEditing={isEditing} handleEdit={handleEdit} /> */}
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
                defaultValue={customer}
              ></Input>
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
                defaultValue={invoiceClerk}
              />
            </div>
          </div>
        </div>

        <InvoiceTable line_items={line_items} isEditing={isEditing} />

        <Separator orientation="horizontal" className="h-[2px]" />

        <Textarea
          className="!min-h-16 resize-none border-none bg-slate-100 text-slate-700 focus:outline focus:outline-2 focus:outline-slate-200"
          placeholder="Your record notes..."
          value={customerNotes}
          onChange={handleChange}
        />

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
              <p className="text-sm tracking-wide"> discount</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DialogClose asChild disabled={isEditing}>
              {!hasChanges ? (
                <Button
                  variant={"secondary"}
                  className="text-slate-700 hover:bg-slate-200"
                  disabled={isEditing}
                >
                  Close
                </Button>
              ) : (
                <Button disabled={isSavingInvoice} onClick={handleSaveInvoice}>
                  Save
                </Button>
              )}
            </DialogClose>
            <Button
              className="bg-green hover:bg-green/80"
              disabled={isEditing}
              onClick={() =>
                handleExport({
                  line_items,
                  invoice_number: invoice_number.toString(),
                  customer,
                  date,
                  grandTotal: grandTotal.toString(),
                })
              }
            >
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
