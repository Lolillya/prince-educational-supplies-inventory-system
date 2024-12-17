"use client";

import { Search, ListFilter, FileDown, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Select, SelectTrigger } from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { Separator } from "~/components/ui/separator";

const InventorySearchAndButtonRouter = () => {
  const [isPricelistOpen, setIsPricelistOpen] = useState(false);
  const [isMasterlistOpen, setIsMasterlistOpen] = useState(false);
  const [isStocklistOpen, setIsStocklistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  return (
    <div className="relative flex items-center justify-between px-3">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="relative flex h-auto w-full max-w-md items-center gap-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-textGray" />
          <Input
            placeholder="Search"
            className="bg-gray p-6 pl-10 placeholder:text-textGray"
          />

          <div className="rounded-md bg-gray p-3 transition duration-300 hover:scale-110 hover:cursor-pointer">
            <ListFilter color="gray" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="transition duration-300 hover:scale-110">
              <div className="rounded-lg bg-gray p-4">
                <FileDown color="gray" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 w-32 rounded-lg bg-gray p-3">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setIsPricelistOpen(true)}>
                  Pricelist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsMasterlistOpen(true)}>
                  Masterlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsStocklistOpen(true)}>
                  Stocklist
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog onOpenChange={setIsPricelistOpen} open={isPricelistOpen}>
            <DialogContent className="flex h-full max-h-[80%] max-w-3xl flex-col">
              <div className="flex items-center gap-3">
                <DialogTitle>ITEM PRICE LIST</DialogTitle>
                <Label className="text-textGray">MM/DD/YY</Label>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex w-fit gap-3">
                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>All Items</Label>
                    </SelectTrigger>
                  </Select>

                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>Select Items</Label>
                    </SelectTrigger>
                  </Select>

                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>Category</Label>
                    </SelectTrigger>
                  </Select>
                </div>

                <Separator orientation="horizontal" />

                <div className="flex flex-col gap-3">
                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={setIsMasterlistOpen} open={isMasterlistOpen}>
            <DialogContent className="flex h-full max-h-[80%] max-w-3xl flex-col">
              <div className="flex items-center gap-3">
                <DialogTitle>ITEM MASTERLIST</DialogTitle>
                <Label className="text-textGray">MM/DD/YY</Label>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex w-fit gap-3">
                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>All Items</Label>
                    </SelectTrigger>
                  </Select>

                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>Select Items</Label>
                    </SelectTrigger>
                  </Select>

                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>Category</Label>
                    </SelectTrigger>
                  </Select>
                </div>

                <Separator orientation="horizontal" />

                <div className="flex flex-col gap-3">
                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={setIsStocklistOpen} open={isStocklistOpen}>
            <DialogContent className="flex h-full max-h-[80%] max-w-3xl flex-col">
              <div className="flex items-center gap-3">
                <DialogTitle>ITEM STOCKLIST</DialogTitle>
                <Label className="text-textGray">MM/DD/YY</Label>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex w-fit gap-3">
                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>All Items</Label>
                    </SelectTrigger>
                  </Select>

                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>Select Items</Label>
                    </SelectTrigger>
                  </Select>

                  <Select>
                    <SelectTrigger className="border-none">
                      <Label>Category</Label>
                    </SelectTrigger>
                  </Select>
                </div>

                <Separator orientation="horizontal" />

                <div className="flex flex-col gap-3">
                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between rounded-lg bg-gray p-3">
                    <div className="flex items-center gap-3">
                      <Label>ITEM</Label>
                      <Label>BRAND</Label>
                      <Label>VARIANT</Label>
                    </div>

                    <div>
                      <X color="gray" />
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            className="bg-green p-5 font-bold"
            onClick={() => router.push("/admin/inventory/new-item")}
          >
            + New Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventorySearchAndButtonRouter;
