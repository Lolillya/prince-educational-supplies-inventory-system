"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog-transparent";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

const NewItem = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section className="flex w-full flex-col gap-3 p-10">
      <div className="border-b-100 relative flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Dialog onOpenChange={setIsOpen} open={isOpen}>
            <DialogTrigger asChild>
              <ArrowLeft
                size={25}
                color="#FF7B7B"
                className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="max-h- flex w-full max-w-lg flex-col p-10">
              <DialogTitle className="text-center">Confirm</DialogTitle>
              <DialogHeader>
                <div className="flex w-full justify-center text-center text-xl">
                  <span>
                    You have unsaved changes. Are you sure you want to leave
                    this page?
                  </span>
                </div>
              </DialogHeader>

              <div className="flex w-full items-center justify-center gap-3">
                <Button
                  size={"lg"}
                  className="border-2 border-green bg-white p-6 text-lg font-bold text-green"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size={"lg"}
                  className="bg-green p-6 text-lg font-bold text-white"
                  onClick={() => router.push("/admin/inventory")}
                >
                  Leave
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <span className="font-bold">NEW ITEM</span>
          <span className="ml-3 text-sm font-light text-textGray">#123456</span>
        </div>
      </div>
      <div className="flex flex-col gap-10 p-10">
        <div className="flex justify-between gap-3">
          <div className="w-full">
            <Label className="text-textGray">Item *</Label>
            <Input />
          </div>
          <div className="w-full">
            <Label className="text-textGray">Brand *</Label>
            <Input />
          </div>

          <div className="w-full">
            <Label className="text-textGray">Category</Label>
            <Input />
          </div>
        </div>

        <div>
          <Textarea
            className="bg-gray"
            placeholder="About this customer..."
            rows={5}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label>Variants *</Label>
          <Card className="flex flex-row items-center justify-between gap-3 bg-gray p-3">
            <div className="w-full rounded-lg bg-white p-3">
              <Label>Variant</Label>
            </div>

            <div className="flex w-full items-center rounded-lg bg-white p-3">
              <div className="h-2 w-2 rounded-full bg-orange-300"></div>
              <Label className="ml-5">1000.00</Label>
            </div>

            <div className="flex w-full items-center rounded-lg bg-white p-3">
              <div className="h-2 w-2 rounded-full bg-red"></div>
              <Label className="ml-5">1000.00</Label>
            </div>

            <div>
              <X
                color="gray"
                className="transition duration-300 hover:scale-110 hover:cursor-pointer"
              />
            </div>
          </Card>

          <Card className="flex flex-row items-center justify-between gap-3 bg-gray p-3">
            <div className="w-full rounded-lg bg-white p-3">
              <Label>Variant</Label>
            </div>

            <div className="flex w-full items-center rounded-lg bg-white p-3">
              <div className="h-2 w-2 rounded-full bg-orange-300"></div>
              <Label className="ml-5">1000.00</Label>
            </div>

            <div className="flex w-full items-center rounded-lg bg-white p-3">
              <div className="h-2 w-2 rounded-full bg-red"></div>
              <Label className="ml-5">1000.00</Label>
            </div>

            <div>
              <Plus
                color="gray"
                className="transition duration-300 hover:scale-110 hover:cursor-pointer"
              />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NewItem;
