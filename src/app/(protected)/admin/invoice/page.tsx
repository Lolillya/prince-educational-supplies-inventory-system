import { Poppins } from "next/font/google";
import { Input } from "~/components/ui/input";
import { RxMagnifyingGlass } from "react-icons/rx";

import Image from "next/image";
import Filter_Icon from "public/icons/filter-icon2.svg";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { FaEllipsisH } from "react-icons/fa";
import { Badge } from "~/components/ui/badge";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// TODO
// NEW INVVOICE WINDOW
// NEW INVOICE REPACKAGE WINDOW
// INVOICE DETAILS

const InvoicePage = () => {
  return (
    <section
      className={`h-auto w-screen ${poppins.className} mb-0 flex flex-col gap-3 overflow-y-scroll p-10`}
    >
      <div className="relative flex items-center justify-between">
        <Label className="text-4xl font-bold">Invoice</Label>
        <div className="flex h-16 items-center gap-3">
          <div className="relative flex h-auto w-full max-w-md gap-3">
            <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
            <Input placeholder="Search" className="bg-gray-100 p-5 pl-10" />

            <div className="rounded-md bg-gray-100 p-3 hover:cursor-pointer hover:bg-gray-300">
              <Image src={Filter_Icon} alt="filter icon" />
            </div>
          </div>

          <Button className="bg-[#FF7B7B] p-5 font-bold">+ New Invoice</Button>
        </div>
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex w-full flex-col gap-3 p-3">
            <Label>#12345678 - September 29, 2024</Label>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="profile avatar"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Label className="font-bold">John Doe</Label>
            </div>
          </div>

          <div className="relative flex items-center">
            {/* Set explicit height for the Separator */}
            <Separator orientation="vertical" className="my-4 h-16 w-[2px]" />
          </div>

          <div className="flex w-full items-center justify-between gap-3 p-3">
            <div className="flex flex-col gap-3">
              <Label>Total</Label>
              <Label>₱ 0000.00</Label>
            </div>

            <div className="rounded-md border-2 border-[#D3D6DF] p-3">
              <FaEllipsisH color="gray" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 rounded-md bg-[#F0F1F4] p-5">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Label>Brand</Label>
                <Label> - </Label>
                <Label>Item</Label>
                <Badge className="bg-blue-400 font-light">Category</Badge>
              </div>

              <div className="flex">
                <Label>Variant 1</Label>
                <Label>3 Boxex</Label>
                <Label>0% discount</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>P 0000.00</Label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 rounded-md bg-[#F0F1F4] p-5">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Label>Brand</Label>
                <Label> - </Label>
                <Label>Item</Label>
                <Badge className="bg-blue-400 font-light">Category</Badge>
              </div>

              <div className="flex">
                <Label>Variant 1</Label>
                <Label>3 Boxex</Label>
                <Label>0% discount</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>P 0000.00</Label>
          </div>
        </div>

        <Button>View All</Button>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex w-full flex-col gap-3 p-3">
            <Label>#12345678 - September 29, 2024</Label>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="profile avatar"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Label className="font-bold">John Doe</Label>
            </div>
          </div>

          <div className="relative flex items-center">
            {/* Set explicit height for the Separator */}
            <Separator orientation="vertical" className="my-4 h-16 w-[2px]" />
          </div>

          <div className="flex w-full items-center justify-between gap-3 p-3">
            <div className="flex flex-col gap-3">
              <Label>Total</Label>
              <Label>₱ 0000.00</Label>
            </div>

            <div className="rounded-md border-2 border-[#D3D6DF] p-3">
              <FaEllipsisH color="gray" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 rounded-md bg-[#F0F1F4] p-5">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Label>Brand</Label>
                <Label> - </Label>
                <Label>Item</Label>
                <Badge className="bg-blue-400 font-light">Category</Badge>
              </div>

              <div className="flex">
                <Label>Variant 1</Label>
                <Label>3 Boxex</Label>
                <Label>0% discount</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>P 0000.00</Label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 rounded-md bg-[#F0F1F4] p-5">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Label>Brand</Label>
                <Label> - </Label>
                <Label>Item</Label>
                <Badge className="bg-blue-400 font-light">Category</Badge>
              </div>

              <div className="flex">
                <Label>Variant 1</Label>
                <Label>3 Boxex</Label>
                <Label>0% discount</Label>
              </div>
            </div>
          </div>

          <div>
            <Label>P 0000.00</Label>
          </div>
        </div>

        <Button>View All</Button>
      </Card>
    </section>
  );
};

export default InvoicePage;
