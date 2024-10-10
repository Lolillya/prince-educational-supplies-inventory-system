"use client";

import { Poppins } from "next/font/google";
import { Input } from "~/components/ui/input";
import { RxMagnifyingGlass } from "react-icons/rx";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";
import { IoIosClose } from "react-icons/io";
import { Separator } from "~/components/ui/separator";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const InvoiceAddStock = () => {
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
            onClick={() => router.push("/admin/restock")}
          />
          <span className="font-bold">ADD STOCK</span>
          <span className="ml-3 text-sm font-light text-gray-400">#12345</span>
        </div>
      </div>

      <div className="relative flex h-auto w-full max-w-md gap-3">
        <div className="flex items-center">
          <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
          <Input placeholder="Search" className="bg-gray-100 p-5 pl-10" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center rounded-lg bg-gray-200 p-3 text-xs font-light text-gray-500">
          <span className="w-full">Item</span>
          <span className="w-full">Quantity & Stock</span>
        </div>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-1 font-bold">
                <span>Item</span>
                <span>Brand</span>
                <span>Item</span>
              </div>
              <div>
                <span>200 in stock</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-5 p-3">30</span>
                    <Separator orientation="vertical" className="h-10" />
                    <Select>
                      <SelectTrigger className="ml-5 border-none shadow-none">
                        <SelectValue placeholder="Boxes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="">
              <IoIosClose size={25} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-1 font-bold">
                <span>Item</span>
                <span>Brand</span>
                <span>Item</span>
              </div>
              <div>
                <span>200 in stock</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-5 p-3">30</span>
                    <Separator orientation="vertical" className="h-10" />
                    <Select>
                      <SelectTrigger className="ml-5 border-none shadow-none">
                        <SelectValue placeholder="Boxes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="">
              <IoIosClose size={25} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-1 font-bold">
                <span>Item</span>
                <span>Brand</span>
                <span>Item</span>
              </div>
              <div>
                <span>200 in stock</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-5 p-3">30</span>
                    <Separator orientation="vertical" className="h-10" />
                    <Select>
                      <SelectTrigger className="ml-5 border-none shadow-none">
                        <SelectValue placeholder="Boxes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="">
              <IoIosClose size={25} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-1 font-bold">
                <span>Item</span>
                <span>Brand</span>
                <span>Item</span>
              </div>
              <div>
                <span>200 in stock</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-5 p-3">30</span>
                    <Separator orientation="vertical" className="h-10" />
                    <Select>
                      <SelectTrigger className="ml-5 border-none shadow-none">
                        <SelectValue placeholder="Boxes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="">
              <IoIosClose size={25} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-1 font-bold">
                <span>Item</span>
                <span>Brand</span>
                <span>Item</span>
              </div>
              <div>
                <span>200 in stock</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-5 p-3">30</span>
                    <Separator orientation="vertical" className="h-10" />
                    <Select>
                      <SelectTrigger className="ml-5 border-none shadow-none">
                        <SelectValue placeholder="Boxes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="">
              <IoIosClose size={25} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-1 font-bold">
                <span>Item</span>
                <span>Brand</span>
                <span>Item</span>
              </div>
              <div>
                <span>200 in stock</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-5 p-3">30</span>
                    <Separator orientation="vertical" className="h-10" />
                    <Select>
                      <SelectTrigger className="ml-5 border-none shadow-none">
                        <SelectValue placeholder="Boxes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="">
              <IoIosClose size={25} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-1 font-bold">
                <span>Item</span>
                <span>Brand</span>
                <span>Item</span>
              </div>
              <div>
                <span>200 in stock</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-5 p-3">30</span>
                    <Separator orientation="vertical" className="h-10" />
                    <Select>
                      <SelectTrigger className="ml-5 border-none shadow-none">
                        <SelectValue placeholder="Boxes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="">
              <IoIosClose size={25} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-1 font-bold">
                <span>Item</span>
                <span>Brand</span>
                <span>Item</span>
              </div>
              <div>
                <span>200 in stock</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="mr-5 p-3">30</span>
                    <Separator orientation="vertical" className="h-10" />
                    <Select>
                      <SelectTrigger className="ml-5 border-none shadow-none">
                        <SelectValue placeholder="Boxes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="">
              <IoIosClose size={25} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="absolute bottom-0 right-0 z-[5] flex w-full items-center justify-end gap-3 bg-white px-10 py-5 font-bold drop-shadow-2xl">
        <span>TOTAL: -----</span>
        <Button size={"lg"} className="py-8 text-xl font-bold">
          Confirm Resock
        </Button>
      </div>
    </section>
  );
};

export default InvoiceAddStock;
