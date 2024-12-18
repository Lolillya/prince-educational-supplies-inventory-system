"use client";

import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import StockCard from "../_components/stock-card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Label } from "~/components/ui/label";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import SupplierDropdown from "../_components/Supplier-Dropdown";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../_components/Hover-Card";

// Define the data structure for inventory items
type InventoryItem = {
  inventory_id: number;
  variant: {
    name: string | null;
    item: {
      name: string;
      brand: {
        name: string;
      };
    };
  };
};

const InvoiceAddStock = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [stockTotals, setStockTotals] = useState<{ [key: number]: string }>({}); // Stock values as strings

  const {
    data: inventoryItems,
    isLoading,
    isError,
  } = api.inventory.listInventory.useQuery();

  // Fetch the next available batch_id
  const {
    data: nextBatchId,
    isLoading: isLoadingBatch,
    isError: isErrorBatch,
  } = api.restock.getBatchId.useQuery();

  const { data: suppliers } = api.restock.getSuppliers.useQuery();
  const [selectedSupplier, setSelectedSupplier] = useState("");

  // Filter inventory items based on the search term
  useEffect(() => {
    if (searchTerm && inventoryItems) {
      const results = inventoryItems.filter(
        (item: InventoryItem) =>
          item.variant.item.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.variant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.variant.item.brand.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredItems(results);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, inventoryItems]);

  // Handle selecting an item
  const handleSelectItem = (item: InventoryItem) => {
    if (
      !selectedItems.some(
        (selected) => selected.inventory_id === item.inventory_id,
      )
    ) {
      setSelectedItems([...selectedItems, item]);
      setStockTotals((prev) => ({ ...prev, [item.inventory_id]: "" })); // Initialize stock
    }
    setSearchTerm(""); // Clear the search term to hide the dropdown
  };

  // Handle removing an item
  const handleRemoveItem = (inventoryId: number) => {
    setSelectedItems(
      selectedItems.filter((item) => item.inventory_id !== inventoryId),
    );
    setStockTotals((prev) => {
      const updated = { ...prev };
      delete updated[inventoryId]; // Remove stock for the deleted item
      return updated;
    });
  };

  const handleStockChange = (inventoryId: number, newStock: string) => {
    setStockTotals((prev) => ({
      ...prev,
      [inventoryId]: newStock, // Update stock for the specific item
    }));
  };

  // Calculate total stock
  const totalStock = Object.values(stockTotals).reduce(
    (sum, stock) => sum + Number(stock || 0),
    0,
  );

  if (isLoading || isLoadingBatch) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <span>Loading...</span>
      </section>
    );
  }

  if (isError || isErrorBatch) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <span>Error fetching data...</span>
      </section>
    );
  }

  return (
    <section className={`flex h-auto w-screen flex-col gap-3 p-10`}>
      <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-1">
          <Dialog>
            <DialogTrigger>
              <ArrowLeft
                size={25}
                color="#00B69B"
                className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogTitle className="text-center">Confirm</DialogTitle>
              <div className="flex flex-col gap-3 text-center">
                <span>
                  You have unsaved changes. Are you sure you want to leave this
                  page?
                </span>
                <div className="flex items-center justify-center gap-3">
                  <Button className="border-2 border-green bg-transparent font-bold text-green">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => router.push("/admin/restock")}
                    className="bg-green font-bold"
                  >
                    Leave
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <span className="font-bold">ADD STOCK</span>
          <span className="text-gray-400 ml-3 text-sm font-light">
            #{nextBatchId}
          </span>
        </div>
      </div>

      <div className="flex w-full justify-center gap-3">
        <div className="relative flex w-full max-w-md items-center justify-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-textGray" />
          <Input
            placeholder="Search"
            className="bg-gray p-5 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && filteredItems.length > 0 && (
            <div className="absolute top-full z-10 mt-2 w-full rounded-lg bg-white p-3 shadow-md">
              <ul className="max-h-64 overflow-auto">
                {filteredItems.map((item) => (
                  <li
                    key={item.inventory_id}
                    className="cursor-pointer rounded-lg p-3 hover:bg-gray"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="font-bold">{item.variant.item.name}</div>
                    <div className="text-textGray">
                      {item.variant.item.brand.name}
                    </div>
                    <div className="text-sm">{item.variant.name || "N/A"}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {selectedItems.map((item) => (
          <StockCard
            key={item.inventory_id}
            item={item}
            onRemove={() => handleRemoveItem(item.inventory_id)}
            stockValue={stockTotals[item.inventory_id] || ""} // Pass stock value to StockCard
            onStockChange={(newStock) =>
              handleStockChange(item.inventory_id, newStock)
            }
          />
        ))}
      </div>

      <div className="right-0 z-[5] mt-auto flex w-full items-center justify-between gap-3 bg-white font-bold">
        <span>TOTAL: {totalStock}</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={"lg"}
              className="bg-green py-8 text-sm font-bold text-white"
            >
              Confirm Resock
            </Button>
          </DialogTrigger>
          <DialogContent className="flex h-full max-h-[80%] w-full max-w-3xl flex-col">
            <DialogTitle>RESTOCK CONFIRMATION #{nextBatchId}</DialogTitle>

            <div className="flex w-full flex-col gap-3">
              <div className="text-gray-400 flex flex-col gap-1">
                <Label>Supplier</Label>
                <SupplierDropdown
                  suppliers={suppliers || []}
                  selectedSupplier={selectedSupplier}
                  setSelectedSupplier={setSelectedSupplier}
                />
              </div>
            </div>

            <div className="flex h-full w-full flex-col justify-between overflow-y-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Structure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.map((item) => (
                    <TableRow key={item.inventory_id}>
                      <TableCell>
                        {item.variant.item.name} -{" "}
                        {item.variant.item.brand.name} -{" "}
                        {item.variant.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {stockTotals[item.inventory_id] || 0}
                      </TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger>
                            <span className="cursor-default pl-4 text-black text-opacity-60 hover:underline">
                              <span>3</span> Conversions
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <p>Boxes</p>
                                <ArrowRight className="h-4 w-4" />
                                <p>
                                  <span>20</span> Cases
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <p>Cases</p>
                                <ArrowRight className="h-4 w-4" />
                                <p>
                                  <span>20</span> Packs
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <p>Packs</p>
                                <ArrowRight className="h-4 w-4" />
                                <p>
                                  <span>20</span> Pieces
                                </p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="bottom-0 flex w-full justify-end">
                <div className="flex items-center gap-3">
                  <span>TOTAL: {totalStock}</span>
                  <Button className="bg-green px-7 font-bold" size={"lg"}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default InvoiceAddStock;
