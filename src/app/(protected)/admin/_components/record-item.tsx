import React from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import Favorite from "./favorite";
import MoreOptions from "./more-options";

type RecordItemProps = {
  id: string;
  name: string | null;
  onClick: () => void;
  isSelected: boolean;
};

const RecordItem: React.FC<RecordItemProps> = ({
  id,
  name,
  onClick,
  isSelected,
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
                👑
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <p className="text-slate-700">{name}</p>
              <p className="text-sm text-slate-400">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Favorite />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreOptions />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  View Activity
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:!bg-slate-200 focus:!bg-slate-200">
                  Edit Record
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red hover:!bg-rose-200 hover:!text-red focus:!bg-rose-200 focus:!text-red">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <Separator className="mt-1 h-[1px] w-full bg-slate-100" />
    </>
  );
};

export default RecordItem;
