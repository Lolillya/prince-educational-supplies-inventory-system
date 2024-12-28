import { Calendar, Users2 } from "lucide-react";
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

interface InvoiceProps {
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
}

const InvoiceRecord: React.FC<InvoiceProps> = ({
  invoiceId,
  date,
  customer,
  grandTotal,
  orderItems,
  discountValue,
}) => {
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-slate-100 p-10 text-slate-700">
      <div className="flex items-center justify-center px-6">
        <div className="flex w-1/2 flex-col gap-4">
          <p className="text-xl">#{invoiceId}</p>
          <div className="flex items-center gap-6 text-slate-400">
            <div className="flex items-center gap-3 text-slate-400">
              <Calendar className="h-4 w-4" />
              <p className="text-sm">{date}</p>
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

        <Separator
          orientation="vertical"
          className="h-16 w-[2px] rounded-lg bg-slate-200"
        />

        <div className="flex w-1/2 items-center justify-between pl-8">
          <div className="flex flex-col gap-4">
            <p className="text-xl">₱ {grandTotal.toLocaleString()}</p>
            <div className="flex items-center gap-8 text-slate-400">
              <div className="flex items-center gap-3 text-slate-400">
                <p className="text-sm">Grand Total</p>
              </div>
            </div>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger >
                <MoreOptions />
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
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  View Invoice
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  View Customer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red">
                  Void
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {orderItems.slice(0, 2).map((item, index) => {
          return (
            <InvoiceItem
              key={index}
              variant={item.variant}
              item={item.item}
              brand={item.brand}
              quantity={item.quantity}
              unit={item.unit}
              unitPrice={item.unitPrice}
              discountValue={item.discountValue}
              subtotal={item.subtotal}
            />
          );
        })}

        <div className="flex items-center justify-between rounded-lg bg-white/70 px-6 py-3 text-slate-400">
          {orderItems.length > 2 ? (
            <p>
              {orderItems.length - 2} more item
              {orderItems.length - 2 > 1 ? "s" : ""}...
            </p>
          ) : (
            orderItems.length <= 2 && <p>No more items...</p>
          )}
          <ViewFullInvoice
            invoiceId={invoiceId}
            date={date}
            customer={customer}
            grandTotal={grandTotal}
            discountValue={discountValue}
            orderItems={orderItems}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceRecord;
