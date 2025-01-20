"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import InvoiceCard from "../_components/invoice-card-copy";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "~/components/loading";

type InventoryItem = {
  inventory_id: number;
  variant: {
    name: string | null;
    variant_id: number;
    BatchVariant: Array<{
      batch_variant_id: number;
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
    company: string;
    personal_details_id: number;
  };
};

const NewInvoice = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierProps>();
  const [filteredSupplier, setFilteredSupplier] = useState<SupplierProps[]>([]);

  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);

  const [grandTotal, setGrandTotal] = useState<number>(0);

  const [stockTotals, setStockTotals] = useState<{ [key: number]: string }>({});

  const {
    data: inventoryItems,
    isLoading,
    isError,
  } = api.invoice.getItems.useQuery();

  console.log(stockTotals);

  const { data: supplierList } = api.invoice.getSuppliers.useQuery();

  const { mutateAsync: createInvoice } =
    api.invoice.createInvoiceWithLineItems.useMutation();

  const calculateGrandTotal = () => {
    const total = selectedItems.reduce((acc, item) => {
      return (
        acc +
        Object.entries(item.variant.BatchVariant).reduce(
          (batchAcc, [_, variant]) => {
            const quantity = variant.SupplierUnit[0]?.quantity_per_unit || 0;
            const unitPrice = variant.SupplierUnit[0]?.price || 0;
            return batchAcc + quantity * unitPrice;
          },
          0,
        )
      );
    }, 0);

    setGrandTotal(total);
  };

  const handleSaveInvoice = () => {
    if (!selectedItems) {
      alert("Select an item to save invoice!");
      return;
    }

    const invoiceData = {
      invoice: {
        invoice_number: "INV_00004",
        customer_id: selectedSupplier?.Personal_Details.personal_details_id,
        total_amount: grandTotal,
        discount: 0,
        status: "PENDING",
        payment_term_id: 1,
      },
      lineItems: selectedItems.flatMap((item) =>
        Object.entries(item.variant.BatchVariant).map(([_, variant]) => ({
          variant_id: item.variant.variant_id,
          quantity: variant.SupplierUnit[0]?.quantity_per_unit || 0,
          unit_price: variant.SupplierUnit[0]?.price || 0,
          total_price:
            (variant.SupplierUnit[0]?.quantity_per_unit || 0) *
            (variant.SupplierUnit[0]?.price || 0),
        })),
      ),
    };
    createInvoice(invoiceData);
  };

  const handleRemoveBatch = (idToRemove: number) => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => item.inventory_id !== idToRemove),
    );
  };

  const handleSelectedSupplier = (supplier: SupplierProps) => {
    setSupplierSearchTerm(supplier.Personal_Details.company);
    setSelectedSupplier(supplier);
  };

  const handleSelectItem = (item: InventoryItem) => {
    if (
      !selectedItems.some(
        (selected) => selected.inventory_id === item.inventory_id,
      )
    ) {
      setSelectedItems([...selectedItems, item]);
      setStockTotals((prev) => ({ ...prev, [item.inventory_id]: "" }));
    }
    setSearchTerm("");
  };

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
      const result = supplierList?.filter((supplier) =>
        supplier.Personal_Details.company
          ?.toLowerCase()
          .includes(supplierSearchTerm),
      );
      setFilteredSupplier(result);
    } else setFilteredSupplier([]);
  }, [selectedItems, searchTerm, inventoryItems, supplierSearchTerm]);

  if (isLoading) {
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
          <span className="text-gray-400 ml-3 text-sm font-light">#12345</span>
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
                    className="flex cursor-pointer items-center rounded-lg p-3 hover:bg-gray"
                    onClick={() => handleSelectItem(item)}
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
              key={index}
              id={item.inventory_id}
              itemName={item.variant.item.name}
              brandName={item.variant.item.brand.name}
              variant={item.variant.name}
              BatchVariant={item.variant.BatchVariant}
              onRemove={handleRemoveBatch}
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
        <span>TOTAL: P{grandTotal}</span>
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
            <DialogTitle>ORDER CONFIRMATION</DialogTitle>

            <div className="flex w-full flex-col gap-3">
              <div className="text-gray-400 flex flex-col gap-1">
                <Label>Customer & Term</Label>
                <div className="relative flex w-full items-center">
                  <Input
                    placeholder="Business Name"
                    className="w-[90%] rounded-r-none"
                    value={supplierSearchTerm}
                    onChange={(e) => setSupplierSearchTerm(e.target.value)}
                  />
                  {supplierSearchTerm && filteredSupplier.length > 0 && (
                    <div className="absolute top-full z-10 mt-2 w-full rounded-lg bg-white p-3 shadow-md">
                      <ul className="max-h-64 overflow-auto">
                        {filteredSupplier.map((supplier) => (
                          <li
                            key={supplier.Personal_Details.personal_details_id}
                            className="p-2 hover:cursor-pointer hover:bg-gray"
                            onClick={() => handleSelectedSupplier(supplier)}
                          >
                            {supplier.Personal_Details.company}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Input placeholder="30" className="w-[10%] rounded-l-none" />
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
                  {selectedItems.map((item) =>
                    Object.entries(item.variant.BatchVariant).map(
                      ([_, variant]) => (
                        <TableRow key={variant.batch_variant_id}>
                          <TableCell>
                            {item.variant.item.name} -{" "}
                            {item.variant.item.brand.name} - {item.variant.name}
                          </TableCell>
                          <TableCell>
                            {variant.SupplierUnit[0]?.quantity_per_unit}
                          </TableCell>
                          <TableCell>Boxes</TableCell>
                          <TableCell className="text-right">
                            P {variant.SupplierUnit[0]?.price}
                          </TableCell>
                          <TableCell>0%</TableCell>
                          <TableCell>
                            {(variant.SupplierUnit[0]?.quantity_per_unit || 0) *
                              (variant.SupplierUnit[0]?.price || 0)}
                          </TableCell>
                        </TableRow>
                      ),
                    ),
                  )}
                </TableBody>
              </Table>
              <div className="bottom-0 flex w-full justify-end">
                <div className="flex items-center gap-3">
                  <span>TOTAL: P{grandTotal}</span>
                  <Button
                    className="bg-green px-7 font-bold"
                    size={"lg"}
                    onClick={handleSaveInvoice}
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

export default NewInvoice;
