"use client";

import { Input } from "~/components/ui/input";
import { FaArrowLeft } from "react-icons/fa";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { Switch } from "~/components/ui/switch";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { DialogContent } from "~/components/ui/dialog";
import { Card, CardContent } from "~/components/ui/card";
import { useState } from "react";
import { tree } from "next/dist/build/templates/app-page";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const NewEmployeePage = () => {
  const [checked, setChecked] = useState(false); // Switch state
  const [isOpen, setIsOpen] = useState(false); // Dialog state

  // When the switch is toggled
  const handleSwitchChange = () => {
    if (!checked) {
      setIsOpen(true); // Open the dialog only if the switch is false
    } else {
      setChecked(false); // If switch is true, toggle it back to false without showing dialog
    }
  };

  const handleCancel = () => {
    setIsOpen(false); // Close the dialog without changing the switch state
  };

  const handleAllow = () => {
    setChecked(true); // Set the switch to true when "Allow" is clicked
    setIsOpen(false); // Close the dialog
  };

  const handleDialog = () => {
    if (checked) setIsOpen(false);
    else setIsOpen(true);
  };

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
            onClick={() => router.push("/admin/staff")}
          />
          <span className="font-bold">NEW EMPLOYEE</span>
          <span className="ml-3 text-sm font-light text-gray-400">#12345</span>
        </div>
      </div>

      <div className="flex h-full flex-col gap-5 px-52">
        <div className="flex h-full w-full flex-col justify-center gap-7">
          <div className="flex flex-col gap-2">
            <Label className="text-gray-400">
              Name <span className="text-red-600">*</span>
            </Label>
            <Input placeholder="Name" className="p-7" required />
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col justify-center gap-2">
              <Label className="text-gray-400">
                Position <span className="text-red-600">*</span>
              </Label>
              <Input placeholder="Position" className="p-7" required />
            </div>

            <div className="flex w-full flex-col justify-center gap-2">
              <Label className="text-gray-400">
                Admininstrator Privilages{" "}
                <span className="text-red-600">*</span>
              </Label>
              <Dialog open={isOpen} onOpenChange={handleDialog}>
                <DialogTrigger asChild>
                  <Switch
                    className="w-20 rounded-lg px-1 py-5"
                    checked={checked}
                    onClick={handleSwitchChange} // Handle switch click
                  />
                </DialogTrigger>
                <DialogContent>
                  <div className="flex flex-col items-center gap-5 p-5">
                    <span className="text-center">
                      Are you sure you want to allow administrator privileges
                      for this person?
                    </span>
                    <div className="flex items-center gap-3">
                      <Button size={"lg"} onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button size={"lg"} onClick={handleAllow}>
                        Allow
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label className="text-gray-400">Contact Number</Label>
              <Input placeholder="Contact Number" className="p-7" required />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label className="text-gray-400">Email</Label>
              <Input placeholder="Email" className="p-7" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-gray-400">
              Address <span className="text-red-600">*</span>
            </Label>
            <Input placeholder="Address" className="p-7" required />
          </div>

          <div>
            <Label className="text-gray-400">
              Notes <span className="text-red-600">*</span>
            </Label>
            <Textarea
              placeholder="About this supplier..."
              rows={6}
              className="resize-none border-none bg-gray-200"
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

export default NewEmployeePage;
