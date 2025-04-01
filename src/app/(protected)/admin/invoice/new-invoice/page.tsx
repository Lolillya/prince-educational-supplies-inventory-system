"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { ArrowLeft, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import InvoiceCard from "../_components/invoice-card-copy";

type InventoryItem = {
  inventory_id: number;
  variant: {
    name: string | null;
    variant_id: number;
    BatchVariant: Array<{
      batch_variant_id: number;
      quantity: number;
      batch: {
        quantity: number;
      };
      SupplierUnit: Array<{
        price: number;
        quantity_per_unit: number;
        unit_id: number;
        unit: {
          name: string;
          unit_id: number;
        };
        ConversionRate: {
          conversion_rate: number;
          toUnit: {
            name: string;
          };
        }[];
      }>;
    }>;
    item: {
      name: string;
      brand: {
        name: string;
      };
    };
  };
};

type SupplierProps = {
  Personal_Details: {
    company: string | null;
    personal_details_id: string;
    term: number | null;
  };
};

const NewInvoice = () => {
  const router = useRouter();
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierProps>();
  const [filteredSupplier, setFilteredSupplier] = useState<SupplierProps[]>([]);
  const [term, setTerm] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [activeCards, setActiveCards] = useState<
    Record<
      string,
      {
        totalPrice: number;
        unitPrice: number;
        quantity: number;
        available: number;
        discount: number;
        discountType: string;
        selectedUnit: {
          unitName: string;
          unit_id: number;
          supplier_unit_id: number;
        };
        itemName: string;
        brandName: string;
        variant: string;
        variant_id: number;
        unit_id: number;
      }
    >
  >({});

  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState("%");
  const [stockTotals, setStockTotals] = useState<Record<number, string>>({});
  const [isAutoRestock, setIsAutoRestock] = useState<boolean>(false);
  const [isBatchAutoRestock, setIsBatchAutoRestock] = useState<boolean>(false);
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [isInputFocused, setIsInputFocused] = useState<string | undefined>(
    undefined,
  );
  const [showSearchDropdown, setShowSearchDropdown] = useState(true);

  const {
    data: inventoryItems,
    isLoading: loadingInventory,
    isError,
  } = api.invoice.getItems.useQuery();

  const { data: customerList, isLoading: loadingCustomers } =
    api.invoice.getCustomers.useQuery();
  const { data: nextInvoiceId, isLoading: loadingInvoiceId } =
    api.invoice.getInvoiceId.useQuery();
  const { mutateAsync: createInvoice, isPending: isInvoicePending } =
    api.invoice.createInvoiceWithLineItems.useMutation({
      onSuccess: (data) => {
        console.log("Invoice created successfully:", data);
        toast({
          title: "Success",
          description: "Invoice created successfully!",
          variant: "default",
          className: "bg-green text-white",
        });
        router.push("/admin/invoice");
      },
    });
  const { data: units } = api.invoice.getUnits.useQuery();

  const updateCardDetails = (
    id: number,
    totalPrice: number,
    unitPrice: number,
    quantity: number,
    available: number,
    discount: number,
    discountType: string,
    selectedUnit: {
      unitName: string;
      unit_id: number;
      supplier_unit_id: number;
    },
    itemName: string,
    brandName: string,
    variant: string,
    variant_id: number,
  ) => {
    setActiveCards((prev) => ({
      ...prev,
      [id]: {
        totalPrice,
        unitPrice,
        quantity,
        discount,
        available,
        discountType,
        selectedUnit,
        itemName,
        brandName,
        variant,
        variant_id,
      },
    }));
  };

  const calculateGrandTotal = () => {
    // Calculate total from activeCards
    let total = Object.values(activeCards).reduce(
      (sum, card) => sum + card.totalPrice,
      0,
    );

    // Apply discount after calculating total
    if (discount !== 0) {
      total =
        discountType === "%"
          ? total * (1 - Number(discount) / 100) // Apply percentage discount
          : total - Number(discount); // Apply fixed discount
    }

    // Ensure total is not negative
    total = Math.max(0, total);

    setGrandTotal(total);
  };

  const handleAutoRestock = (checked: boolean) => {
    setIsAutoRestock(checked);
  };

  const handleSaveInvoice = async () => {
    if (!selectedItems || !activeCards) {
      toast({
        title: "Warning",
        description: "Select an item to save the invoice!",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      invoice: {
        term: term,
        customerNotes: customerNotes,
        customer_id:
          selectedSupplier?.Personal_Details.personal_details_id ?? "",
        invoice_clerk: session.data?.user.id ?? "",
        total_amount: grandTotal,
        discount: 0,
        status: "PENDING",
        isAutoRestock: isAutoRestock,
        isBatchAutoRestock,
      },
      lineItems: Object.entries(activeCards).map((item) => ({
        supplier_unit_id: item[1].selectedUnit.supplier_unit_id,
        variant_id: item[1].variant_id,
        quantity: item[1].quantity,
        available: item[1].available,
        unit_price: item[1].unitPrice,
        total_price: item[1].totalPrice,
        unit_id: item[1].selectedUnit.unit_id,
      })),
    };

    console.log("InvoiceData:", invoiceData);

    try {
      await createInvoice(invoiceData);
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message?: string }).message ?? errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRemoveBatch = (id: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.inventory_id !== id));

    setActiveCards((prev) => {
      const updatedCards = { ...prev };
      delete updatedCards[id];
      return updatedCards;
    });
  };

  const handleOnFocus = () => {
    setIsInputFocused(undefined);
  };

  const handleOnMouseLeave = () => {
    setIsInputFocused("item-1");
  };

  const handleSelectedSupplier = (supplier: SupplierProps) => {
    setSupplierSearchTerm(supplier.Personal_Details.company ?? "");
    setSelectedSupplier(supplier);
    setTerm(supplier.Personal_Details.term?.toString() ?? "");
    // console.log(supplier.Personal_Details.term);
  };

  const handleSelectItem = (item: InventoryItem) => {
    if (selectedItems.length >= 10) {
      toast({
        title: "Error",
        description: "Cannot add more than 10 items.",
        variant: "destructive",
      });
      return;
    }

    if (
      selectedItems.some(
        (selected) => selected.inventory_id === item.inventory_id,
      )
    ) {
      toast({
        title: "Warning",
        description: "Item already added.",
        variant: "destructive",
      });
      return;
    }

    setSelectedItems([...selectedItems, item]);
    setStockTotals((prev) => ({ ...prev, [item.inventory_id]: "" }));
    setSearchTerm("");
  };

  useEffect(() => {
    calculateGrandTotal();
  }, [activeCards, discount]);

  useEffect(() => {
    if (searchTerm && inventoryItems) {
      const result = inventoryItems.filter(
        (item) =>
          item.variant.item.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.variant.item.brand.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredItems(result);
    } else setFilteredItems([]);

    if (supplierSearchTerm) {
      const result =
        customerList?.filter((customer) =>
          customer.Personal_Details.company
            ?.toLowerCase()
            .includes(supplierSearchTerm),
        ) ?? [];
      setFilteredSupplier(result ?? []);
    } else setFilteredSupplier([]);
  }, [selectedItems, searchTerm, inventoryItems, supplierSearchTerm]);

  if (loadingInventory || loadingCustomers || loadingInvoiceId) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className={`flex h-auto w-screen flex-col gap-3 p-10`}>
      <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <ArrowLeft
                size={25}
                color="#00B69B"
                className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center">
              <DialogTitle className="text-center">Confirm</DialogTitle>
              <div className="max-w-sm text-center">
                <span>
                  You have unsaved changes. Are you sure you want to leave this
                  page?
                </span>
              </div>

              <div className="flex w-full justify-center gap-2">
                <Button
                  className="border-2 border-green bg-transparent font-bold text-green"
                  size={"lg"}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green font-bold"
                  size={"lg"}
                  onClick={() => router.push("/admin/invoice")}
                >
                  Leave
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <span className="font-bold">NEW INVOICE</span>
          <span className="text-gray-400 ml-3 text-sm font-light">
            #{nextInvoiceId}
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => {
              handleOnFocus();
              setShowSearchDropdown(true);
            }}
            onBlur={(e) => {
              handleOnMouseLeave();
              setTimeout(() => {
                setShowSearchDropdown(false);
              }, 200);
            }}
          />
          {searchTerm && filteredItems.length > 0 && showSearchDropdown && (
            <div className="absolute top-full z-10 mt-2 w-full rounded-lg bg-white p-3 shadow-md">
              <ul className="max-h-64 overflow-auto">
                {filteredItems.map((item) => (
                  <li
                    key={item.inventory_id}
                    className="flex cursor-pointer items-center rounded-lg p-3 hover:bg-gray"
                    onClick={() => handleSelectItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelectItem(item);
                      }
                    }}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs">
                          {item.variant.item.name} -
                        </Label>
                        <Label className="text-xs">
                          {item.variant.item.brand.name} -
                        </Label>
                        <Label className="text-xs">
                          {item.variant.name || "N/A"}
                        </Label>
                      </div>

                      <Label className="text-xs text-textGray">
                        {item.variant.BatchVariant.length} Batche/s
                      </Label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-4 grid h-fit w-full auto-rows-auto grid-cols-3 gap-3 overflow-y-auto">
        {selectedItems.map((item, index) => {
          return (
            <InvoiceCard
              isInputFocused={isInputFocused}
              key={index}
              id={item.inventory_id}
              itemName={item.variant.item.name}
              brandName={item.variant.item.brand.name}
              variant={item.variant.name}
              variant_id={item.variant.variant_id}
              BatchVariant={item.variant.BatchVariant}
              onRemove={handleRemoveBatch}
              updateCardDetails={updateCardDetails}
              handleAutoRestock={handleAutoRestock}
              isAutoRestock={isAutoRestock}
              BatchAutoRestock={setIsBatchAutoRestock}
              units={units}
            />
          );
        })}

        {selectedItems.length === 0 && (
          <Label className="absolute w-full self-center text-center">
            Search and add an item to get started.
          </Label>
        )}
      </div>

      <div className="right-0 z-[5] mt-auto flex w-full items-center justify-between gap-3 bg-white font-bold">
        <div className="flex items-center">
          <span>TOTAL: ₱ {grandTotal.toFixed(2)}</span>
          <div className="ml-20 flex">
            <div className="relative flex items-center justify-end">
              <Input
                className="rounded-r-none border font-light shadow-none placeholder:font-light"
                placeholder="Discount"
                value={discount.toString()}
                onChange={(e) => setDiscount(Number(e.target.value))}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^0-9]/g,
                    "",
                  );
                }}
              />
            </div>
            <Select
              value={discountType}
              onValueChange={(value) => setDiscountType(value)}
            >
              <SelectTrigger className="rounded-l-none">
                <SelectValue placeholder="%" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="%">%</SelectItem>
                <SelectItem value="Fixed">Fixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-green py-8 text-sm font-bold text-white hover:cursor-pointer"
              disabled={
                selectedItems.length === 0 ||
                Object.keys(activeCards).length === 0 ||
                Object.values(activeCards).some(
                  (card) => card.quantity === 0 || card.unitPrice === 0,
                )
              }
            >
              Confirm Invoice
            </Button>
          </DialogTrigger>
          <DialogContent
            className={`flex h-full ${isInvoicePending ? "max-h-[40%]" : "max-h-[80%]"} w-full max-w-3xl flex-col transition-all duration-300`}
          >
            {isInvoicePending ? (
              <div className="flex h-full w-full items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <DialogTitle>
                  ORDER CONFIRMATION{" "}
                  <span className="text-gray-400 text-m ml-3 font-light">
                    #{nextInvoiceId}
                  </span>
                </DialogTitle>
                <div className="flex w-full flex-col gap-3">
                  <div className="text-gray-400 flex flex-col gap-1">
                    <Label>Customer & Term</Label>
                    <div className="relative flex w-full items-center">
                      <Input
                        placeholder="Business Name"
                        className="bg-emerald-100 text-black placeholder-slate-500"
                        value={supplierSearchTerm}
                        onChange={(e) => setSupplierSearchTerm(e.target.value)}
                      />
                      {supplierSearchTerm && filteredSupplier.length > 0 && (
                        <div className="absolute top-full z-10 mt-2 w-full rounded-lg bg-white p-3 shadow-md">
                          <ul className="max-h-64 overflow-auto">
                            {filteredSupplier.map((supplier) => (
                              <li
                                key={
                                  supplier.Personal_Details.personal_details_id
                                }
                                className="p-2 hover:cursor-pointer hover:bg-gray"
                                onClick={() => handleSelectedSupplier(supplier)}
                              >
                                {supplier.Personal_Details.company}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <Input
                        placeholder="30"
                        className="w-[10%] rounded-l-none"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(
                            /[^0-9]/g,
                            "",
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex h-full w-full flex-col justify-between overflow-y-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(activeCards).map((item) => (
                        <TableRow key={item[0]}>
                          <TableCell>
                            {item[1].itemName} - {item[1].brandName} -{" "}
                            {item[1].variant}{" "}
                          </TableCell>
                          <TableCell>{item[1].quantity}</TableCell>
                          <TableCell>{item[1].selectedUnit.unitName}</TableCell>
                          <TableCell className="text-right">
                            {item[1].unitPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item[1].discount}{" "}
                            {item[1].discountType === "%" ? "%" : ""}
                          </TableCell>
                          <TableCell className="text-right">
                            {item[1].totalPrice.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="bottom-0 flex w-full flex-col justify-end gap-3">
                    <Textarea
                      placeholder="Customer Notes"
                      rows={4}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="!min-h-16 resize-none border-none bg-slate-100 text-slate-700 focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-3">
                      <span>TOTAL: ₱ {grandTotal.toFixed(2).toString()}</span>
                      <Button
                        className="bg-green px-7 font-bold"
                        size={"lg"}
                        onClick={handleSaveInvoice}
                        disabled={
                          !selectedSupplier || isInvoicePending || !term
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default NewInvoice;
