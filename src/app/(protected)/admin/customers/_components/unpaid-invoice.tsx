import { Calendar, CheckCircle2 } from "lucide-react";
import { Poppins } from "next/font/google";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Payment from "../../_components/payment";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface UnpaidInvoiceProps {
  invoice: {
    invoice_number: number;
    created_at: Date;
    total_amount: number;
    paid_amount: number;
    remaining: number;
    invoice_id: number;
    isPaid?: boolean;
    status?: string;
  };
  onPaymentSuccess: () => void;
}

const UnpaidInvoice = ({ invoice, onPaymentSuccess }: UnpaidInvoiceProps) => {
  const formattedDate = new Date(invoice.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  // Add safety checks for numerical values
  const remaining = (invoice.remaining ?? 0).toFixed(2);
  const paidAmount = (invoice.paid_amount ?? 0).toFixed(2);
  const totalAmount = (invoice.total_amount ?? 0).toFixed(2);

  // Calculate change (if overpaid)
  const change = Math.max(
    invoice.paid_amount - invoice.total_amount,
    0,
  ).toFixed(2);
  const isPaid =
    invoice.isPaid || invoice.status === "PAID" || invoice.remaining <= 0;

  return (
    <div
      className={`w-full rounded-lg p-6 ${isPaid ? "bg-emerald-50" : "bg-slate-100"}`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex flex-col gap-1 ${poppins.className} w-full`}>
          <div className="flex items-center gap-2">
            <p className="text-lg text-slate-600">
              #{invoice.invoice_number.toString().padStart(8, "0")}
            </p>
            {isPaid && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-[2px] text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" /> Paid
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <TooltipProvider delayDuration={0} skipDelayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Calendar className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent className="rounded-lg border border-slate-200 bg-white text-sm text-slate-700 shadow-none">
                  Invoice recorded on {formattedDate}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm">{formattedDate}</p>
          </div>
        </div>
        <Separator
          orientation="vertical"
          className="h-12 w-[2px] bg-slate-200"
        />
        <div
          className={`flex items-center justify-between ${poppins.className} ml-6 w-full`}
        >
          <div className={`flex flex-col gap-1`}>
            {isPaid ? (
              <>
                <p className="text-lg text-emerald-600">₱{paidAmount}</p>
                <div className="flex gap-2 text-sm text-slate-400">
                  <span>of ₱{totalAmount}</span>
                </div>
                {parseFloat(change) > 0 && (
                  <p className="text-xs text-emerald-600">Change: ₱{change}</p>
                )}
                <p className="text-sm text-emerald-600">Paid in Full</p>
              </>
            ) : (
              <>
                <p className="text-lg text-slate-600">₱{remaining}</p>
                <div className="flex gap-2 text-sm text-slate-400">
                  <span>of ₱{totalAmount}</span>
                </div>
                {parseFloat(paidAmount) > 0 && (
                  <p className="text-xs text-slate-400">Paid: ₱{paidAmount}</p>
                )}
                <p className="text-sm text-slate-400">Unpaid Amount</p>
              </>
            )}
          </div>
          {!isPaid && (
            <Payment
              invoiceId={invoice.invoice_id}
              remainingAmount={invoice.remaining}
              onPaymentSuccess={onPaymentSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnpaidInvoice;
