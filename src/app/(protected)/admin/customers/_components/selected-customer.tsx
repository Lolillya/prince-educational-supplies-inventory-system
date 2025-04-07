import { Mail, MapPin, Phone, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import Edit from "../../_components/edit";
import RecordInfo from "../../_components/record-info";
import RecordNotes from "../../_components/record-notes";
import CustomerInvoice from "./customer-invoice";
import Payables from "./payables";

type SelectedCustomerProps = {
  first_name: string;
  last_name: string;
  id: string;
  role_Id: number;
  emoji: string;
  company: string;
  representative: string;
  contact: string;
  email: string;
  location: string;
  notes: string;
  invoiceData: {
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
  }[];
  auth?: {
    username: string;
  } | null;
  invoiceHistoryData: {
    invoices: any[]; // Replace 'any' with the correct type
  };
  clerkId: string;
  unpaidInvoices: any[]; // Replace with proper type
  unpaidSum: number;
  onPaymentSuccess: () => void;
  onRefundSuccess?: () => void;
};

const SelectedCustomer = ({
  first_name,
  last_name,
  id,
  role_Id,
  emoji,
  company,
  representative,
  contact,
  email,
  location,
  notes,
  invoiceData,
  // auth,
  // invoiceHistoryData,
  // clerkId,
  unpaidInvoices,
  unpaidSum,
  onPaymentSuccess,
  onRefundSuccess,
}: SelectedCustomerProps) => {
  // const [sum, setSum] = useState<number>();
  const router = useRouter();

  const handleEditCustomer = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/customers/edit-customer/${id}`);
  };

  return (
    <div className="flex w-full flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 !rounded-lg">
            <AvatarFallback className="!rounded-lg bg-black text-3xl text-slate-700">
              {emoji}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <p className="text-lg text-slate-700">{company}</p>
              {role_Id === 3 && (
                <p className="rounded-full bg-cyan-200 px-2 py-[3px] text-sm tracking-wide text-cyan-700">
                  Customer
                </p>
              )}
            </div>
            <p className="text-sm text-slate-400">{id}</p>
          </div>
        </div>
        <div onClick={handleEditCustomer} className="cursor-pointer">
          <Edit />
        </div>
      </div>

      <Separator className="mt-5 h-[1px] bg-slate-300" />

      <div className="mt-5 flex flex-col gap-3">
        <Payables
          sum={unpaidSum}
          unpaidInvoices={unpaidInvoices}
          emoji={emoji}
          company={company}
          onPaymentSuccess={onPaymentSuccess}
          onRefundSuccess={onRefundSuccess}
        />

        <RecordInfo
          icon={User2}
          recordType={"Representative"}
          info={representative}
        />
        <RecordInfo icon={Phone} recordType={"Contact"} info={contact} />
        <RecordInfo icon={Mail} recordType={"Email"} info={email} />
        <RecordInfo icon={MapPin} recordType={"Location"} info={location} />
        <RecordNotes notes={notes} />
      </div>

      <Separator className="mt-5 h-[1px] bg-slate-300" />

      <div className="mt-5">
        {/* //TODO: reflect invoice data based on selected customer */}
        <CustomerInvoice
          invoiceData={invoiceData}
          customerId={id}
          first_name={first_name}
          last_name={last_name}
          company={company}
        />
      </div>
    </div>
  );
};

export default SelectedCustomer;
