"use client";

import { Search, ListFilter } from "lucide-react";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

const InventorySearchAndButtonRouter = () => {
  const router = useRouter();
  return (
    <div className="relative flex items-center justify-between px-3">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="relative flex h-auto w-full max-w-md items-center gap-3">
          <Search className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 transform" />
          <Input placeholder="Search" className="bg-gray p-5 pl-10" />

          <div className="bg-gray-100 hover:bg-gray-300 rounded-md p-3 hover:cursor-pointer">
            <ListFilter />
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="bg-green p-5 font-bold"
              onClick={() => router.push("/admin/inventory/new-item")}
            >
              + New Item
            </Button>
          </DialogTrigger>
          {/*<DialogContent>*/}
          {/*  <DialogHeader className="items-center font-bold">*/}
          {/*    VERIFY IT'S YOU*/}
          {/*  </DialogHeader>*/}
          {/*  <div className="flex w-full flex-col gap-1">*/}
          {/*    <Label className="ml-3 text-gray-300">Password</Label>*/}
          {/*    <Input placeholder="enter password" className="p-7" />*/}
          {/*  </div>*/}
          {/*  <div className="flex w-full justify-center">*/}
          {/*    <Button*/}
          {/*      className="bg-green-400 p-7 text-black"*/}
          {/*      onClick={() => router.push("/admin/inventory/newItem")}*/}
          {/*    >*/}
          {/*      Continue*/}
          {/*    </Button>*/}
          {/*  </div>*/}
          {/*</DialogContent>*/}
        </Dialog>
      </div>
    </div>
  );
};

export default InventorySearchAndButtonRouter;
