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
      className={`bg-[#F0F1F4] p-5 transition-all duration-300 ${ralewaye.className} group z-10 flex h-screen w-[16rem] flex-col justify-between overflow-y-scroll`}
    >
      <section>
        <section className="mb-10 flex items-center justify-center">
          <div className="flex w-full items-center justify-start gap-3 px-2 hover:cursor-pointer">
            <Image
              src={Company_Logo}
              alt="Company Logo"
              width={30}
              height={30}
              className="min-w-[30px]"
            />

            <Label className="text-red-500 w-fit overflow-hidden text-2xl font-extrabold transition-all duration-300">
              Prince
            </Label>
          </div>
        </section>

        <section className="my-3 flex flex-col gap-3">
          {Object.entries(sidebarContent.main).map(([key, value]) => (
            <div
              key={key}
              onClick={() => router.push(value.redirect)}
              className={`flex items-center justify-start rounded-lg p-3 hover:cursor-pointer hover:bg-white`}
            >
              {value.icon}
              <Label className="ml-2 block hover:cursor-pointer">
                {value.text}
              </Label>
            </div>
          ))}
        </section>

        <section className="my-3 flex flex-col gap-3">
          <Label className="text-gray-400 block w-full overflow-x-hidden font-extralight">
            Records
          </Label>

          {Object.entries(sidebarContent.records).map(([key, value]) => (
            <div
              key={key}
              onClick={() => router.push(value.redirect)}
              className={`flex cursor-pointer items-center justify-start rounded-lg p-3 hover:bg-white`}
            >
              {value.icon}
              <Label className="ml-2 block w-fit overflow-hidden transition-all duration-300 hover:cursor-pointer">
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
                className="m-0 flex items-center gap-2 rounded-lg p-3 transition-all duration-300 hover:cursor-pointer hover:bg-green hover:text-white group-hover:justify-start"
              >
                {value.icon}
                <Label className="w-fit opacity-100 transition-all duration-300 ease-in-out hover:cursor-pointer">
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
        <div className="flex items-center justify-evenly rounded-lg bg-white p-3">
          <Avatar>
            <AvatarImage src="" alt="profile avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <div className="ml-3 flex w-fit flex-col transition-all duration-300">
            <Label className="font-bold">John Doe</Label>
            <Label className="font-extralight">Admin</Label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
