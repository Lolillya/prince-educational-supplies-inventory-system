"use client";

import { useState } from "react";
import { Poppins } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Company_Logo from "public/Company_Logo.svg";
import Image from "next/image";
import { logout } from "~/app/actions/actions";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Moved the useState call inside the component
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sidebarContent = {
    main: {
      dashboard: {
        text: "Dashboard",
        redirect: "/admin/dashboard",
        icon: <ChartPie width={24} height={24} />,
      },
      restock: {
        text: "Restock",
        redirect: "/admin/restock",
        icon: <Archive width={24} height={24} />,
      },
      invoice: {
        text: "Invoice",
        redirect: "/admin/invoice",
        icon: <NotebookText width={24} height={24} />,
      },
    },
    records: {
      suppliers: {
        text: "Suppliers",
        redirect: "/admin/suppliers",
        icon: <Truck width={24} height={24} />,
      },
      customers: {
        text: "Customers",
        redirect: "/admin/customers",
        icon: <Users width={24} height={24} />,
      },
      inventory: {
        text: "Inventory",
        redirect: "/admin/inventory",
        icon: <Package2 width={24} height={24} />,
      },
      employees: {
        text: "Employees",
        redirect: "/admin/employees",
        icon: <IdCard width={24} height={24} />,
      },
      history: {
        text: "History",
        redirect: "/admin/history",
        icon: <History width={24} height={24} />,
      },
    },
    controls: {
      settings: {
        text: "Settings",
        redirect: "",
        icon: <Settings width={24} height={24} />,
      },
      about: {
        text: "About",
        redirect: "",
        icon: <Info width={24} height={24} />,
      },
      logout: {
        text: "Logout",
        redirect: "",
        icon: <LogOut width={24} height={24} />,
      },
    },
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
    <div className={`bg-slate-100 py-10 px-5 transition-all duration-300 ${poppins.className} flex h-screen w-1/6 flex-col justify-between`}>
      <section>
        <div className="flex items-center justify-center">
          <div className="flex w-full items-center justify-start gap-4 pl-2 hover:cursor-pointer">
            <Image
              src={Company_Logo}
              alt="Company Logo"
              className="min-w-[30px] w-8 h-8"
            />
            <Label className="text-slate-700 w-fit overflow-hidden text-3xl font-extrabold transition-all duration-300">
              Prince
            </Label>
          </div>
        </div>

        <ScrollArea className="" >
          <>
            <div className="mt-6 flex flex-col gap-2">
              {Object.entries(sidebarContent.main).map(([key, value]) => (
                <div
                  key={key}
                  onClick={() => router.push(value.redirect)}
                  className={`flex items-center justify-start rounded-lg p-3 hover:cursor-pointer hover:bg-white transition-colors duration-300 text-slate-600 
                ${pathname.startsWith(value.redirect) ? "bg-white text-slate-800" : ""}`}
                >
                  {value.icon}
                  <span className="pl-5 text-lg">
                    {value.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Label className="text-slate-500 pl-3 text-base mb-1">
                Records
              </Label>

              {Object.entries(sidebarContent.records).map(([key, value]) => (
                <div
                  key={key}
                  onClick={() => router.push(value.redirect)}
                  className={`flex items-center justify-start rounded-lg p-3 hover:cursor-pointer hover:bg-white transition-colors duration-300 text-slate-600 
                ${pathname.startsWith(value.redirect) ? "bg-white text-slate-800" : ""}`}
                >
                  {value.icon}
                  <span className="pl-5 text-lg">
                    {value.text}
                  </span>
                </div>
              ))}
            </div>
          </>
        </ScrollArea>
      </section>

      <section className="flex flex-col gap-3 ">
        {/* Controls Section */}
        <Popover>
          <PopoverTrigger>
            <div className="flex items-center gap-4 rounded-full bg-white p-3">
              <Avatar>
                <AvatarFallback className="bg-pink-200 text-slate-700">CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <p className="text-base font-bold text-slate-700">John Doe</p>
                <p className="text-sm font-extralight text-slate-500">Admin</p>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-1 p-2 shadow-none my-3 ml-3">

            {Object.entries(sidebarContent.controls).map(([key, value]) => (
              <div
                key={key}
                onClick={
                  key === "logout"
                    ? handleLogoutClick
                    : () => router.push(value.redirect)
                }
                className="flex items-center gap-4 rounded-lg py-2 px-4 transition-colors duration-300 hover:cursor-pointer text-slate-700 hover:bg-slate-100 "
              >
                {value.icon}
                <span className="text-base">
                  {value.text}
                </span>
              </div>
            ))}

            {/* Logout Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogTitle className="text-slate-700 items-center">Confirm Logout</DialogTitle>
                <p className="text-slate-700">Are you sure you want to log out?</p>
                <DialogFooter>
                  <Button
                    onClick={cancelLogout}
                    className="text-slate-700 hover:bg-slate-300"
                    variant={'secondary'}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmLogout}
                    className="bg-green hover:bg-green/80"
                  >
                    Logout
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </PopoverContent>
        </Popover>

      </section>
    </div>
  );
};

export default Sidebar;
