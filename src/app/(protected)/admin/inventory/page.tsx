"use client"; // Add this line to make it a Client Component

import { Poppins } from "next/font/google";
import { Input } from "~/components/ui/input";
import { RxMagnifyingGlass } from "react-icons/rx";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

import Filter_Icon from "public/icons/filter-icon2.svg";
import Image from "next/image";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { FaAngleDown, FaEllipsisH, FaPen, FaAngleUp } from "react-icons/fa";
import { useState } from "react";
import { inventoryItems } from "~/server/db/inventoryData";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "~/components/ui/dialog";
import {Textarea} from "~/components/ui/textarea"; // Import the inventory data

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const InventoryPage = () => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  return (
      <section
          className={`h-auto w-screen p-5 ${poppins.className} m-10 mb-0 flex flex-col gap-3 overflow-y-scroll`}
      >
        <div className="relative flex items-center justify-between">
          <Label className="text-4xl font-bold">Inventory</Label>
          <div className="flex h-16 items-center gap-3">
            <div className="relative flex h-auto w-full max-w-md gap-3">
              <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
              <Input placeholder="Search" className="bg-gray-100 p-5 pl-10" />

              <div className="rounded-md bg-gray-100 p-3 hover:cursor-pointer hover:bg-gray-300">
                <Image src={Filter_Icon} alt="filter icon" />
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>

                <Button className="border-2 border-[#FF7B7B] bg-white p-5 font-bold text-[#FF7B7B]">
                  + New Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-5xl gap-5 p-10">
                <DialogHeader>
                  <DialogTitle className="p-3 text-2xl font-bold">
                    EDIT SUPPLIER
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-1">
                  <Label>
                    Customer <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Customer Name" className="p-5" required />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>
                    Business <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Business Name" className="p-5" required />
                </div>

                <div className="flex gap-3">
                  <div className="flex w-full flex-col gap-1">
                    <Label>
                      Business <span className="text-red-600">*</span>
                    </Label>
                    <Input placeholder="Business Name" className="p-5" required />
                  </div>

                  <div className="flex w-full flex-col gap-1">
                    <Label>
                      Email <span className="text-red-600">*</span>
                    </Label>
                    <Input placeholder="Email" className="p-5" required />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label>
                    Address <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Address" className="p-5" required />
                </div>

                <div>
                  <Textarea
                      placeholder="About this supplier..."
                      rows={4}
                      className="resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button>Clear</Button>
                  <Button>Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#FF7B7B] p-5 font-bold">
                  + New Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-5xl gap-5 p-10">
                <DialogHeader>
                  <DialogTitle className="p-3 text-2xl font-bold">
                    EDIT SUPPLIER
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-1">
                  <Label>
                    Customer <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Customer Name" className="p-5" required />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>
                    Business <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Business Name" className="p-5" required />
                </div>

                <div className="flex gap-3">
                  <div className="flex w-full flex-col gap-1">
                    <Label>
                      Business <span className="text-red-600">*</span>
                    </Label>
                    <Input placeholder="Business Name" className="p-5" required />
                  </div>

                  <div className="flex w-full flex-col gap-1">
                    <Label>
                      Email <span className="text-red-600">*</span>
                    </Label>
                    <Input placeholder="Email" className="p-5" required />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label>
                    Address <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Address" className="p-5" required />
                </div>

                <div>
                  <Textarea
                      placeholder="About this supplier..."
                      rows={4}
                      className="resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button>Clear</Button>
                  <Button>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {inventoryItems.map((item) => (
            <Card key={item.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <Label>{item.brand}</Label>
                      <Label> - </Label>
                      <Label>{item.item}</Label>
                      <Badge className="bg-blue-400 font-light">{item.category}</Badge>
                    </div>

                    <div className="flex gap-3">
                      <Label>{item.variants} variants</Label>
                      <Label className={`font-bold text-${item.stockStatus}`}>
                        {item.stock} in Stock
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                    <FaEllipsisH color="gray" />
                  </div>

                  <div
                      className="flex items-center justify-center rounded-md border-2 p-3 cursor-pointer"
                      onClick={() => toggleExpand(item.id)}
                  >
                    {expandedCardId === item.id ? (
                        <FaAngleUp color="gray" />
                    ) : (
                        <FaAngleDown color="gray" />
                    )}
                  </div>
                </div>
              </div>

              {expandedCardId === item.id && (
                  <div className="mt-5">
                    <Label className="font-bold">Notes</Label>
                    <p>{item.notes}</p>
                  </div>
              )}
            </Card>
        ))}
      </section>
  );
};

export default InventoryPage;
