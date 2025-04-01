"use client";

import { ArrowLeft, ArrowRight, Search, CornerDownRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { LoadingSpinner } from "~/components/loading";
import { Button } from "~/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog-transparent";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import ItemSearch from "../_components/item-search";
import StockCardV2 from "../_components/stock-card-v2";
import SupplierDropdown from "../_components/Supplier-Dropdown";
import { Separator } from "~/components/ui/separator";
import { Toaster } from "~/components/ui/sonner";
import { toast } from "sonner";

// Define the data structure for inventory items

type StockUnit = {
  unit: string;
  conversionQty: number | string; // This should be either a number or a string, as it might come as a string
  conversionUnit: string;
  stock: string | number; // Stock could be a string or number, depending on input format
  price: string | number; // Add price field
};

type InventoryItem = {
  inventory_id: number;
  variant_id: number;
  variant: {
    name: string | undefined;
    item: {
      name: string;
      item_id: number;
      brand: {
        name: string;
      };
    };
  };
  stockUnits?: StockUnit[];
};

// Add this type definition at the top with other types
interface Supplier {
  id: string;
  company: string | null;
}

interface StockCardV2Props {
  item: {
    inventory_id: number;
    variant: {
      name: string | undefined;
      item: {
        name: string;
        brand: {
          name: string;
        };
      };
    };
  };
  onRemove: () => void;
  onStockChange: (inventoryId: number, totalStock: string) => void;
  onPriceChange: (inventoryId: number, price: string) => void;
  onUnitChange: (inventoryId: number, unit: string) => void;
  onConversionChange: (
    conversions: {
      qty: string;
      unit: string;
      price: string;
    }[],
  ) => void;
  onErrorChange: (
    inventoryId: number,
    hasError: boolean,
    errorDetails: {
      mainUnit: boolean;
      stock: boolean;
      price: boolean;
      conversions: boolean;
    },
  ) => void;
}

const InvoiceAddStock = () => {
  const router = useRouter();
  const session = useSession();

  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [stock, setStock] = useState<Record<number, string>>({}); // Stock values as strings
  const [price, setPrice] = useState<Record<number, string>>({});
  const [unit, setUnit] = useState<Record<number, string>>({});
  const [stockUnits, setStockUnits] = useState<Record<number, StockUnit[]>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog open state
  const [dialogMessage, setDialogMessage] = useState(""); // Message to display in the dialog
  const [dialogType, setDialogType] = useState("");
  const [accordionStates, setAccordionStates] = useState<
    Record<number, boolean>
  >({});
  const [conversionStates, setConversionStates] = useState<
    Record<
      number,
      {
        qty: string;
        unit: string;
        price: string;
        stock: string;
      }[]
    >
  >({});

  // Add state to track errors for each item
  const [itemErrors, setItemErrors] = useState<
    Record<
      number,
      {
        hasError: boolean;
        errorDetails: {
          mainUnit: boolean;
          stock: boolean;
          price: boolean;
          conversions: boolean;
        };
      }
    >
  >({});

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

  // Update the state type
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  // Handle selecting an item
  const handleSelectItem = (item: InventoryItem) => {
    if (
      !selectedItems.some(
        (selected) => selected.inventory_id === item.inventory_id,
      )
    ) {
      // Make sure item has all the necessary properties including item_id
      console.log("Selected item:", item); // Debug log to verify item structure

      setSelectedItems([...selectedItems, item]);
      setStock((prev) => ({ ...prev, [item.inventory_id]: "" })); // Initialize stock
    }
  };

  // Handle removing an item
  const handleRemoveItem = (inventoryId: number) => {
    setSelectedItems(
      selectedItems.filter((item) => item.inventory_id !== inventoryId),
    );
    setStock((prev) => {
      const updated = { ...prev };
      delete updated[inventoryId]; // Remove stock for the deleted item
      return updated;
    });
  };

  const handleStockChange = useCallback(
    (inventoryId: number, newStock: string) => {
      setStock((prev) => ({
        ...prev,
        [inventoryId]: newStock,
      }));
    },
    [],
  ); // Empty dependencies since it doesn't depend on any values

  const totalStock = (inventoryId: number) => {
    // Get the main stock value
    const mainStockValue = Number(stock[inventoryId] || 0);

    // Get conversions for this item
    const itemConversions = conversionStates[inventoryId] || [];

    // Sum all the conversion stock values using the actual stock field
    const conversionStockTotal = itemConversions.reduce((sum, conv) => {
      // Only include conversions with valid units and stock values
      if (conv.unit?.trim() && conv.stock?.trim()) {
        return sum + Number(conv.stock || 0);
      }
      return sum;
    }, 0);

    // Return the total
    return mainStockValue + conversionStockTotal;
  };

  const overAllTotalStock = selectedItems.reduce(
    (sum, item) => sum + totalStock(item.inventory_id),
    0,
  );

  const getConversionData = (inventoryId: number) => {
    const mainUnit = unit[inventoryId] || "";
    const mainPrice = price[inventoryId] || "0.00";
    const itemConversions = conversionStates[inventoryId] || [];

    return (
      <div className="flex flex-col gap-1">
        <div className="flex w-full items-end justify-between">
          <p className="text-sm text-slate-500">
            {mainUnit} <span className="ml-2 text-sm text-slate-400">main</span>
          </p>
          <p className="text-sm text-slate-500">
            ₱{Number(mainPrice).toFixed(2)}
          </p>
        </div>
        {itemConversions.map((conv) => (
          <div
            key={`${conv.qty}-${conv.unit}-${conv.price}`}
            className="flex w-full items-end justify-between"
          >
            <div className="flex items-center gap-2">
              <CornerDownRight
                className="h-3 w-3 text-slate-400"
                strokeWidth={2.5}
              />
              <p className="text-sm text-slate-500">
                {conv.qty} {conv.unit}
              </p>
            </div>
            <p className="text-sm text-slate-500">
              ₱{Number(conv.price || 0).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  // Modified: Get number of conversions dynamically
  const getConversionCount = (inventoryId: number) => {
    const itemConversions = conversionStates[inventoryId] || [];
    // Only count rows where both qty and unit are filled
    return itemConversions.filter(
      (conv) => conv.qty?.trim() !== "" && conv.unit?.trim() !== "",
    ).length;
  };

  // Note: this only rounds off to the second decimal at the console
  const handlePriceChange = (inventoryId: number, value: string) => {
    // Step 1: Allow only numeric input and a single decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Step 2: Ensure only one decimal point
    const decimalCount = (numericValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;

    // Step 3: Split into integer and decimal parts
    const [integerPart, decimalPart] = numericValue.split(".");

    // Step 4: Limit decimal part to 2 digits
    if (decimalPart && decimalPart.length > 2) {
      // If more than 2 decimal places, truncate to 2
      const truncatedValue = `${integerPart}.${decimalPart.slice(0, 2)}`;
      setPrice((prev) => ({
        ...prev,
        [inventoryId]: truncatedValue,
      }));
      return;
    }

    // Step 5: Update the state with the validated value
    setPrice((prev) => ({
      ...prev,
      [inventoryId]: numericValue,
    }));
  };

  const handleUnitChange = (inventoryId: number, value: string) => {
    // Allow only alphabetic characters and spaces
    const stringValue = value.replace(/[^a-zA-Z\s]/g, "");
    setUnit((prev) => ({
      ...prev,
      [inventoryId]: stringValue,
    }));
  };

  const handleStockUnitsChange = (
    inventoryId: number,
    newStockUnits: StockUnit[],
  ) => {
    setStockUnits((prev) => {
      const currentUnits = prev[inventoryId];

      if (
        !currentUnits ||
        currentUnits.length !== newStockUnits.length ||
        !currentUnits.every((unit, index) => unit === newStockUnits[index])
      ) {
        return { ...prev, [inventoryId]: newStockUnits };
      }

      return prev;
    });
  };

  const logData = () => {
    for (const item of selectedItems) {
      console.log(`Inventory ID: ${item.inventory_id}`);
      console.log(`StockUnit for item ${item.variant.item.name}:`);

      // Main unit data
      const mainStock = stock[item.inventory_id] || "";
      const mainPrice = price[item.inventory_id] || "";
      const mainUnit = unit[item.inventory_id] || "";

      console.log(`Stock Value: ${mainStock}`);
      console.log(`Price: ${mainPrice}`);
      console.log(`Unit: ${mainUnit}`);

      // Calculate and display total stock
      const totalItemStock = totalStock(item.inventory_id);
      console.log(
        `Total Stock for ${item.variant.item.name}: ${totalItemStock}`,
      );

      // Get conversions for this item
      const itemConversions = conversionStates[item.inventory_id] || [];

      // Create stockUnits array that properly represents the conversion chain
      const stockUnitsData: StockUnit[] = [];

      // Create the main unit entry with conversion to the first conversion unit
      stockUnitsData.push({
        unit: mainUnit,
        stock: mainStock,
        price: mainPrice,
        conversionQty: itemConversions[0]?.qty || "",
        conversionUnit: itemConversions[0]?.unit || "",
      });

      // Add each conversion linked to the next one in the chain
      for (let i = 0; i < itemConversions.length; i++) {
        const currentConv = itemConversions[i];
        if (!currentConv) continue; // Skip if undefined

        const nextConv = itemConversions[i + 1];
        stockUnitsData.push({
          unit: currentConv.unit,
          stock: currentConv.stock || "", // Use the actual stock value, not qty
          price: currentConv.price,
          conversionQty: nextConv?.qty || "",
          conversionUnit: nextConv?.unit || "",
        });
      }

      console.log("StockUnits Data:");
      stockUnitsData.forEach((unit, index) => {
        console.log(`StockUnit ${index + 1}: `, unit);
      });

      // Update the stockUnits state for this item
      handleStockUnitsChange(item.inventory_id, stockUnitsData);
    }
  };

  const { mutateAsync: saveRestock, isPending: test } =
    api.restock.saveRestock.useMutation();
  const handleSave = async (
    selectedItems: InventoryItem[],
    supplierId: string,
  ) => {
    if (!supplierId) {
      setDialogMessage("Supplier ID is missing. Please select a supplier.");
      setDialogType("error");
      setIsDialogOpen(true);
      return;
    }

    try {
      // First, ensure all stockUnits data is up-to-date
      for (const item of selectedItems) {
        const inventoryId = item.inventory_id;
        const mainUnit = unit[inventoryId] || "";
        const mainStock = stock[inventoryId] || "";
        const mainPrice = price[inventoryId] || "";
        const itemConversions = conversionStates[inventoryId] || [];

        // Create stockUnits array with proper conversions
        const updatedStockUnits: StockUnit[] = [];

        // Main unit
        updatedStockUnits.push({
          unit: mainUnit,
          stock: mainStock,
          price: mainPrice,
          conversionQty: itemConversions[0]?.qty || "",
          conversionUnit: itemConversions[0]?.unit || "",
        });

        // Conversion units
        for (let i = 0; i < itemConversions.length; i++) {
          const currentConv = itemConversions[i];
          if (!currentConv) continue;

          const nextConv = itemConversions[i + 1];
          updatedStockUnits.push({
            unit: currentConv.unit,
            stock: currentConv.stock, // Use the actual stock value, not qty
            price: currentConv.price,
            conversionQty: nextConv?.qty || "",
            conversionUnit: nextConv?.unit || "",
          });
        }

        // Update stockUnits state
        handleStockUnitsChange(inventoryId, updatedStockUnits);
      }

      // Now proceed with creating the payload with total stock accurately calculated
      const payload = selectedItems.map((item) => ({
        inventory_id: item.inventory_id,
        variant_id: item.variant_id,
        totalStock: totalStock(item.inventory_id),
        stockValue: Number(stock[item.inventory_id]) || 0,
        stockUnits:
          stockUnits[item.inventory_id]?.map((stockUnit) => ({
            stock: Number(stockUnit.stock),
            price: Number(stockUnit.price) || 0,
            unit: stockUnit.unit,
            conversionQty: Number(stockUnit.conversionQty) || 0,
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

  const handleConversionChange = (
    inventoryId: number,
    conversions: { qty: string; unit: string; price: string; stock: string }[],
  ) => {
    setConversionStates((prev) => ({
      ...prev,
      [inventoryId]: conversions,
    }));
  };

  // Add error states and notify parent
  const handleItemError = (
    inventoryId: number,
    hasError: boolean,
    errorDetails: {
      mainUnit: boolean;
      stock: boolean;
      price: boolean;
      conversions: boolean;
    },
  ) => {
    setItemErrors((prev) => ({
      ...prev,
      [inventoryId]: { hasError, errorDetails },
    }));
  };

  if (isLoading || isLoadingBatch) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
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

  const getFormValidation = () => {
    const invalidItems = selectedItems.filter((item) => {
      // Check main inputs
      const hasMissingMainInputs =
        !stock[item.inventory_id] ||
        !price[item.inventory_id] ||
        !unit[item.inventory_id];

      // Check conversion fields
      const itemConversions = conversionStates[item.inventory_id] || [];
      const hasInvalidConversions = itemConversions.some((conv) => {
        // Check if either qty or unit is filled but not both
        const hasQty = conv.qty?.trim() !== "";
        const hasUnit = conv.unit?.trim() !== "";
        return (
          (hasQty && !hasUnit) || (!hasQty && hasUnit) || (!hasQty && !hasUnit)
        );
      });

      return hasMissingMainInputs || hasInvalidConversions;
    });

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
    };
  };

  const handleConfirmRestock = (e: React.MouseEvent) => {
    // Get items with errors
    const itemsWithErrors = selectedItems.filter(
      (item) => itemErrors[item.inventory_id]?.hasError,
    );

    if (itemsWithErrors.length > 0) {
      e.preventDefault(); // Prevent dialog from opening

      // Track which items we've shown toasts for to avoid duplicates
      const shownToasts = new Set<number>();

      // Show error toasts for each item with errors
      for (const item of itemsWithErrors) {
        const errors = itemErrors[item.inventory_id]?.errorDetails;
        if (!errors) continue;

        const itemId = item.inventory_id;
        const itemName = `${item.variant.item.name} - ${item.variant.item.brand.name} - ${item.variant.name || "N/A"}`;

        // Main inputs errors
        if (
          (errors.mainUnit || errors.stock || errors.price) &&
          !shownToasts.has(itemId)
        ) {
          toast("❌ Missing main inputs", {
            description: `Please fill in all main fields for:\n${itemName}`,
            duration: 4000,
          });
          shownToasts.add(itemId);
        }

        // Conversion errors
        if (errors.conversions && !shownToasts.has(itemId)) {
          toast("❌ Incomplete conversions", {
            description: `Please complete or remove empty conversions for:\n${itemName}`,
            duration: 4000,
          });
          shownToasts.add(itemId);
        }
      }
      return false; // Indicate that there were errors
    }

    return true; // Indicate that validation passed
  };

  if (isLoading) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  if (test) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="flex h-auto w-screen flex-col gap-3 p-10">
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

              <div className="mt-4 flex w-full items-center justify-center gap-3">
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
                    className="border-gray-300 text-gray-700 border-2 bg-white p-3 hover:bg-green"
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
          <span className="text-gray-400 ml-3 text-sm font-light">
            #{nextBatchId}
          </span>
        </div>
      </div>

      <div className="flex w-full justify-center gap-3">
        <div className="relative flex w-full max-w-md items-center justify-center">
          <ItemSearch
            filteredItems={inventoryItems}
            onItemSelect={handleSelectItem}
          />
        </div>
      </div>

      {selectedItems.length > 0 ? (
        <ScrollArea className="h-full">
          <div className="mt-4 grid grid-cols-2 gap-4">
            {selectedItems.map((item) => (
              <StockCardV2
                key={item.inventory_id}
                item={item}
                onRemove={() => handleRemoveItem(item.inventory_id)}
                onStockChange={handleStockChange}
                onPriceChange={handlePriceChange}
                onUnitChange={handleUnitChange}
                onConversionChange={(conversions) =>
                  handleConversionChange(item.inventory_id, conversions)
                }
                onErrorChange={handleItemError}
              />
            ))}
          </div>
          <Toaster
            toastOptions={{
              style: {
                width: "500px",
                padding: "12px",
                color: "#475569",
                fontSize: "16px",
                bottom: "80px",
                right: "12px",
                background: "white",
                border: "1px solid #E5E7EB",
                boxShadow: "none",
              },
            }}
          />
        </ScrollArea>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Search className="h-20 w-20 text-slate-400" />
            <p className="text-slate-400">
              Search and select an item to get started.
            </p>
          </div>
        </div>
      )}

      <Separator className="h-px" />
      <div className="right-0 z-[5] flex w-full items-center justify-between bg-white">
        <div className="flex flex-col">
          <p className="text-xl text-slate-500">{overAllTotalStock} </p>
          <span className="text-sm italic text-slate-400">Total Stock</span>
        </div>
        <Button
          size={"lg"}
          className="bg-green py-8 text-sm font-bold text-white"
          onClick={() => {
            // Update stockUnits with actual conversion and stock data
            for (const item of selectedItems) {
              const inventoryId = item.inventory_id;
              const mainUnit = unit[inventoryId] || "";
              const mainStock = stock[inventoryId] || "";
              const mainPrice = price[inventoryId] || "";
              const itemConversions = conversionStates[inventoryId] || [];

              // Ensure all conversion items have stock values
              const validatedConversions = itemConversions.map((conv) => {
                // Make sure stock is initialized to at least "0" if it's empty
                if (
                  conv.stock === undefined ||
                  conv.stock === null ||
                  conv.stock === ""
                ) {
                  return {
                    ...conv,
                    stock: "0",
                  };
                }
                return conv;
              });

              // Update conversion states if any changes were made
              if (
                validatedConversions.some(
                  (conv, i) => conv.stock !== itemConversions[i]?.stock,
                )
              ) {
                setConversionStates((prev) => ({
                  ...prev,
                  [inventoryId]: validatedConversions,
                }));
              }

              // Create stockUnits array that properly represents the conversion chain
              const stockUnitsData: StockUnit[] = [];

              // Main unit with conversion to the first conversion unit
              stockUnitsData.push({
                unit: mainUnit,
                stock: mainStock,
                price: mainPrice,
                conversionQty: validatedConversions[0]?.qty || "",
                conversionUnit: validatedConversions[0]?.unit || "",
              });

              // Add each conversion with link to the next one
              for (let i = 0; i < validatedConversions.length; i++) {
                const currentConv = validatedConversions[i];
                if (!currentConv) continue;

                const nextConv = validatedConversions[i + 1];
                stockUnitsData.push({
                  unit: currentConv.unit,
                  stock: currentConv.stock || "0", // Use the actual stock value with fallback
                  price: currentConv.price,
                  conversionQty: nextConv?.qty || "",
                  conversionUnit: nextConv?.unit || "",
                });
              }

              // Update stockUnits state
              handleStockUnitsChange(inventoryId, stockUnitsData);
            }

            // Now show logs with the updated data
            logData();
          }}
        >
          Show Logs
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={"lg"}
              className={`bg-green text-white hover:bg-green/80 ${selectedItems.length === 0 ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={(e) => {
                const validationPassed = handleConfirmRestock(e);
                if (!validationPassed) {
                  e.preventDefault(); // Prevent dialog from opening if validation failed
                }
              }}
              disabled={selectedItems.length === 0}
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
                        {item.variant.item.name} -{" "}
                        {item.variant.item.brand.name} -{" "}
                        {item.variant.name || "N/A"}
                      </TableCell>
                      <TableCell>{totalStock(item.inventory_id)}</TableCell>
                      {/*<TableCell>{stock[item.inventory_id] || 0}</TableCell> //replace this part to totalStock*/}
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger>
                            <span className="cursor-default pl-4 text-black text-opacity-60 hover:underline">
                              <span>
                                {getConversionCount(item.inventory_id)}
                              </span>{" "}
                              Conversions
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
                      if (!selectedSupplier?.id) {
                        alert("Please select a supplier before saving.");
                        return;
                      }
                      console.log(
                        "Selected Supplier:",
                        selectedSupplier.company,
                        "ID:",
                        selectedSupplier.id,
                      );
                      logData();
                      handleSave(selectedItems, selectedSupplier.id);
                    }}
                    disabled={!selectedSupplier || test}
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
