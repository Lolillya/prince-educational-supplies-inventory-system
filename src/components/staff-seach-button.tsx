"use client";

import { Input } from "./ui/input";
import { RxMagnifyingGlass } from "react-icons/rx";
import { Button } from "./ui/button";
import Image from "next/image";
import Filter_Icon from "public/icons/filter-icon2.svg";
import { useRouter } from "next/navigation";

const StaffSearchAndButtonRouter = () => {
  const router = useRouter();
  return (
    <div className="relative flex items-center justify-between px-3">
      <div className="flex h-16 w-full items-center justify-between gap-3">
        <div className="relative flex h-auto w-full max-w-md gap-3">
          <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
          <Input placeholder="Search" className="bg-gray-100 p-5 pl-10" />

          <div className="rounded-md bg-gray-100 p-3 hover:cursor-pointer hover:bg-gray-300">
            <Image src={Filter_Icon} alt="filter icon" />
          </div>
        </div>

        <Button
          onClick={() => router.push("/admin/staff/new-employee")}
          className="bg-[#FF7B7B] p-5 font-bold"
        >
          + New Employee
        </Button>
      </div>
    </div>
  );
};

export default StaffSearchAndButtonRouter;
