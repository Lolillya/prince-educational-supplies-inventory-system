import { Mail, MapPin, PhilippinePeso, Phone, User2 } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import RecordInfo from "../../_components/record-info";
import RecordNotes from "../../_components/record-notes";
import EditRecord from "./edit-record";
import Payables from "./payables";
import CustomerInvoice from "./customer-invoice";
import { useEffect, useState } from "react";

type SelectedCustomerProps = {
  first_name: string;
  last_name: string;
  id: string;
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
};

const SelectedCustomer = ({
  first_name,
  last_name,
  id,
  company,
  representative,
  contact,
  email,
  location,
  notes,
  invoiceData,
}: SelectedCustomerProps) => {
  const [sum, setSum] = useState<number>();

  return (
    <div className="flex w-full flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Avatar className="h-16 w-16 !rounded-lg">
            <AvatarFallback className="!rounded-lg bg-black text-3xl text-slate-700">
              👑
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <p className="text-lg text-slate-700">{company}</p>
            <p className="text-sm text-slate-400">{id}</p>
          </div>
        </div>
        <EditRecord />
      </div>

      <Separator className="mt-5 h-[1px] bg-slate-300" />

      <div className="mt-5 flex flex-col gap-3">
        <Payables
          sum={5000}
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
          first_name={first_name}
          last_name={last_name}
        />
      </div>
    </div>
  );
};

export default SelectedCustomer;
