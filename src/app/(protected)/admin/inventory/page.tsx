import { Poppins } from "next/font/google";
import { Input } from "~/components/ui/input";
import { RxMagnifyingGlass } from "react-icons/rx";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

import Filter_Icon from "public/icons/filter-icon2.svg";
import Image from "next/image";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { FaAngleDown, FaPen } from "react-icons/fa";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});
// TODO
// ADD TO STOCK
// EDIT ITEM
// NEW ITEM
const InventoryPage = () => {
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

          <div className="flex items-center gap-3">
            <Button className="border-2 border-[#FF7B7B] bg-white p-5 font-bold text-[#FF7B7B]">
              + New Invoice
            </Button>
            <Button className="bg-[#FF7B7B] p-5 font-bold">
              + New Invoice
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Label>Brand</Label>
                <Label> - </Label>
                <Label>Item</Label>
                <Badge className="bg-blue-400 font-light">Category</Badge>
              </div>

              <div className="flex gap-3">
                <Label>Boxes</Label>
                <Label>3 Boxes</Label>
                <Label className="font-bold text-red-500">10 in Stock</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center justify-center rounded-md border-2 p-3">
              <FaPen color="gray" />
            </div>

            <div className="flex items-center justify-center rounded-md border-2 p-3">
              <FaAngleDown color="gray" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Label>Brand</Label>
                <Label> - </Label>
                <Label>Item</Label>
                <Badge className="bg-blue-400 font-light">Category</Badge>
              </div>

              <div className="flex gap-3">
                <Label>Boxes</Label>
                <Label>3 Boxes</Label>
                <Label className="font-bold text-yellow-500">50 in Stock</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center justify-center rounded-md border-2 p-3">
              <FaPen color="gray" />
            </div>

            <div className="flex items-center justify-center rounded-md border-2 p-3">
              <FaAngleDown color="gray" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Label>Brand</Label>
                <Label> - </Label>
                <Label>Item</Label>
                <Badge className="bg-blue-400 font-light">Category</Badge>
              </div>

              <div className="flex gap-3">
                <Label>Boxes</Label>
                <Label>3 Boxes</Label>
                <Label className="font-bold text-green-500">100 in Stock</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center justify-center rounded-md border-2 p-3">
              <FaPen color="gray" />
            </div>

            <div className="flex items-center justify-center rounded-md border-2 p-3">
              <FaAngleDown color="gray" />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default InventoryPage;
