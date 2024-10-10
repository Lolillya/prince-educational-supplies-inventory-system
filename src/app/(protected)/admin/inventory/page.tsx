"use client";

import { Poppins } from "next/font/google";
import { Input } from "~/components/ui/input";
import { RxArrowLeft, RxMagnifyingGlass } from "react-icons/rx";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

import Filter_Icon from "public/icons/filter-icon2.svg";
import Image from "next/image";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { FaAngleDown, FaAngleUp, FaEllipsisH, FaPen } from "react-icons/fa";
import { useState } from "react";
import { inventoryItems } from "~/server/db/inventoryData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import variantsData from "~/server/db/variantsData";
import { SuppliersChart } from "~/components/suppliers-chard";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const InventoryPage = () => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleExpandClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toggleExpand(id);
  };

  const router = useRouter();

  return (
    <section
      className={`h-auto w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <div className="relative flex items-center justify-between">
        <div className="flex h-16 w-full items-center justify-between gap-3">
          <div className="relative flex h-auto w-full max-w-md gap-3">
            <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
            <Input placeholder="Search" className="bg-gray-100 p-5 pl-10" />

            <div className="rounded-md bg-gray-100 p-3 hover:cursor-pointer hover:bg-gray-300">
              <Image src={Filter_Icon} alt="filter icon" />
            </div>
          </div>

          <Button
            onClick={() => router.push("/admin/inventory/new-item")}
            className="bg-[#FF7B7B] p-5 font-bold"
          >
            + New Supplier
          </Button>
        </div>
      </div>

      <div className="relative flex h-full justify-between gap-3">
        <div className="flex w-full flex-col">
          <span>Records</span>
          <div className="flex flex-col gap-3">
            {inventoryItems.map((customer) => (
              <div className="flex items-center justify-between rounded-md px-7 py-5 hover:bg-gray-200">
                <div className="flex items-start gap-3">
                  <span>{customer.item}</span>
                  <span>{customer.brand}</span>
                  <span>{customer.id}</span>
                </div>

                <div>
                  <FaPen color="#989FB3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full w-full flex-col">
          <span>Details</span>
          <div className="flex h-full w-full flex-col rounded-lg bg-gray-200 p-5">
            <SuppliersChart />
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-5">
                <span className="font-bold">Josh Sevi Corp</span>
                <span>JS00001</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Sales Person</span>
                <span>Joshua Sevilla</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Conbtact Num</span>
                <span>09---------</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Email</span>
                <span>JoshuaSevilla@gmail.com</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Location</span>
                <span>Somewhere Somewhere</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-light text-gray-400">Notes</span>
                <span>Lorem Ipsum Dolor sit Amet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryPage;
