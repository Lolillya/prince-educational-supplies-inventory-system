import React from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import Favorite from "./favorite";
import Delete from "./delete";

type RecordItemProps = {
  id: string;
  name: string | null;
  emoji: string;
  onClick: () => void;
  isSelected: boolean;
  recordType: string;
  onDelete: (id: string) => Promise<void>;
  onVerifyPassword: (password: string) => Promise<boolean>;
  userRole?: string;
  unpaidAmount?: number;
  hasUnpaidInvoices?: boolean;
  getLatestUnpaidBalance?: () => Promise<{
    amount: number;
    hasUnpaid: boolean;
  }>;
};

const RecordItem: React.FC<RecordItemProps> = ({
  id,
  emoji,
  name,
  onClick,
  isSelected,
  recordType,
  onDelete,
  onVerifyPassword,
  userRole,
  unpaidAmount = 0,
  hasUnpaidInvoices = false,
  getLatestUnpaidBalance,
}) => {
  return (
    <>
      <div
        onClick={onClick}
        className={`mt-1 h-auto w-full flex-grow-0 rounded-lg px-7 py-5 hover:cursor-pointer hover:bg-slate-50 ${isSelected ? "bg-slate-100 hover:!bg-slate-100" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-12 w-12 !rounded-lg">
              <AvatarFallback className="!rounded-lg bg-black text-xl text-slate-700">
                {emoji}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <p className="text-slate-700">{name}</p>
              <p className="text-sm text-slate-400">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Favorite />
            <Delete
              recordInfo={name}
              recordType={recordType}
              id={id}
              onDelete={onDelete}
              onVerifyPassword={onVerifyPassword}
              userRole={userRole}
              unpaidAmount={unpaidAmount}
              hasUnpaidInvoices={hasUnpaidInvoices}
              getLatestUnpaidBalance={getLatestUnpaidBalance}
            />
          </div>
        </div>
      </div>
      <Separator className="mt-1 h-[1px] w-full bg-slate-100" />
    </>
  );
};

export default RecordItem;
