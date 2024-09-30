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

  return (
    <section
      className={`h-auto w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
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
                + New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-5xl gap-5 p-10">
              <DialogHeader>
                <DialogTitle className="p-3 text-2xl font-bold">
                  NEW ITEM
                </DialogTitle>
              </DialogHeader>
              <div className="flex gap-3">
                <div className="flex w-full flex-col gap-1">
                  <Label>
                    Brand <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Brand" className="p-5" required />
                </div>

                <div className="flex w-full flex-col gap-1">
                  <Label>
                    Item <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Item" className="p-5" required />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex w-full flex-col gap-1">
                  <Label>
                    Category <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Category" className="p-5" required />
                </div>

                <div className="flex w-full flex-col gap-1">
                  <Label>
                    Unit <span className="text-red-600">*</span>
                  </Label>
                  <Input placeholder="Unit" className="p-5" required />
                </div>
              </div>

              <div>
                <Textarea
                  placeholder="About this product..."
                  rows={4}
                  className="resize-none bg-gray-100"
                />
              </div>

              <div>
                <div>
                  <Label>Variants</Label>
                </div>

                <div className="relative rounded-lg border border-gray-300 bg-gray-100 p-8">
                  <div className="mb-6 flex gap-8 pr-12">
                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">
                        Description
                      </Label>
                      <Input
                        placeholder="Description"
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">Stock</Label>
                      <Input
                        placeholder="Stock"
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-8 pr-12">
                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">
                        Wholesale Price
                      </Label>
                      <Input
                        placeholder="0000.00"
                        className="rounded-lg border border-gray-300 bg-gray-200 p-4 shadow-sm"
                        required
                        disabled
                      />
                    </div>

                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">
                        Special Price
                      </Label>
                      <Input
                        placeholder="0000.00"
                        className="rounded-lg border border-gray-300 bg-gray-200 p-4 shadow-sm"
                        required
                        disabled
                      />
                    </div>
                  </div>

                  <button className="absolute right-8 top-1/2 -translate-y-1/2 transform text-2xl text-red-500 hover:text-red-700 focus:outline-none">
                    &times;
                  </button>
                </div>
              </div>
              <div>
                <Label>+ Add a Variant</Label>
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
                + Add to Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-5xl gap-5 p-10">
              <DialogHeader>
                <DialogTitle className="p-3 text-2xl font-bold">
                  ADD TO STOCK
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-1">
                <Label>
                  Supplier <span className="text-red-600">*</span>
                </Label>
                <Input placeholder="Supplier" className="p-5" required />
              </div>

              <div className="flex flex-col gap-1">
                <Label>
                  Items <span className="text-red-600">*</span>
                </Label>
                <Input placeholder="Search" className="p-5" required />
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative rounded-lg border border-gray-300 bg-gray-100 p-8">
                  <div className="mb-6 flex gap-8 pr-12">
                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">Item</Label>
                      <Input
                        placeholder="Item"
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6 flex gap-8 pr-12">
                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">
                        Description
                      </Label>
                      <Input
                        placeholder="Description"
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">Stock</Label>
                      <Input
                        placeholder="Stock"
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <button className="absolute right-8 top-1/2 -translate-y-1/2 transform text-2xl text-red-500 hover:text-red-700 focus:outline-none">
                    &times;
                  </button>
                </div>

                <div className="relative rounded-lg border border-gray-300 bg-gray-100 p-8">
                  <div className="mb-6 flex gap-8 pr-12">
                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">Item</Label>
                      <Input
                        placeholder="Item"
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6 flex gap-8 pr-12">
                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">
                        Description
                      </Label>
                      <Input
                        placeholder="Description"
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                        required
                      />
                    </div>

                    <div className="flex w-full flex-col gap-2">
                      <Label className="font-medium text-gray-500">Stock</Label>
                      <Input
                        placeholder="Stock"
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <button className="absolute right-8 top-1/2 -translate-y-1/2 transform text-2xl text-red-500 hover:text-red-700 focus:outline-none">
                    &times;
                  </button>
                </div>
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
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <Label>{item.brand}</Label>
                      <Label> - </Label>
                      <Label>{item.item}</Label>
                      <Badge className="bg-blue-400 font-light">
                        {item.category}
                      </Badge>
                    </div>

                    <div className="flex gap-3">
                      <Label>Boxes</Label>
                      <Label className="font-bold text-gray-500">•</Label>
                      <Label>{item.variants} Variants</Label>
                      <Label className="font-bold text-gray-500">•</Label>
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
                    className="flex cursor-pointer items-center justify-center rounded-md border-2 p-3"
                    onClick={(e) => handleExpandClick(e, item.id)}
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
          </DialogTrigger>
          <DialogContent className="w-full max-w-5xl gap-5 p-10">
            <DialogHeader>
              <div className={"flex items-center gap-3"}>
                <RxArrowLeft color={"#F87171"} size={25} />
                <label className={"text-lg text-red-400"}>Back</label>
              </div>
            </DialogHeader>

            <div className="flex items-center justify-between gap-3">
              <div className={"flex items-center gap-3"}>
                <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <Label>Mongol</Label>
                    <Label> - </Label>
                    <Label>Eberhard Faber Pencil</Label>
                    <Badge className="bg-blue-400 font-light">Stationery</Badge>
                  </div>

                  <div className="flex gap-3">
                    <Label>Boxes</Label>
                    <Label className="font-bold text-gray-500">•</Label>
                    <Label>{item.variants} Variants</Label>
                    <Label className="font-bold text-gray-500">•</Label>
                    <Label className={`font-bold text-${item.stockStatus}`}>
                      {item.stock} in Stock
                    </Label>
                  </div>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#FF7B7B] p-5 font-bold">Edit</Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-5xl gap-5 p-10">
                  <DialogHeader>
                    <DialogTitle className="p-3 text-2xl font-bold">
                      EDIT PRODUCT
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-3">
                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Brand <span className="text-red-600">*</span>
                      </Label>
                      <Input placeholder="Brand" className="p-5" required />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Item <span className="text-red-600">*</span>
                      </Label>
                      <Input placeholder="Item" className="p-5" required />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Category <span className="text-red-600">*</span>
                      </Label>
                      <Input placeholder="Category" className="p-5" required />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Unit <span className="text-red-600">*</span>
                      </Label>
                      <Input placeholder="Unit" className="p-5" required />
                    </div>
                  </div>

                  <div>
                    <Textarea
                      placeholder="About this product..."
                      rows={4}
                      className="resize-none bg-gray-100"
                    />
                  </div>

                  <div>
                    <div>
                      <Label>Variants</Label>
                    </div>

                    <div className="relative rounded-lg border border-gray-300 bg-gray-100 p-8">
                      <div className="mb-6 flex gap-8 pr-12">
                        <div className="flex w-full flex-col gap-2">
                          <Label className="font-medium text-gray-500">
                            Description
                          </Label>
                          <Input
                            placeholder="Description"
                            className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                            required
                          />
                        </div>

                        <div className="flex w-full flex-col gap-2">
                          <Label className="font-medium text-gray-500">
                            Stock
                          </Label>
                          <Input
                            placeholder="Stock"
                            className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-8 pr-12">
                        <div className="flex w-full flex-col gap-2">
                          <Label className="font-medium text-gray-500">
                            Wholesale Price
                          </Label>
                          <Input
                            placeholder="0000.00"
                            className="rounded-lg border border-gray-300 bg-gray-200 p-4 shadow-sm"
                            required
                            disabled
                          />
                        </div>

                        <div className="flex w-full flex-col gap-2">
                          <Label className="font-medium text-gray-500">
                            Special Price
                          </Label>
                          <Input
                            placeholder="0000.00"
                            className="rounded-lg border border-gray-300 bg-gray-200 p-4 shadow-sm"
                            required
                            disabled
                          />
                        </div>
                      </div>

                      <button className="absolute right-8 top-1/2 -translate-y-1/2 transform text-2xl text-red-500 hover:text-red-700 focus:outline-none">
                        &times;
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>+ Add a Variant</Label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button>Clear</Button>
                    <Button>Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div>
              <Textarea
                placeholder="About this product..."
                rows={4}
                className="resize-none bg-gray-100"
              />
            </div>

            {variantsData.map((variant, index) => (
              <Card key={index} className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-5 rounded-md">
                  <div className="w-full">
                    <div className="flex items-center gap-5">
                      <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                          <Label>{variant.name}</Label>
                        </div>
                        <div className="flex">
                          <Label>{variant.stock} in stock</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center">
                    <Separator
                      orientation="vertical"
                      className="h-16 w-[2px]"
                    />
                  </div>

                  <div className="flex w-full flex-row gap-3">
                    <div className="flex w-full flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Label>WholeSale Price</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label>{variant.specialPrice}</Label>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Label>Special Price</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label>{variant.specialPrice}</Label>
                      </div>
                    </div>
                    <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                      <FaEllipsisH color="gray" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </DialogContent>
        </Dialog>
      ))}
    </section>
  );
};

export default InventoryPage;
