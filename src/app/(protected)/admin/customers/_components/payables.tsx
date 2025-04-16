import { Printer } from "lucide-react";
import { Poppins } from "next/font/google";
import { useState } from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import PayablesInfo from "./payables-info";
import PayablesTabs from "./payables-tabs";
import PaymentRecord from "./payment-record";
import UnpaidInvoice from "./unpaid-invoice";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface PayablesProps {
  sum: number;
  unpaidInvoices: {
    invoice_number: number;
    created_at: Date;
    total_amount: number;
    remaining: number;
    invoice_id: number;
    paid_amount: number;
    isPaid?: boolean;
    status?: string;
  }[];
  emoji: string; // Add emoji prop
  company: string; // Add companyName prop
  onPaymentSuccess: () => void;
  onRefundSuccess?: () => void;
  customerId: string; // Add customerId prop
}

interface PaymentRecordType {
  payment_id: number;
  invoice_id: number;
  amount: number;
  payment_date: Date;
  payment_method: string;
  reference?: string | null;
  invoice?: {
    invoice_number: number;
    status?: string;
  };
  PaymentLog?: {
    status: string;
    timestamp: Date;
  }[];
}

const Payables = ({
  sum,
  unpaidInvoices,
  emoji,
  company,
  onPaymentSuccess,
  onRefundSuccess,
  customerId,
}: PayablesProps) => {
  const [selectedTab, setSelectedTab] = useState<"payables" | "payments">(
    "payables",
  );

  // Calculate total remaining from invoices if sum is incorrect
  const calculatedSum =
    sum ?? unpaidInvoices.reduce((acc, invoice) => acc + invoice.remaining, 0);

  // Fetch all payment records for the customer
  const { data: customerPaymentRecords, refetch: refetchPaymentRecords } =
    api.payment.getByCustomerId.useQuery(
      { customerId },
      {
        enabled: !!customerId && selectedTab === "payments",
        staleTime: 5000, // Refresh data every 5 seconds if tab is active
      },
    );

  const handleRefundSuccess = () => {
    // Refresh payment records
    void refetchPaymentRecords();
    // Also refresh unpaid invoices to update the total
    onPaymentSuccess();
    // Call the onRefundSuccess callback if provided
    if (onRefundSuccess) {
      onRefundSuccess();
    }
  };

  const renderPaymentRecords = () => {
    if (!customerPaymentRecords || customerPaymentRecords.length === 0) {
      return (
        <div className="flex items-center justify-center p-4 text-slate-500">
          No payment records found
        </div>
      );
    }

    return customerPaymentRecords.map((record) => (
      <PaymentRecord
        key={record.payment_id}
        payment={record}
        onRefundSuccess={handleRefundSuccess}
      />
    ));
  };

  // Count unpaid and total invoices
  const unpaidCount = unpaidInvoices.filter((inv) => !inv.isPaid).length;
  const totalCount = unpaidInvoices.length;

  return (
    <Dialog>
      <DialogTrigger>
        <PayablesInfo sum={sum} />
      </DialogTrigger>
      <DialogContent className="flex max-h-[80%] !w-full !max-w-4xl flex-col [&>button]:hidden">
        <DialogHeader className={`text-xl ${poppins.className} font-normal`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 !rounded-lg">
                <AvatarFallback className="!rounded-lg bg-black text-3xl text-slate-700">
                  {emoji || "🏢"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <DialogTitle className="text-xl font-normal text-slate-700">
                  {company || "Customer Company"}
                </DialogTitle>
                <p className="text-sm text-slate-400">
                  {unpaidCount} unpaid{" "}
                  {unpaidCount === 1 ? "invoice" : "invoices"} of {totalCount}{" "}
                  total
                </p>
              </div>
            </div>
            <PayablesTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          </div>
        </DialogHeader>

        <Separator orientation="horizontal" className="h-[2px]" />

        <ScrollArea className="h-80">
          <div className="flex flex-col gap-2">
            {selectedTab === "payables"
              ? unpaidInvoices.map((invoice) => (
                  <UnpaidInvoice
                    key={invoice.invoice_id}
                    invoice={invoice}
                    onPaymentSuccess={onPaymentSuccess}
                  />
                ))
              : renderPaymentRecords()}
          </div>
        </ScrollArea>

        <Separator orientation="horizontal" className="h-[2px]" />

        <div className="flex items-center justify-between">
          <div className="flex h-full flex-col justify-between gap-1">
            <p className="text-base font-normal text-slate-700">
              ₱{calculatedSum.toFixed(2)}
            </p>
            <p className="text-sm tracking-wide text-slate-400">
              Total Payables
            </p>
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
            <Button className="bg-green hover:bg-green/80">
              <Printer />
              Print Statement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Payables;
