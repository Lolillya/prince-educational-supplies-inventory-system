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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { DialogHeader } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { prisma } from "~/server/db";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const InvoicePage = async () => {
  // const invoice = await prisma.invoice.create({
  //   data: {
  //     IssueDate: ,
  //     TotalAmount: ,
  //     DiscountApplied: ,
  //     order: ,

  //   }
  // })

  return (
    <section
      className={`h-auto w-screen ${poppins.className} flex flex-col gap-3 overflow-y-scroll p-10`}
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

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#FF7B7B] p-5 font-bold">
                + New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-5xl p-10">
              <DialogHeader>
                <DialogTitle className="p-3 text-2xl font-bold">
                  EDIT SUPPLIER
                </DialogTitle>
              </DialogHeader>
              <Tabs className="">
                <TabsList className="h-full max-h-16 w-full grid-cols-2 bg-[#FFCCCC] p-3">
                  <TabsTrigger value="order" className="text- w-full p-3">
                    Order
                  </TabsTrigger>
                  <TabsTrigger value="repackaging" className="w-full p-3">
                    Repackaging
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="order" className="flex flex-col gap-5">
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
                      Customer Company <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      placeholder="Customer Company"
                      className="p-5"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Customer Company <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        placeholder="Customer Company"
                        className="p-5"
                        required
                      />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Term <span className="text-red-600">*</span>
                      </Label>
                      <Input placeholder="Term" className="p-5" required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input placeholder="Search" className="p-5" required />
                  </div>

                  <div className="w-full rounded-md bg-[#F0F1F4]">
                    <div className="flex items-center gap-5 p-3">
                      <div className="h-14 w-14 rounded-md bg-[#98A0B4]"></div>
                      <div className="flex items-center gap-3">
                        <Label>Brand</Label>
                        <Label>-</Label>
                        <Label>Item</Label>
                        <Label>-</Label>
                        <Label>Variant</Label>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 p-3">
                      <div className="flex w-full flex-col gap-1">
                        <Label className="ml-3">Quantity</Label>
                        <Input placeholder="Quantity" className="p-5" />
                      </div>

                      <div className="flex w-full flex-col gap-1">
                        <Label className="ml-3">Unit Price</Label>
                        <Input placeholder="Unit Price" className="p-5" />
                      </div>

                      <div className="flex w-full flex-col gap-1">
                        <Label className="ml-3">Discount</Label>
                        <Input placeholder="Discount" className="p-5" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="repackaging"
                  className="flex flex-col gap-5"
                >
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
                      Customer Company <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      placeholder="Customer Company"
                      className="p-5"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Customer Company <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        placeholder="Customer Company"
                        className="p-5"
                        required
                      />
                    </div>

                    <div className="flex w-full flex-col gap-1">
                      <Label>
                        Term <span className="text-red-600">*</span>
                      </Label>
                      <Input placeholder="Term" className="p-5" required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input placeholder="Search" className="p-5" required />
                  </div>

                  <div className="w-full rounded-md bg-[#F0F1F4]">
                    <div className="flex items-center gap-5 p-3">
                      <div className="h-14 w-14 rounded-md bg-[#98A0B4]"></div>
                      <div className="flex items-center gap-3">
                        <Label>Brand</Label>
                        <Label>-</Label>
                        <Label>Item</Label>
                        <Label>-</Label>
                        <Label>Variant</Label>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 p-3">
                      <div className="flex w-full flex-col gap-1">
                        <Label className="ml-3">Quantity</Label>
                        <Input placeholder="Quantity" className="p-5" />
                      </div>

                      <div className="flex w-full flex-col gap-1">
                        <Label className="ml-3">Unit Price</Label>
                        <Input placeholder="Unit Price" className="p-5" />
                      </div>

                      <div className="flex w-full flex-col gap-1">
                        <Label className="ml-3">Discount</Label>
                        <Input placeholder="Discount" className="p-5" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3">
                <Button
                  size={"lg"}
                  className="border-[#FF7B7B] bg-white font-bold text-[#FF7B7B] hover:bg-[#FF7B7B] hover:text-white"
                >
                  Print
                </Button>

                {/* <Button
                  size={"lg"}
                  className="border-2 border-[#FF7B7B] bg-red-300 font-bold text-red-500 hover:bg-[#FF7B7B] hover:text-white"
                >
                  Delete
                </Button> */}

                <Button
                  size={"lg"}
                  className="border-2 border-[#FF7B7B] bg-white font-bold text-[#FF7B7B] hover:bg-[#FF7B7B] hover:text-white"
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

            <Dialog>
              <DialogTrigger asChild>
                <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                  <FaEllipsisH color="gray" />
                </div>
              </DialogTrigger>
              <DialogContent className="w-full max-w-5xl p-10">
                <DialogHeader>
                  <DialogTitle className="p-3 text-2xl font-bold">
                    #12345678 - September 29, 2024
                  </DialogTitle>
                </DialogHeader>
                <Tabs className="">
                  <TabsList className="h-full max-h-16 w-full grid-cols-2 bg-[#FFCCCC] p-3">
                    <TabsTrigger value="order" className="text- w-full p-3">
                      Order
                    </TabsTrigger>
                    <TabsTrigger value="repackaging" className="w-full p-3">
                      Repackaging
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="order" className="flex flex-col gap-5">
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
                        Customer Company <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        placeholder="Customer Company"
                        className="p-5"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex w-full flex-col gap-1">
                        <Label>
                          Customer Company{" "}
                          <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          placeholder="Customer Company"
                          className="p-5"
                          required
                        />
                      </div>

                      <div className="flex w-full flex-col gap-1">
                        <Label>
                          Term <span className="text-red-600">*</span>
                        </Label>
                        <Input placeholder="Term" className="p-5" required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Input placeholder="Search" className="p-5" required />
                    </div>

                    <div className="w-full rounded-md bg-[#F0F1F4]">
                      <div className="flex items-center gap-5 p-3">
                        <div className="h-14 w-14 rounded-md bg-[#98A0B4]"></div>
                        <div className="flex items-center gap-3">
                          <Label>Brand</Label>
                          <Label>-</Label>
                          <Label>Item</Label>
                          <Label>-</Label>
                          <Label>Variant</Label>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 p-3">
                        <div className="flex w-full flex-col gap-1">
                          <Label className="ml-3">Quantity</Label>
                          <Input placeholder="Quantity" className="p-5" />
                        </div>

                        <div className="flex w-full flex-col gap-1">
                          <Label className="ml-3">Unit Price</Label>
                          <Input placeholder="Unit Price" className="p-5" />
                        </div>

                        <div className="flex w-full flex-col gap-1">
                          <Label className="ml-3">Discount</Label>
                          <Input placeholder="Discount" className="p-5" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="repackaging"
                    className="flex flex-col gap-5"
                  >
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
                        Customer Company <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        placeholder="Customer Company"
                        className="p-5"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex w-full flex-col gap-1">
                        <Label>
                          Customer Company{" "}
                          <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          placeholder="Customer Company"
                          className="p-5"
                          required
                        />
                      </div>

                      <div className="flex w-full flex-col gap-1">
                        <Label>
                          Term <span className="text-red-600">*</span>
                        </Label>
                        <Input placeholder="Term" className="p-5" required />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Input placeholder="Search" className="p-5" required />
                    </div>

                    <div className="w-full rounded-md bg-[#F0F1F4]">
                      <div className="flex items-center gap-5 p-3">
                        <div className="h-14 w-14 rounded-md bg-[#98A0B4]"></div>
                        <div className="flex items-center gap-3">
                          <Label>Brand</Label>
                          <Label>-</Label>
                          <Label>Item</Label>
                          <Label>-</Label>
                          <Label>Variant</Label>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 p-3">
                        <div className="flex w-full flex-col gap-1">
                          <Label className="ml-3">Quantity</Label>
                          <Input placeholder="Quantity" className="p-5" />
                        </div>

                        <div className="flex w-full flex-col gap-1">
                          <Label className="ml-3">Unit Price</Label>
                          <Input placeholder="Unit Price" className="p-5" />
                        </div>

                        <div className="flex w-full flex-col gap-1">
                          <Label className="ml-3">Discount</Label>
                          <Input placeholder="Discount" className="p-5" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3">
                  <Button
                    size={"lg"}
                    className="border-[#FF7B7B] bg-white font-bold text-[#FF7B7B] hover:bg-[#FF7B7B] hover:text-white"
                  >
                    Print
                  </Button>

                  <Button
                    size={"lg"}
                    className="border-2 border-[#FF7B7B] bg-red-300 font-bold text-red-500 hover:bg-[#FF7B7B] hover:text-white"
                  >
                    Delete
                  </Button>

                  <Button
                    size={"lg"}
                    className="border-2 border-[#FF7B7B] bg-white font-bold text-[#FF7B7B] hover:bg-[#FF7B7B] hover:text-white"
                  >
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
