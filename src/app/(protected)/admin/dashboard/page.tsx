"use client";

import { Bell, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "~/components/ui/dialog";
import { DashboardChart } from "./_components/dashboard-chart";
import ChartsContainer from "./_components/pie-chart-container";
import DashboardStockedInOut from "./_components/stock-in-out";

const AdminDashboard = () => {
  const session = useSession();

  return (
    <section
      className={`flex h-auto w-screen flex-col gap-3 overflow-y-scroll p-10`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <label className="text-4xl font-extrabold">
              Hello, {session.data?.user.firstName}
            </label>
            <Dialog>
              <DialogTrigger asChild>
                <Bell
                  size={20}
                  color="#F93C65"
                  className="transition-all hover:scale-125 hover:cursor-pointer"
                />
              </DialogTrigger>
              <DialogContent title="Notification" className="m-5 rounded-lg">
                <DialogHeader>
                  <div className="my-2 flex flex-row items-center gap-1">
                    <label>Notifications</label>
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

                      <X size={25} />
                    </div>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <label>Today is Thursday, October 10 2024</label>
        </div>

        <DashboardStockedInOut />
      </div>

      {/* <ChartsContainer /> */}

      <div className="flex w-full justify-center">
        <DashboardChart />
      </div>
    </section>
  );
};

export default AdminDashboard;
