"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Poppins } from "next/font/google";
import { Input } from "~/components/ui/input";
import { RxMagnifyingGlass } from "react-icons/rx";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { DialogHeader } from "~/components/ui/dialog";

import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

import { FaEllipsisH } from "react-icons/fa";
import Image from "next/image";
import Filter_Icon from "public/icons/filter-icon2.svg";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const RestockPage = () => {
  const router = useRouter();
  return (
    <section
      className={`h-auto w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <div className="relative flex items-center justify-between">
        {/* <Label className="text-4xl font-bold">Restock</Label> */}
        <div className="flex h-16 items-center gap-3">
          <div className="relative flex h-auto w-full max-w-md gap-3">
            <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
            <Input placeholder="Search" className="bg-gray-100 p-5 pl-10" />

            <div className="rounded-md bg-gray-100 p-3 hover:cursor-pointer hover:bg-gray-300">
              <Image src={Filter_Icon} alt="filter icon" />
            </div>
          </div>
        </div>

        <Button
          size={"lg"}
          onClick={() => router.push("restock/add-stock")}
          className="font-boldbg-[#FF7B7B] border-[#FF7B7B] bg-[#FF7B7B] py-5 font-bold shadow-md hover:border hover:bg-white hover:text-[#FF7B7B]"
        >
          + Add Stock
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <Card>
          <CardContent className="flex w-full flex-col gap-3 rounded-lg p-5">
            <div className="flex items-center justify-between p-5">
              <div className="flex w-full flex-col">
                <span>#1233478 - September 20, 2024</span>
                <div className="flex items-center gap-1">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-3">
                  <span>Added Stock</span>
                  <span>500</span>
                </div>

                <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                  <FaEllipsisH color="gray" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#F0F1F4] p-5">
              <div className="flex w-full flex-col gap-3">
                <span>#1233478 - September 20, 2024</span>
                <span>Units</span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-3">
                  <span>Added Items</span>
                  <span>250</span>
                </div>

                <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                  <FaEllipsisH color="gray" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#F0F1F4] p-5">
              <div className="flex w-full flex-col gap-3">
                <span>#1233478 - September 20, 2024</span>
                <span>Units</span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-3">
                  <span>Added Items</span>
                  <span>250</span>
                </div>

                <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                  <FaEllipsisH color="gray" />
                </div>
              </div>
            </div>

            <div className="flex w-full justify-center p-5">
              <Button size={"lg"}>View All</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex w-full flex-col gap-3 rounded-lg p-5">
            <div className="flex items-center justify-between p-5">
              <div className="flex w-full flex-col">
                <span>#1233478 - September 20, 2024</span>
                <div className="flex items-center gap-1">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-3">
                  <span>Added Stock</span>
                  <span>500</span>
                </div>

                <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                  <FaEllipsisH color="gray" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#F0F1F4] p-5">
              <div className="flex w-full flex-col gap-3">
                <span>#1233478 - September 20, 2024</span>
                <span>Units</span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-3">
                  <span>Added Items</span>
                  <span>250</span>
                </div>

                <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                  <FaEllipsisH color="gray" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#F0F1F4] p-5">
              <div className="flex w-full flex-col gap-3">
                <span>#1233478 - September 20, 2024</span>
                <span>Units</span>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-3">
                  <span>Added Items</span>
                  <span>250</span>
                </div>

                <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                  <FaEllipsisH color="gray" />
                </div>
              </div>
            </div>

            <div className="flex w-full justify-center p-5">
              <Button size={"lg"}>View All</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RestockPage;
