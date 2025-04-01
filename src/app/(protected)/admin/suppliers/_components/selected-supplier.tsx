import { Mail, MapPin, Phone, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import Edit from "../../_components/edit";
import RecordInfo from "../../_components/record-info";
import RecordNotes from "../../_components/record-notes";
import SupplierRestock from "./supplier-restock";

type SelectedSupplierProps = {
  id: string;
  role_Id: number;
  emoji: string;
  company: string | undefined | null;
  representative?: string | undefined | null;
  contact?: string | undefined | null;
  email?: string | undefined | null;
  location?: string | undefined | null;
  notes?: string | undefined | null;
  restockData?: {
    restocks: any[];
  };
  clerkId: string;
  auth:
    | {
        // Add appropriate type properties here
      }
    | null
    | undefined;
};

const SelectedSupplier = ({
  id,
  role_Id,
  emoji,
  company,
  representative,
  contact,
  email,
  location,
  notes,
  restockData,
  clerkId,
}: SelectedSupplierProps) => {
  const router = useRouter();

  const handleEditSupplier = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/suppliers/edit-supplier/${id}`);
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
              {role_Id === 4 && (
                <p className="rounded-full bg-cyan-200 px-2 py-[3px] text-sm tracking-wide text-cyan-700">
                  Supplier
                </p>
              )}
            </div>
            <p className="text-sm text-slate-400">{id}</p>
          </div>
        </div>
        <div onClick={handleEditSupplier} className="cursor-pointer">
          <Edit />
        </div>
      </div>

      <Separator className="mt-5 h-[1px] bg-slate-300" />

      <div className="mt-5 flex flex-col gap-3">
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

      <Separator className="bg-slate-300w mt-5 h-[1px]" />

      <div className="mt-5">
        {/* //TODO: reflect restock data based on selected supplier */}
        <SupplierRestock
          restockData={restockData?.restocks}
          clerkId={clerkId}
          company={company}
        />
      </div>
    </div>
  );
};

export default SelectedSupplier;
