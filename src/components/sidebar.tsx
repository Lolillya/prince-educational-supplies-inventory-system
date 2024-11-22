"use client";

import { useState } from "react";
import { Raleway } from "next/font/google";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Company_Logo from "public/Company_Logo.svg";
import Image from "next/image";
import { logout } from "~/app/actions/actions";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Settings,
  Info,
  LogOut,
  ChartPie,
  Archive,
  NotebookText,
  Truck,
  Users,
  Package2,
  IdCard,
  History,
} from "lucide-react";

const ralewaye = Raleway({ subsets: ["latin"] });

const Sidebar = () => {
  const router = useRouter();

  // Moved the useState call inside the component
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sidebarContent = {
    main: {
      dashboard: {
        text: "Dashboard",
        redirect: "/admin/dashboard",
        icon: <ChartPie width={20} height={20} />,
      },
      restock: {
        text: "Restock",
        redirect: "/admin/restock",
        icon: <Archive width={20} height={20} />,
      },
      invoice: {
        text: "Invoice",
        redirect: "/admin/invoice",
        icon: <NotebookText width={20} height={20} />,
      },
    },
    records: {
      suppliers: {
        text: "Suppliers",
        redirect: "/admin/suppliers",
        icon: <Truck width={20} height={20} />,
      },
      customers: {
        text: "Customers",
        redirect: "/admin/customers",
        icon: <Users width={20} height={20} />,
      },
      inventory: {
        text: "Inventory",
        redirect: "/admin/inventory",
        icon: <Package2 width={20} height={20} />,
      },
      employees: {
        text: "Employees",
        redirect: "/admin/employees",
        icon: <IdCard width={20} height={20} />,
      },
      history: {
        text: "History",
        redirect: "/admin/history",
        icon: <History width={20} height={20} />,
      },
    },
    controls: {
      settings: {
        text: "Settings",
        redirect: "",
        icon: <Settings width={20} height={20} />,
      },
      about: {
        text: "About",
        redirect: "",
        icon: <Info width={20} height={20} />,
      },
      logout: {
        text: "Logout",
        redirect: "",
        icon: <LogOut width={20} height={20} />,
      },
    },
  };

  const handleLogout = () => {
    logout();
  };

  const handleLogoutClick = () => {
    setIsDialogOpen(true); // Open confirmation dialog
  };

  const confirmLogout = async () => {
    await logout(); // Trigger logout action
    setIsDialogOpen(false); // Close dialog after logout
  };

  const cancelLogout = () => {
    setIsDialogOpen(false); // Close dialog without logging out
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
              {value.icon}
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
              {value.icon}
              <Label className="ml-2 hidden w-0 overflow-hidden transition-all duration-300 hover:cursor-pointer group-hover:block group-hover:w-fit">
                {value.text}
              </Label>
            </div>
          ))}
        </section>
      </section>

      <section className="flex flex-col gap-3">
        {/* Controls Section */}
        <div className="max-w-full rounded-lg bg-white p-3">
          <div className="flex flex-col justify-center gap-3 text-xl">
            {Object.entries(sidebarContent.controls).map(([key, value]) => (
              <div
                key={key}
                onClick={
                  key === "logout"
                    ? handleLogoutClick
                    : () => router.push(value.redirect)
                }
                className="m-0 flex items-center gap-2 rounded-lg p-3 transition-all duration-300 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white group-hover:justify-start"
              >
                {value.icon}
                <Label className="hidden w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:block group-hover:w-fit group-hover:opacity-100">
                  {value.text}
                </Label>
              </div>
            ))}

            {/* Logout Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>Confirm Logout</DialogHeader>
                <p>Are you sure you want to log out?</p>
                <DialogFooter>
                  <button onClick={confirmLogout}>Yes</button>
                  <button onClick={cancelLogout}>No</button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex items-center justify-center rounded-lg bg-white p-3">
          <Avatar>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="profile avatar"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <div className="group ml-3 hidden w-0 flex-col overflow-x-hidden transition-all duration-300 group-hover:flex group-hover:w-fit">
            <Label className="font-bold">John Doe</Label>
            <Label className="font-extralight">Admin</Label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
