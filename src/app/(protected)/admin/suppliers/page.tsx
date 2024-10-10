"use client"; // Add this line to make it a Client Component

import { Poppins } from "next/font/google";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { RxMagnifyingGlass } from "react-icons/rx";
import { Input } from "~/components/ui/input";
import { FaPen } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";

import { useState } from "react";
import { customers } from "~/server/db/customersData";

import Filter_Icon from "public/icons/filter-icon2.svg";
import Image from "next/image";
import { SuppliersChart } from "~/components/suppliers-chard";
import { useRouter } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const SuppliersPage = () => {
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const router = useRouter();
  return (
    <section
      className={`h-full w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
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
            onClick={() => router.push("/admin/suppliers/newSupplier")}
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
            {customers.map((customer) => (
              <div className="flex items-center justify-between rounded-md px-7 py-5 hover:bg-gray-200">
                <div className="flex items-start gap-3">
                  <span>{customer.name}</span>
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

      {/* {customers.map((customer) => (
        <Card key={customer.id} className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-5 rounded-md">
            <div className="w-full">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <Label>{customer.name}</Label>
                  </div>
                  <div className="flex">
                    <Label>{customer.company}</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center">
              <Separator orientation="vertical" className="h-16 w-[2px]" />
            </div>

            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center gap-3">
                <AiFillPhone />
                <Label>{customer.phone}</Label>
              </div>
              <div className="flex items-center gap-3">
                <AiFillMail />
                <Label>{customer.email}</Label>
              </div>
            </div>

            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-center rounded-md border-2 p-3 hover:cursor-pointer">
                    <FaPen color="gray" />
                  </div>
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
                    <Input
                      placeholder="Customer Name"
                      className="p-5"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label>
                      Business <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      placeholder="Business Name"
                      className="p-5"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Business <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        placeholder="Business Name"
                        className="p-5"
                        required
                      />
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

              <div
                className="flex items-center justify-center rounded-md border-2 p-3"
                onClick={() => toggleExpand(customer.id)}
              >
                {expandedCardId === customer.id ? (
                  <FaAngleUp color="gray" />
                ) : (
                  <FaAngleDown color="gray" />
                )}
              </div>
            </div>
          </div>

          {expandedCardId === customer.id && (
            <div className="flex p-3">
              <div className="flex w-full flex-col gap-5">
                <Label>Location</Label>
                <Label>{customer.location}</Label>
              </div>
              <div className="flex w-full flex-col gap-5">
                <Label>Notes</Label>
                <Label>{customer.notes}</Label>
              </div>
            </div>
          )}
        </Card>
      ))} */}
    </section>
  );
};

export default SuppliersPage;
