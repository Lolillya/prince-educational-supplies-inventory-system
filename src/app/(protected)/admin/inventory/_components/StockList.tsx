"use client";

import { DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Select, SelectTrigger } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";  // Assuming api.inventory.listInventory is available

const StockList = () => {
    // Fetch inventory data (reusing listInventory function for stock)
    const {
        data: initialInventory,
        isLoading,
        error,
    } = api.inventory.listInventory.useQuery(); // Reuse the listInventory function for stock
    const [stock, setStock] = useState([]);

    useEffect(() => {
        if (initialInventory && !isLoading && !error) {
            setStock(initialInventory); // Initialize local state with fetched inventory data
        }
    }, [initialInventory, isLoading, error]);

    const handleRemoveItem = (stockId: number) => {
        setStock((prevStock) =>
            prevStock.filter((item) => item.inventory_id !== stockId),
        );
    };

    return (
        <DialogContent className="flex h-full max-h-[80%] max-w-3xl flex-col">
            <div className="flex items-center gap-3">
                <DialogTitle>ITEM STOCKLIST</DialogTitle>
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
                    {isLoading ? (
                        <Label>Loading...</Label>
                    ) : error ? (
                        <Label className="text-red-500">Failed to load stock.</Label>
                    ) : stock.length === 0 ? (
                        <Label>No items found.</Label>
                    ) : (
                        stock.map((item) => {
                            const variant = item.variant;
                            const batchVariant = variant?.BatchVariant?.[0];

                            return (
                                <div
                                    key={item.inventory_id} // Use inventory_id as key
                                    className="flex w-full items-center justify-between rounded-lg bg-gray p-3"
                                >
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <Label>{variant?.item?.name}</Label>
                                            <Label>{variant?.item?.brand?.name}</Label>
                                            <Label>{variant?.name}</Label>
                                        </div>
                                    </div>

                                    <div>
                                        <X
                                            color="gray"
                                            className="cursor-pointer"
                                            onClick={() => handleRemoveItem(item.inventory_id)} // Remove item on click
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

export default StockList;
