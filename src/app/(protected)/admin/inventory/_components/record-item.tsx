import React from "react";
import { Separator } from "~/components/ui/separator";
import Delete from "../../_components/delete";
import Favorite from "../../_components/favorite";
type RecordItemProps = {
  id: string;
  inventoryNumber: string;
  name: string;
  stockLevel: string;
  onClick?: () => void;
  isSelected?: boolean;
  recordType: string;
  variantId: number; // Add variantId
  onDelete: (variantId: number) => void;
  onVerifyPassword: (password: string) => Promise<boolean>;
  userRole?: string;
};

const RecordItem: React.FC<RecordItemProps> = ({
  id,
  inventoryNumber,
  name,
  stockLevel,
  onClick,
  isSelected,
  recordType,
  variantId,
  onDelete,
  onVerifyPassword,
  userRole,
}) => {
  return (
    <>
      <div
        onClick={onClick}
        className={`mt-1 h-auto w-full flex-grow-0 rounded-lg px-7 py-5 hover:cursor-pointer hover:bg-slate-50 ${isSelected ? "bg-slate-100 hover:!bg-slate-100" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-7">
            <div
              className={`h-4 w-4 rounded-full ${
                stockLevel === "good"
                  ? "bg-emerald-300"
                  : stockLevel === "low"
                    ? "bg-amber-300"
                    : stockLevel === "very low"
                      ? "bg-rose-400"
                      : "bg-slate-300"
              }`}
            />
            <div className="flex flex-col gap-2">
              <p className="text-slate-700">{name}</p>
              <p className="text-sm text-slate-400">{inventoryNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Favorite />
            <Delete
              recordInfo={name}
              recordType={recordType}
              id={variantId.toString()}
              onDelete={(id) => onDelete(parseInt(id))}
              onVerifyPassword={onVerifyPassword}
              userRole={userRole}
            />
          </div>
        </div>
      </div>
      <Separator className="mt-1 h-[1px] w-full bg-slate-100" />
    </>
  );
};

export default RecordItem;
