import { Calendar, User2 } from "lucide-react";
import { Poppins } from "next/font/google";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Refund from "../../_components/refund";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface PaymentRecordProps {
  payment: {
    payment_id: number;
    invoice_id: number;
    amount: number;
    payment_date: Date;
    payment_method: string;
    reference?: string | null;
    invoice?: {
      invoice_number: number;
    };
    PaymentLog?: {
      status: string;
      timestamp: Date;
    }[];
  };
  onRefund?: () => void;
}

const PaymentRecord = ({ payment, onRefund }: PaymentRecordProps) => {
  const formattedDate = new Date(payment.payment_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Format the invoice number with leading zeros
  const formattedInvoiceNumber =
    payment.invoice?.invoice_number.toString().padStart(8, "0") || "00000000";

  // Format the amount with 2 decimal places
  const formattedAmount = payment.amount.toFixed(2);

  return (
    <div className="w-full rounded-lg bg-slate-100 p-6">
      <div className="flex items-center justify-between">
        <div className={`flex flex-col gap-1 ${poppins.className} w-full`}>
          <p className="text-lg text-slate-600">#{formattedInvoiceNumber}</p>
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-2 text-slate-400">
              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Calendar className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="rounded-lg border border-slate-200 bg-white text-sm text-slate-700 shadow-none">
                    Payment recorded on {formattedDate}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm">{formattedDate}</p>
            </div>
            <Separator
              orientation="vertical"
              className="h-5 w-[2px] bg-slate-200"
            />
            <div className="flex items-center gap-2 text-slate-400">
              <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <User2 className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="rounded-lg border border-slate-200 bg-white text-sm text-slate-700 shadow-none">
                    Payment method: {payment.payment_method}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm">{payment.payment_method}</p>
            </div>
          </div>
        </div>
        <Separator
          orientation="vertical"
          className="h-12 w-[2px] bg-slate-200"
        />
        <div className="${poppins.className} ml-6 flex w-full items-center justify-between">
          <div className={`flex flex-col gap-1`}>
            <p className="text-lg text-slate-600">₱{formattedAmount}</p>
            <div className="flex items-center gap-4 text-slate-400">
              <p className="text-sm">Amount paid</p>
              <Separator
                orientation="vertical"
                className="h-5 w-[2px] bg-slate-200"
              />
              <div className="flex items-center gap-3">
                <p className="text-sm">
                  {payment.reference
                    ? `Ref: ${payment.reference}`
                    : "No reference"}
                </p>
              </div>
            </div>
          </div>
          <Refund onClick={onRefund} />
        </div>
      </div>
    </div>
  );
};

export default PaymentRecord;
