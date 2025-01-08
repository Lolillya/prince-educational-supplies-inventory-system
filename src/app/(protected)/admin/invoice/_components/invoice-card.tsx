import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

interface InvoiceCardProps {
  batchNumber: number;
  itemName: string;
  brandName: string;
  variant: string | null;
  supplierUnit: Array<{
    price: number;
    quantity_per_unit: number;
    unit_id: number;
    unit: {
      name: string;
      unit_id: number;
    };
  }>;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  batchNumber,
  itemName,
  brandName,
  variant,
  supplierUnit,
}) => {
  const [unitQuantity, setUnitQuantity] = useState<number | undefined>(
    supplierUnit[0]?.quantity_per_unit,
  );
  const [price, setPrice] = useState<number | undefined>(
    supplierUnit[0]?.price,
  );

  const [selectedUnit, setSelectedUnit] = useState(supplierUnit[0]);

  const [totalPrice, setTotalPrice] = useState<number | undefined>(
    (unitQuantity || 0) * (price || 0),
  );

  const [supplier, setSupplier] = useState("Supplier");

  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("%");

  useEffect(() => {
    setPrice(selectedUnit?.price);
    setUnitQuantity(selectedUnit?.quantity_per_unit);
  }, [selectedUnit]);

  return (
    <div className="border-gray-200 h-fit rounded-xl border p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Label>
          {itemName} - {brandName} - {variant}
        </Label>
        <X className="hover:cursor-pointer" />
      </div>
      <Separator orientation="horizontal" />
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:no-underline">
            Batch {batchNumber}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-left">Quantity & Stock</Label>
                <div className="flex">
                  <Input
                    className="rounded-r-none border shadow-none"
                    value={unitQuantity}
                    onChange={(e) => setUnitQuantity(e.target.value)}
                  />
                  <Select
                    value={selectedUnit?.unit.name}
                    onValueChange={(value) => {
                      const unit = supplierUnit.find(
                        (u) => u.unit.name === value,
                      );
                      if (unit) setSelectedUnit(unit);
                    }}
                    defaultValue={supplierUnit[0]?.unit?.name || ""}
                  >
                    <SelectTrigger className="rounded-l-none">
                      <SelectValue
                        defaultValue={supplierUnit[0]?.unit?.name || ""}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {supplierUnit.map((unit) => (
                        <SelectItem
                          value={unit.unit.name}
                          key={unit.unit.unit_id}
                        >
                          {unit.unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-left">Pricing</Label>
                <div className="flex">
                  <Input
                    className="rounded-r-none border shadow-none"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={supplier === "Supplier"}
                  />
                  <Select
                    value={supplier}
                    onValueChange={(value) => setSupplier(value)}
                  >
                    <SelectTrigger className="rounded-l-none">
                      <SelectValue placeholder="Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Supplier">Supplier</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-left">Discount</Label>
                <div className="flex">
                  <Input
                    className="rounded-r-none border shadow-none"
                    placeholder="00"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* <p className="text-gray-400 mt-4 text-sm">
        Insufficient stock from Batch 1!
        <br />
        <span className="text-orange-400">
          <Link href={"#"}>Choose a different batch</Link>
        </span>
        &nbsp; or &nbsp;
        <span className="text-orange-400">
          <Link href={"#"}>auto restock</Link>
        </span>
      </p> */}
      <p className="mt-4">Total: P{totalPrice}</p>
    </div>
  );
};

export default InvoiceCard;
