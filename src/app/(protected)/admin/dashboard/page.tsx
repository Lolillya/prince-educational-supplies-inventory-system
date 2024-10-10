"use client";

import { Label } from "~/components/ui/label";
import { Poppins } from "next/font/google";
import { IoIosClose } from "react-icons/io";

import { DashboardChart } from "~/components/dashboard-chart";
import ChartsContainer from "~/components/pie-Chart-Container";
import { FaBell } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog-transparent";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import DashboardStockedInOut from "~/components/dashboard-stock-in-out";
import { useSession } from "next-auth/react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const AdminDashboard = () => {
  const session = useSession();

  console.log(session);

  return (
    <section
      className={`h-auto w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Label className="text-4xl font-extrabold">
              Hello, {session.data?.user.firstName}
            </Label>
            <Dialog>
              <DialogTrigger asChild>
                <FaBell
                  size={20}
                  color="#F93C65"
                  className="transition-all hover:scale-125 hover:cursor-pointer"
                />
              </DialogTrigger>
              <DialogContent className="m-5 rounded-lg">
                <DialogHeader>
                  <div className="my-2 flex flex-row items-center gap-1">
                    <Label>Notifications</Label>
                    <div className="mb-0.5 rounded-md bg-[#FFCCCC] p-0.5 px-1 text-xs text-[#FF7B7B]">
                      23
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-y">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>

                    <div className="flex w-full items-center justify-between gap-1 p-3">
                      <div>
                        <div className="flex gap-1">
                          <span className="font-bold">John Doe</span>
                          <span>made an edit to inventory</span>
                        </div>
                        <span className="text-slate-400">2 hours ago</span>
                      </div>

                      <IoIosClose size={25} />
                    </div>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <Label>Today is Tuesday, October 1 2024</Label>
        </div>

        <DashboardStockedInOut />
      </div>

      <ChartsContainer />

      <div className="flex w-full justify-center">
        <DashboardChart />
      </div>
    </section>
  );
};

export default AdminDashboard;
