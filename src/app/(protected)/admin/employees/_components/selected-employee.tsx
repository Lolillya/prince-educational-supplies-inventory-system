import { Mail, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import Edit from "../../_components/edit";
import RecordInfo from "../../_components/record-info";
import RecordNotes from "../../_components/record-notes";
import AccountRecovery from "./account-recovery";
import EmployeeActivity from "./employee-activity";

type SelectedEmployeeProps = {
  id: string;
  role_Id: number;
  emoji: string;
  name: string | undefined | null;
  contact?: string | undefined | null;
  email?: string | undefined | null;
  location?: string | undefined | null;
  notes?: string | undefined | null;
  activityData?: {
    restocks: any[];
    invoices: any[];
  };
  auth?: {
    username: string;
  } | null;
  clerkId: string;
};

const SelectedEmployee = ({
  id,
  name,
  contact,
  email,
  location,
  notes,
  role_Id,
  emoji,
  activityData,
  auth,
  clerkId,
}: SelectedEmployeeProps) => {
  const router = useRouter();

  const handleEditEmployee = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/employees/edit-employee/${id}`);
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
            <div className="flex items-center gap-3">
              <p className="text-lg text-slate-700">{name}</p>
              {/* //TODO: reflect admin status */}
              <p
                className={`rounded-full px-2 py-[3px] text-sm tracking-wide ${
                  role_Id === 1
                    ? "bg-rose-200 text-rose-700"
                    : "bg-emerald-200 text-emerald-700"
                }`}
              >
                {role_Id === 1 ? "admin" : "employee"}
              </p>
            </div>
            <p className="text-sm text-slate-400">{id}</p>
          </div>
        </div>
        <div onClick={handleEditEmployee} className="cursor-pointer">
          <Edit />
        </div>
      </div>

      <Separator className="mt-5 h-[1px] bg-slate-300" />

      <div className="mt-5 flex flex-col gap-3">
        <RecordInfo icon={Phone} recordType={"Contact"} info={contact} />
        <RecordInfo icon={Mail} recordType={"Email"} info={email} />
        <RecordInfo icon={MapPin} recordType={"Location"} info={location} />
        <RecordNotes notes={notes} />
        <AccountRecovery username={auth?.username} personalDetailsId={id} />
      </div>

      <Separator className="mt-5 h-[1px] bg-slate-300" />

      <div className="mt-5">
        {/* //TODO: reflect restock data based on selected supplier */}
        <EmployeeActivity
          activityData={activityData ?? { restocks: [], invoices: [] }}
          clerkId={clerkId}
          employeeName={name}
        />
      </div>
    </div>
  );
};

export default SelectedEmployee;
