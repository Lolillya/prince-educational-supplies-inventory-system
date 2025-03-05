import { Calendar, Pin, Users2 } from "lucide-react";
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
import InvoiceItem from "./invoice-item";
import ViewFullInvoice from "./view-full-invoice";
import { InvoiceProps } from "../page";

const InvoiceRecord: React.FC<InvoiceProps> = ({
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
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-slate-100 p-6 text-slate-700">
      <div className="flex items-center justify-between px-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-xl">#{invoice_number}</p>
            <Pin className="h-5 w-5 rotate-45 text-amber-400" />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center">
                <MoreOptions className="!h-1 !w-1 !rounded-lg" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="text-slate-700 shadow-none">
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  Pin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  View Invoice
                </DropdownMenuItem> */}
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  View Customer
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red">
                  Void
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="items text-right-center flex gap-4 text-slate-400">
            <div className="flex items-center gap-3 text-slate-400">
              <Calendar className="h-4 w-4" />
              <p className="text-sm">
                {date.toLocaleDateString("en-US", {
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
              <Users2 className="h-4 w-4" />
              <p className="text-sm">{customer}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pl-8">
          <div className="flex flex-col gap-2">
            <p className="text-right text-xl">
              ₱ {grandTotal.toLocaleString()}
            </p>
            <div className="flex items-center gap-8 text-slate-400">
              <div className="flex items-center gap-3 text-slate-400">
                <p className="text-right text-sm">Grand Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {line_items.slice(0, 2).map((item, index) => (
          <InvoiceItem key={index} line_items={item} />
        ))}

        <div className="flex items-center justify-between rounded-lg bg-white/70 px-6 py-3 text-slate-400">
          {line_items.length > 2 ? (
            <p>
              {line_items.length - 2} more item
              {line_items.length - 2 > 1 ? "s" : ""}...
            </p>
          ) : (
            line_items.length <= 2 && <p>No more items...</p>
          )}
          <div className="flex items-center gap-2">
            <ViewFullInvoice
              invoice_number={invoice_number}
              invoice_id={invoice_id}
              date={date}
              customer={customer}
              invoiceClerk={invoiceClerk}
              grandTotal={grandTotal}
              line_items={line_items}
              notes={notes}
              handleExport={handleExport}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceRecord;
