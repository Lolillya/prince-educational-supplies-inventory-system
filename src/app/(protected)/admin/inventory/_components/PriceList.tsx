"use client";

import { DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Select, SelectTrigger } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { X } from "lucide-react";
import { api } from "~/trpc/react"; // Import tRPC hooks
import { useEffect, useState } from "react";

const PriceList = () => {
    // Fetch inventory data from the backend
    const {
        data: inventoryData,
        isLoading,
        error,
    } = api.inventory.listInventory.useQuery();

    const [filteredInventory, setFilteredInventory] = useState([]);

    useEffect(() => {
        if (inventoryData && !isLoading && !error) {
            setFilteredInventory(inventoryData); // Initialize filtered inventory
        }
    }, [inventoryData, isLoading, error]);

    return (
        <DialogContent className="flex h-full max-h-[80%] max-w-3xl flex-col">
            <div className="flex items-center gap-3">
                <DialogTitle>ITEM PRICE LIST</DialogTitle>
                <Label className="text-textGray">MM/DD/YY</Label>
            </div>

            <div className="flex flex-col gap-3">
                {/* Filters */}
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

                {/* Inventory Display */}
                <div className="flex flex-col gap-3">
                    {isLoading ? (
                        <Label>Loading...</Label>
                    ) : error ? (
                        <Label className="text-red-500">Failed to load inventory.</Label>
                    ) : filteredInventory.length === 0 ? (
                        <Label>No items found.</Label>
                    ) : (
                        filteredInventory.map((item) => {
                            const variant = item.variant;
                            const batchVariant = variant?.BatchVariant?.[0];
                            const supplierUnit =
                                batchVariant?.batch?.batchVariants?.[0]?.SupplierUnit?.[0];

                            return (
                                <div
                                    key={item.inventory_id}
                                    className="flex w-full items-center justify-between rounded-lg bg-gray p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Label>{variant?.item?.name}</Label>
                                        <Label>{variant?.item?.brand?.name}</Label>
                                        <Label>{variant?.name}</Label>
                                        <Label>{supplierUnit?.price ? `₱${supplierUnit.price.toFixed(2)}` : "N/A"}</Label>
                                    </div>
                                    <div>
                                        <X
                                            color="gray"
                                            className="cursor-pointer"
                                            onClick={() => {
                                                setFilteredInventory((prev) =>
                                                    prev.filter((inv) => inv.inventory_id !== item.inventory_id)
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </DialogContent>
    );
};

export default PriceList;
