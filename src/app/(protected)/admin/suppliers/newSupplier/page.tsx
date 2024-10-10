"use client";

import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/input";

import { FaArrowLeft } from "react-icons/fa";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const NewSupplier = () => {
  const router = useRouter();
  return (
    <section
      className={`h-screen w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-2">
          <FaArrowLeft
            size={25}
            color="#FF7B7B"
            className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
            onClick={() => router.push("/admin/suppliers")}
          />
          <span className="font-bold">NEW SUPPLIER</span>
          <span className="ml-3 text-sm font-light text-gray-400">#12345</span>
        </div>
      </div>

      <div className="flex h-full flex-col gap-5 px-52">
        <div className="flex h-full w-full flex-col justify-center gap-7">
          <div className="flex flex-col gap-2">
            <Label>
              Customer <span className="text-red-600">*</span>
            </Label>
            <Input placeholder="Customer Name" className="p-7" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Business <span className="text-red-600">*</span>
            </Label>
            <Input placeholder="Business Name" className="p-7" required />
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>Contact Number</Label>
              <Input placeholder="Contact Number" className="p-7" required />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Email</Label>
              <Input placeholder="Email" className="p-7" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Address <span className="text-red-600">*</span>
            </Label>
            <Input placeholder="Address" className="p-7" required />
          </div>

          <div>
            <Textarea
              placeholder="About this supplier..."
              rows={4}
              className="resize-none"
            />
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

export default NewSupplier;
