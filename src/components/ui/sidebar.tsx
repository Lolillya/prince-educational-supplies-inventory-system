"use client";

import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Raleway } from "next/font/google";
import { RxGear, RxInfoCircled, RxExit } from "react-icons/rx";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import Company_Logo from "public/Company_Logo.svg";
import Image from "next/image";
import { logout } from "~/app/actions/actions";

const ralewaye = Raleway({ subsets: ["latin"] });

const Sidebar = () => {
  const router = useRouter();

  const sidebarContent = {
    main: {
      dashboard: {
        text: "Dashboard",
        redirect: "/admin/dashboard",
        icon: "/icons/dashboard.svg",
      },
      restock: {
        text: "Restock",
        redirect: "/admin/restock",
        icon: "/icons/restock-icon.svg",
      },
      invoice: {
        text: "Invoice",
        redirect: "/admin/invoice",
        icon: "/icons/invoice.svg",
      },
    },
    records: {
      suppliers: {
        text: "Suppliers",
        redirect: "/admin/suppliers",
        icon: "/icons/suppliers.svg",
      },
      customers: {
        text: "Customers",
        redirect: "/admin/customer",
        icon: "/icons/customers.svg",
      },
      inventory: {
        text: "Inventory",
        redirect: "/admin/inventory",
        icon: "/icons/inventory.svg",
      },
      staff: {
        text: "Staff",
        redirect: "/admin/staff",
        icon: "/icons/staff.svg",
      },
      history: {
        text: "History",
        redirect: "/admin/history",
        icon: "/icons/history.svg",
      },
    },
    controls: {
      settings: {
        text: "Settings",
        redirect: "",
        icon: <RxGear width={30} height={30} />,
      },
      about: {
        text: "About",
        redirect: "",
        icon: <RxInfoCircled width={30} height={30} />,
      },
      logout: {
        text: "Logout",
        redirect: "",
        icon: <RxExit width={30} height={30} />,
      },
    },
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`w-[7rem] bg-[#F0F1F4] p-5 transition-all duration-300 ${ralewaye.className} group z-10 flex h-screen flex-col justify-between overflow-y-scroll hover:w-[16rem]`}
    >
      <section>
        <section className="mb-10 flex items-center justify-center">
          <div className="flex w-full items-center justify-center gap-3 px-2 hover:cursor-pointer group-hover:justify-start">
            <Image
              src={Company_Logo}
              alt="Company Logo"
              width={30}
              height={30}
              className="min-w-[30px]"
            />

            <Label className="hidden w-0 overflow-hidden text-2xl font-extrabold text-red-500 transition-all duration-300 group-hover:block group-hover:w-fit">
              Prince
            </Label>
          </div>
        </section>

        <section className="my-3 flex flex-col gap-3">
          {Object.entries(sidebarContent.main).map(([key, value]) => (
            <div
              key={key}
              onClick={() => router.push(value.redirect)}
              className={`flex items-center justify-center rounded-lg p-2 hover:cursor-pointer hover:bg-white group-hover:justify-start`}
            >
              <Image
                src={value.icon}
                alt={`${value.redirect} logo`}
                width={30}
                height={30}
              />

              <Label className="ml-2 hidden hover:cursor-pointer group-hover:block">
                {value.text}
              </Label>
            </div>
          ))}
        </section>

        <section className="my-3 flex flex-col gap-3">
          <Label className="hidden w-0 overflow-x-hidden font-extralight text-gray-400 group-hover:block group-hover:w-full">
            Records
          </Label>

          {Object.entries(sidebarContent.records).map(([key, value]) => (
            <div
              key={key}
              onClick={() => router.push(value.redirect)}
              className={`hover: flex cursor-pointer items-center justify-center rounded-lg p-2 hover:bg-white group-hover:justify-start`}
            >
              <Image
                src={value.icon}
                alt={`${value.redirect} logo`}
                width={30}
                height={30}
              />

              <Label className="ml-2 hidden w-0 overflow-hidden transition-all duration-300 hover:cursor-pointer group-hover:block group-hover:w-fit">
                {value.text}
              </Label>
            </div>
          ))}
        </section>
      </section>

      <section className="flex flex-col gap-3">
        <div className="max-w-full rounded-lg bg-white p-3">
          <div className="flex flex-col justify-center gap-3 text-xl">
            {Object.entries(sidebarContent.controls).map(([key, value]) => (
              <div
                key={key}
                className={`m-0 flex items-center gap-2 rounded-lg p-3 transition-all duration-300 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white group-hover:justify-start`}
              >
                {value.icon}

                <Label
                  className={
                    "hidden w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:block group-hover:w-fit group-hover:opacity-100"
                  }
                >
                  {value.text}
                </Label>
              </div>
            ))}
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

          <div className="gorup ml-3 hidden w-0 flex-col overflow-x-hidden transition-all duration-300 group-hover:flex group-hover:w-fit">
            <Label className="font-bold">John Doe</Label>
            <Label className="font-extralight">Admin</Label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
