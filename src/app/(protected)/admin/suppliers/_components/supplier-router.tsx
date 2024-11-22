"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "~/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

const NewSupplierRouter = () => {
  const router = useRouter();
  return (
    <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger>
            <ArrowLeft
              size={25}
              color="#FF7B7B"
              className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
            />
          </DialogTrigger>
          <DialogContent className="max-h- flex w-full max-w-lg flex-col p-10">
            <DialogHeader>
              <div className="flex w-full justify-center text-center text-xl">
                <span>
                  You have unsaved changes. Are you sure you want to leave this
                  page?
                </span>
              </div>
            </DialogHeader>

            <div className="flex w-full items-center justify-center gap-3">
              <Button
                size={"lg"}
                className="border-2 border-[#FF7B7B] bg-white p-6 text-lg font-bold text-[#FF7B7B]"
              >
                Cancel
              </Button>
              <Button
                size={"lg"}
                className="bg-[#FF7B7B] p-6 text-lg font-bold text-white"
                onClick={() => router.push("/admin/suppliers")}
              >
                Leave
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <span className="font-bold">NEW SUPPLIER</span>
        <span className="text-gray-400 ml-3 text-sm font-light">#12345</span>
      </div>
    </div>
  );
};

export default NewSupplierRouter;
