"use client";

import { Label } from "~/components/ui/label";
import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/input";
import { FaArrowLeft, FaEllipsisH } from "react-icons/fa";
import { RxMagnifyingGlass } from "react-icons/rx";
import { Button } from "~/components/ui/button";
import { Poppins } from "next/font/google";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const NewItemPage = () => {
  const router = useRouter();
  return (
    <section
      className={`h-auto w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-1">
          <FaArrowLeft
            size={25}
            color="#FF7B7B"
            className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
            onClick={() => router.push("/admin/inventory")}
          />
          <span className="font-bold">ADD STOCK</span>
          <span className="ml-3 text-sm font-light text-gray-400">#12345</span>
        </div>
      </div>

      <div className="flex h-full flex-col gap-5 px-52">
        <div className="flex h-full w-full flex-col justify-center gap-7">
          <div className="flex gap-2">
            <div className="w-full">
              <Label className="text-slate-400">
                Item <span className="text-red-600">*</span>
              </Label>
              <Input placeholder="Item" className="p-7" required />
            </div>
            <div className="w-full">
              <Label className="text-slate-400">
                Brand <span className="text-red-600">*</span>
              </Label>
              <Input placeholder="Brand" className="p-7" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-slate-400">
              Category <span className="text-red-600">*</span>
            </Label>
            <Input placeholder="Category" className="p-7" required />
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Textarea
                placeholder="About this customer..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              <span className="text-slate-400">Variants</span>{" "}
              <span className="text-red-600">*</span>
            </Label>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex w-full flex-col gap-1">
                    <span>Variant</span>
                    <span className="text-red-600">20 Boxes</span>
                  </div>

                  <div className="flex w-full flex-col justify-center gap-1">
                    <div className="flex w-40 flex-col">
                      <div className="flex w-full items-center justify-between gap-3">
                        <span>wholesale:</span>
                        <span>0000.00</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Special:</span>
                        <span>0000.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                      <FaEllipsisH color="gray" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex w-full justify-center">
            <Button className="border-none bg-white font-bold text-[#FF7B7B] shadow-none transition-all duration-300 hover:scale-125 hover:bg-transparent">
              + Add Variant
            </Button>
          </div>

          <div className="flex justify-end gap-3">
            <Button className="p-7 text-lg font-bold">Clear</Button>
            <Button className="p-7 text-lg font-bold">Save</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewItemPage;
