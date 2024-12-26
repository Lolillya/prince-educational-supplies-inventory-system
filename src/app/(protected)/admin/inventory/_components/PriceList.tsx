"use client";

import { DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Select, SelectTrigger } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { X } from "lucide-react";

const PriceList = () => {
    return (
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
    );
};

export default PriceList;
