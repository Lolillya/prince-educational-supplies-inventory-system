"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const NewSupplierState = () => {
  const [businessName, setBusinessName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {};

  return (
    <div className="flex h-full flex-col gap-5 px-52">
      <form className="h-full w-full">
        <div className="flex h-full w-full flex-col justify-center gap-7">
          <div className="flex flex-col gap-2">
            <Label>
              Business <span className="text-red-600">*</span>
            </Label>
            <Input
              placeholder="Customer Name"
              className="p-7"
              required
              onChange={(e) => setBusinessName(e.target.value)}
              value={businessName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Salesperson <span className="text-red-600">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Firstname"
                className="p-7"
                onChange={(e) => setFirstName(e.target.value)}
                value={firstName}
              />
              <Input
                placeholder="Lastname"
                className="p-7"
                onChange={(e) => setLastName(e.target.value)}
                value={lastName}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>Contact Number</Label>
              <Input
                placeholder="Contact Number"
                className="p-7"
                required
                onChange={(e) => setContact(e.target.value)}
                value={contact}
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Email</Label>
              <Input
                placeholder="Email"
                className="p-7"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
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
              className="resize-none bg-gray"
              onChange={(e) => setNotes(e.target.value)}
              value={notes}
            />
          </div>

          <div className="flex justify-end gap-3"></div>
        </div>
      </form>
      <div className="flex w-full items-center justify-end gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-transparent p-7 text-lg font-bold text-green">
              Clear
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h- flex w-full max-w-lg flex-col p-10">
            <DialogHeader>
              <div className="flex w-full justify-center text-center text-xl">
                <span>Are you sure you want to delete this supplier?</span>
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
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button className="bg-green p-7 text-lg font-bold">Save</Button>
      </div>
    </div>
  );
};

export default NewSupplierState;
