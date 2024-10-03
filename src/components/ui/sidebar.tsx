
"use client";

import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Raleway } from "next/font/google";
import { RxGear, RxInfoCircled, RxExit } from "react-icons/rx";
import { useRouter } from 'next/navigation'


import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import Company_Logo from "public/Company_Logo.svg";
import Dashboard_Logo from "public/icons/dashboard.svg";
import Invoice_Logo from "public/icons/invoice.svg";
import Suppliers_Logo from "public/icons/suppliers.svg";
import Customers_Logo from "public/icons/customers.svg";
import Inventory_Logo from "public/icons/inventory.svg";
import Staff_Logo from "public/icons/staff.svg";
import History_Logo from "public/icons/history.svg";
import Image from "next/image";

const ralewaye = Raleway({ subsets: ["latin"] });

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={` ${
        expanded ? "w-[16rem]" : "w-[7rem]"
      } bg-[#F0F1F4] p-5 transition-all duration-300 ${ralewaye.className} flex h-screen flex-col justify-between overflow-y-scroll`}
    >
      <section>
        <section className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Image
              src={Company_Logo}
              alt="Company Logo"
              width={30}
              height={30}
              className="min-w-[30px]"
            />
            {expanded && (
              <Label className="text-2xl font-extrabold text-red-500">
                Prince
              </Label>
            )}
          </div>
        </section>

        <section className="mt-5 flex flex-col gap-3">
          <div onClick={() => router.push("dashboard")}
            className={`flex items-center rounded-lg p-2 hover:bg-white hover:cursor-pointer ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Dashboard_Logo} alt="dashboard logo" />
            {expanded && <Label className="ml-2 hover:cursor-pointer">Dashboard</Label>}
          </div>

          <div onClick={()=> router.push("invoice")}
            className={`flex items-center rounded-lg p-2 hover:bg-white hover:cursor-pointer ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Invoice_Logo} alt="invoice logo" />
            {expanded && <Label className="ml-2 hover:cursor-pointer" >Invoice</Label>}
          </div>
        </section>

        <section className="mt-5 flex flex-col gap-3">
          {expanded && (
            <Label className="pb-5 pt-5 font-extralight text-gray-400">
              Records
            </Label>
          )}

          <div
              onClick={()=> router.push("suppliers")}
            className={`flex items-center rounded-lg p-2 hover:bg-white hover: cursor-pointer ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Suppliers_Logo} alt="suppliers logo" />
            {expanded && <Label className="ml-2 hover:cursor-pointer " >Suppliers</Label>}
          </div>

          <div
              onClick={()=> router.push("customer")}
            className={`flex items-center rounded-lg p-2 hover:bg-white hover:cursor-pointer ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Customers_Logo} alt="customers logo" />
            {expanded && <Label className="ml-2 hover:cursor-pointer">Customers</Label>}
          </div>

          <div
              onClick={()=> router.push("inventory")}
            className={`flex items-center rounded-lg p-2 hover:bg-white hover: cursor-pointer ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Inventory_Logo} alt="inventory logo" />
            {expanded && <Label className="ml-2 hover:cursor-pointer">Inventory</Label>}
          </div>

          <div
              onClick={()=> router.push("staff")}
            className={`flex items-center rounded-lg p-2 hover:bg-white hover: cursor-pointer ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Staff_Logo} alt="staff logo" />
            {expanded && <Label className="ml-2 hover:cursor-pointer">Staff</Label>}
          </div>

          <div
              onClick={()=> router.push("history")}
            className={`flex items-center rounded-lg p-2 hover:bg-white hover:cursor-pointer ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={History_Logo} alt="history logo" />
            {expanded && <Label className="ml-2 hover:cursor-pointer"  >History</Label>}
          </div>
        </section>
      </section>

      <section className="flex flex-col gap-3">
        {/*<div>onClick={() => router.push("admin/settings")}</div>*/}
        <div className="max-w-full rounded-lg bg-white p-3">
          <div className="flex flex-col gap-3 text-xl">
            <div
              className={`flex items-center gap-2 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white ${expanded ? "justify-start" : "justify-center"}`}
            >
              <RxGear className="text-xl" />
              {expanded && <Label className={"hover:cursor-pointer"}>Settings</Label>}
            </div>

            <div
              className={`flex items-center gap-2 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white ${expanded ? "justify-start" : "justify-center"}`}
            >
              <RxInfoCircled className="text-xl " />
              {expanded && <Label className={"hover:cursor-pointer"} >About</Label>}
            </div>

            <div
              className={`flex items-center gap-2 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white ${expanded ? "justify-start" : "justify-center"}`}
            >
              <RxExit className="text-xl" />
              {expanded && <Label className={"hover:cursor-pointer"}>Logout</Label>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-lg bg-white p-3">
          <Avatar>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="profile avatar"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="ml-3 flex flex-col">
              <Label className="font-bold">John Doe</Label>
              <Label className="font-extralight">Admin</Label>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
