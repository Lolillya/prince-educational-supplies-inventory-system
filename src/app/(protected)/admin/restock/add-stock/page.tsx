"use client";

import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import StockCard from "../_components/stock-card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog-transparent";
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
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../_components/Hover-Card"
import { useSession } from "next-auth/react";

// Define the data structure for inventory items

type StockUnit = {
  unit: string;
  conversionQty: number | string; // This should be either a number or a string, as it might come as a string
  conversionUnit: string;
  stock: string | number; // Stock could be a string or number, depending on input format
};

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
  stockUnits?: StockUnit[]; // Optional, as not all items may have stock units
};


const InvoiceAddStock = () => {
  const router = useRouter();
  const session = useSession();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [stock, setStock] = useState<{ [key: number]: string }>({}); // Stock values as strings
  const [price, setPrice] = useState<{ [key: number]: string }>({});
  const [unit, setUnit] = useState<{ [key: number]: string }>({});
  const [stockUnits, setStockUnits] = useState<{ [key: number]: string }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog open state
  const [dialogMessage, setDialogMessage] = useState(""); // Message to display in the dialog
  const [dialogType, setDialogType] = useState("");
  const [accordionStates, setAccordionStates] = useState<{ [key: number]: boolean }>({});

  const { data: inventoryItems, isLoading, isError } =
      api.inventory.listInventory.useQuery();

  // Fetch the next available batch_id
  const { data: nextBatchId, isLoading: isLoadingBatch, isError: isErrorBatch } =
      api.restock.getBatchId.useQuery();

  const { data: suppliers } =
      api.restock.getSuppliers.useQuery();

  const [selectedSupplier, setSelectedSupplier] = useState("");

  // Filter inventory items based on the search term
  useEffect(() => {
    if (searchTerm && inventoryItems) {
      const results = inventoryItems.filter((item: InventoryItem) =>
          item.variant.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.variant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.variant.item.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(results);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, inventoryItems]);

  // Handle selecting an item
  const handleSelectItem = (item: InventoryItem) => {
    if (!selectedItems.some((selected) => selected.inventory_id === item.inventory_id)) {
      setSelectedItems([...selectedItems, item]);
      setStock((prev) => ({ ...prev, [item.inventory_id]: "" })); // Initialize stock
    }
    setSearchTerm(""); // Clear the search term to hide the dropdown
  };

  // Handle removing an item
  const handleRemoveItem = (inventoryId: number) => {
    setSelectedItems(selectedItems.filter((item) => item.inventory_id !== inventoryId));
    setStock((prev) => {
      const updated = { ...prev };
      delete updated[inventoryId]; // Remove stock for the deleted item
      return updated;
    });
  };

  const handleStockChange = (inventoryId: number, newStock: string) => {
    setStock((prev) => ({
      ...prev,
      [inventoryId]: newStock, // Update stock for the specific item
    }));
  };

  const totalStock = (inventoryId: number) => {
    const stockValue = Number(stock[inventoryId] || 0);
    const itemStockUnits = stockUnits[inventoryId] || [];

    // Skip the first row when reducing
    return itemStockUnits.slice(1).reduce((acc, unit) => {
      const unitStock = Number(unit.stock || 0);
      return acc + unitStock;
    }, stockValue);
  };

  const overAllTotalStock = selectedItems.reduce(
      (sum, item) => sum + totalStock(item.inventory_id),
      0
  );


  const getConversionData = (inventoryId: number) => {
    const itemStockUnits = stockUnits[inventoryId] || [];
    return itemStockUnits
        .filter((unit) => unit.conversionQty?.trim() && unit.conversionUnit?.trim())
        .map((unit, index) => {
          const previousUnit = index > 0 ? itemStockUnits[index - 1] : null;
          const currentUnit = previousUnit ? previousUnit.conversionUnit : unit.unit;
          return (
              <div key={index} className="flex gap-2 items-center">
                <p>{currentUnit}</p>
                <ArrowRight className="w-4 h-4" />
                <p>
                  <span>{unit.conversionQty}</span> {unit.conversionUnit}
                </p>
              </div>
          );
        });
  };

  // Modified: Get number of conversions dynamically
  const getConversionCount = (inventoryId: number) => {
    const itemStockUnits = stockUnits[inventoryId] || [];
    // Only count rows where both conversionQty and conversionUnit are filled
    return itemStockUnits.filter(
        (unit) => unit.conversionQty?.trim() && unit.conversionUnit?.trim()
    ).length;
  };

  const handlePriceChange = (inventoryId: number, newPrice: string) => {
    setPrice((prev) => ({ ...prev, [inventoryId]: newPrice }));
  };

  const handleUnitChange = (inventoryId: number, newUnit: string) => {
    setUnit((prev) => ({ ...prev, [inventoryId]: newUnit }));
  };
  const handleStockUnitsChange = (inventoryId: number, newStockUnits: any[]) => {
    setStockUnits((prev) => {
      const currentUnits = prev[inventoryId];

      if (!currentUnits || currentUnits.length !== newStockUnits.length || !currentUnits.every((unit, index) => unit === newStockUnits[index])) {
        return { ...prev, [inventoryId]: newStockUnits };
      }

      return prev;
    });
  };

  const logData = () => {
    selectedItems.forEach((item) => {
      console.log(`Inventory ID: ${item.inventory_id}`);  // Log inventory ID
      console.log(`StockUnit for item ${item.variant.item.name}:`);
      console.log(`Stock Value: ${stock[item.inventory_id] || ''}`);
      console.log(`Price: ${price[item.inventory_id] || 'undefined'}`);
      console.log(`Unit: ${unit[item.inventory_id] || 'undefined'}`);

      const totalItemStock = totalStock(item.inventory_id); // Get the total stock for the item
      console.log(`Total Stock for ${item.variant.item.name}: ${totalItemStock}`);

      const itemStockUnits = stockUnits[item.inventory_id] || [];
      console.log("StockUnits Data:");
      itemStockUnits.forEach((unit, index) => {
        if (!unit.unit) {
          unit.unit = index > 0 ? itemStockUnits[index - 1].conversionUnit : unit.unit;
        }
        console.log(`StockUnit ${index + 1}: `, unit);
      });
    });
  };

  const { mutateAsync: saveRestock } = api.restock.saveRestock.useMutation();
  const handleSave = async (selectedItems, supplierId) => {
    if (!supplierId) {
      setDialogMessage("Supplier ID is missing. Please select a supplier.");
      setDialogType("error");
      setIsDialogOpen(true);
      return;
    }

    try {
      const payload = selectedItems.map((item) => ({
        inventory_id: item.inventory_id,
        variant_id: item.variant_id,
        totalStock: totalStock(item.inventory_id),
        stockValue: Number(stock[item.inventory_id]) || 0, // Ensure it's a number here
        stockUnits: stockUnits[item.inventory_id]?.map((stockUnit) => ({
          stock: Number(stockUnit.stock), // Ensure numeric values
          price: Number(stockUnit.price),
          unit: stockUnit.unit,
          conversionQty: Number(stockUnit.conversionQty),
          conversionUnit: stockUnit.conversionUnit,
        })) || [],
      }));

      console.log("Payload before mutation:", payload);

      // Add restock_clerk to the payload
      const restockClerk = session.data?.user.id ?? "";

      // Perform mutation (save data)
      await saveRestock({ selectedItems: payload, supplierId, restockClerk });

      // Show success dialog
      setDialogMessage("Restock data saved successfully!");
      setDialogType("success");
      setIsDialogOpen(true);

      // Redirect to /admin/restock after success
      setTimeout(() => {
        router.push("/admin/restock");
      }, 2000); // Delay redirect to let the user see the success message

    } catch (error) {
      console.error("Error saving restock data:", error);
      setDialogMessage("Failed to save restock data.");
      setDialogType("error");
      setIsDialogOpen(true);
    }
  };
  //
  // const handleSave = async (selectedItems, supplierId) => {
  //   if (!supplierId) {
  //     setDialogMessage("Supplier ID is missing. Please select a supplier.");
  //     setDialogType("error");
  //     setIsDialogOpen(true);
  //     return;
  //   }
  //
  //   try {
  //     const payload = selectedItems.map((item) => ({
  //       inventory_id: item.inventory_id,
  //       variant_id: item.variant_id,
  //       totalStock: totalStock(item.inventory_id),
  //       stockValue: Number(stock[item.inventory_id]) || 0, // Ensure it's a number here
  //       stockUnits: stockUnits[item.inventory_id]?.map((stockUnit) => ({
  //         stock: Number(stockUnit.stock),
  //         price: Number(stockUnit.price),
  //         unit: stockUnit.unit,
  //         conversionQty: Number(stockUnit.conversionQty),
  //         conversionUnit: stockUnit.conversionUnit,
  //       })) || [],
  //     }));
  //
  //
  //     console.log("Payload before mutation:", payload);
  //
  //     // Perform mutation (save data)
  //     await saveRestock({ selectedItems: payload, supplierId });
  //
  //     // Show success dialog
  //     setDialogMessage("Restock data saved successfully!");
  //     setDialogType("success");
  //     setIsDialogOpen(true);
  //
  //     // Redirect to /admin/restock after success
  //     setTimeout(() => {
  //       router.push("/admin/restock");
  //     }, 2000); // Delay redirect to let the user see the success message
  //
  //   } catch (error) {
  //     console.error("Error saving restock data:", error);
  //     setDialogMessage("Failed to save restock data.");
  //     setDialogType("error");
  //     setIsDialogOpen(true);
  //   }
  // };




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

  const isFormValid = () => {
    const hasIncompleteParentFields = selectedItems.some(
        (item) =>
            !stock[item.inventory_id] || !price[item.inventory_id] || !unit[item.inventory_id]
    );

    // Check for incomplete or inconsistent child fields
    const hasIncompleteChildFields = selectedItems.some((item) => {
      const itemStockUnits = stockUnits[item.inventory_id] || [];
      const isExpanded = accordionStates[item.inventory_id]; // Check expansion state

      return (
          isExpanded && // Only validate child rows if accordion is expanded
          itemStockUnits.some(
              (unit) =>
                  // Invalid if either field is empty while the other is filled
                  (unit.conversionQty?.trim() && !unit.conversionUnit?.trim()) ||
                  (!unit.conversionQty?.trim() && unit.conversionUnit?.trim())
          )
      );
    });

    // Form is valid if no parent or child fields are incomplete
    return !hasIncompleteParentFields && !hasIncompleteChildFields;
  };

  return (
      <section className={`flex h-auto w-screen flex-col gap-3 p-10`}>
        <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
          <div className="flex items-center gap-1">
              {/* Dialog Component */}
              <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                <DialogContent className="max-h- flex w-full max-w-lg flex-col p-6">
                  <DialogTitle className="text-center">Status</DialogTitle>
                  <DialogHeader>
                    <div className="flex w-full justify-center text-center text-lg">
                      <span>{dialogMessage}</span>
                    </div>
                  </DialogHeader>

                  <div className="flex w-full items-center justify-center gap-3 mt-4">
                    <Button
                        size={"lg"}
                        className={`border-2 p-3 ${dialogType === "error" ? "border-red-500 bg-red-100 text-red-700" : "border-green-500 bg-green-100 text-green-700"}`}
                        onClick={() => setIsDialogOpen(false)}
                    >
                      Close
                    </Button>
                    {dialogType === "success" && (
                        <Button
                            size={"lg"}
                            className="border-2 border-gray-300 bg-white p-3 text-gray-700 hover:bg-green"
                            onClick={() => setIsDialogOpen(false)}
                        >
                          Ok
                        </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

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
            <span className="text-gray-400 ml-3 text-sm font-light">#{nextBatchId}</span>
          </div>
        </div>


        <div className="flex w-full justify-center gap-3">
          <div className="relative flex w-full max-w-md items-center justify-center">
            <Search className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 transform"/>
            <Input
                placeholder="Search"
                className="bg-gray p-5 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && filteredItems.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white shadow-md z-10">
                  <ul>
                    {filteredItems.map((item) => (
                        <li
                            key={item.inventory_id}
                            className="cursor-pointer p-2 hover:bg-gray-100"
                            onClick={() => handleSelectItem(item)}
                        >
                          <div className="font-bold">{item.variant.item.name}</div>
                          <div className="text-gray-500">{item.variant.item.brand.name}</div>
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
                  stockValue={stock[item.inventory_id] || ""}
                  onStockChange={(newStock) => handleStockChange(item.inventory_id, newStock)}
                  onPriceChange={(newPrice) => handlePriceChange(item.inventory_id, newPrice)}
                  onUnitChange={(newUnit) => handleUnitChange(item.inventory_id, newUnit)}
                  onStockUnitsChange={(newStockUnits) => handleStockUnitsChange(item.inventory_id, newStockUnits)}
                  onAccordionToggle={(isExpanded) =>
                      setAccordionStates((prev) => ({
                        ...prev,
                        [item.inventory_id]: isExpanded,
                      }))
                  } // Pass state toggle callback
              />
          ))}
        </div>

        <div className="right-0 z-[5] mt-auto flex w-full items-center justify-between gap-3 bg-white font-bold">
          <span>TOTAL: {overAllTotalStock}</span>
          {/*<Button*/}
          {/*    size={"lg"}*/}
          {/*    className="bg-green py-8 text-sm font-bold text-white"*/}
          {/*    onClick={logData} // Trigger the log function*/}
          {/*>*/}
          {/*  Show Logs*/}
          {/*</Button>*/}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                    size={"lg"}
                    className={`py-8 text-sm font-bold text-white bg-green ${
                        isFormValid() && selectedItems.length > 0
                            ? ""
                            : "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!isFormValid() || selectedItems.length === 0} // Disable if form is invalid or no items are selected
                >
                  Confirm Restock
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
                              {item.variant.item.name} - {item.variant.item.brand.name} -{" "}
                              {item.variant.name || "N/A"}
                            </TableCell>
                            <TableCell>{totalStock(item.inventory_id)}</TableCell>
                            {/*<TableCell>{stock[item.inventory_id] || 0}</TableCell> //replace this part to totalStock*/}
                            <TableCell>
                              <HoverCard>
                                <HoverCardTrigger>
                        <span className="pl-4 text-black text-opacity-60 hover:underline cursor-default">
                          <span>{getConversionCount(item.inventory_id)}</span> Conversions
                        </span>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                  <div className="flex flex-col gap-2">
                                    {getConversionData(item.inventory_id)}
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
                      <span>TOTAL: {overAllTotalStock}</span>
                      <Button
                          className="bg-green px-7 font-bold"
                          size={"lg"}
                          onClick={() => {
                            if (!selectedSupplier) {
                              alert("Please select a supplier before saving.");
                              return;
                            }
                            console.log("Selected Supplier:", selectedSupplier?.name, "ID:", selectedSupplier?.id);
                            logData();
                            handleSave(selectedItems, selectedSupplier.id);
                          }}
                      >
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
