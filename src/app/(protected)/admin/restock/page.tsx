"use client";


import { Plus } from "lucide-react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import Filter from "../_components/filter";
import SearchBar from "../_components/search-bar";
import RestockRecord from "./_components/restock-record";
import { ScrollArea } from "~/components/ui/scroll-area";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export type RestockProps = {
  restockId: number;
  date: string;
  supplier: string;
  addedStock: number;
  restockItems: {
    variant: string;
    item: string;
    brand: string;
    quantity: number;
    mainUnit: string;
    unitConversion: {
      from: string;
      count: number;
      to: string;
    }[];
  }[];
}

const RestockPage = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<RestockProps | null>(null); // Change type to RestockProps to handle full batch
  const {
    data: restockData,
    isLoading,
    error,
  } = api.restock.getRestockData.useQuery();

  const handleViewAll = (batch: RestockProps) => {
    console.log("Selected Batch:", batch);
    setSelectedBatch(batch);
    setIsOpen(true);
  };

  return (
    <section
      className={`h-auto w-full ${poppins.className} flex flex-col gap-3 py-10`}
    >
      <div className="flex items-center justify-between px-20">
        <div className="flex items-center gap-3">
          <SearchBar
            value={""}
            onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
              throw new Error("Function not implemented.");
            }} />
          <Filter />
        </div>
        <Button
          onClick={() => router.push("restock/add-stock")}
          className="bg-green hover:bg-green/80"
        >
          <Plus strokeWidth={3} /> Add Stock
        </Button>
      </div>

      <ScrollArea className="mt-5">
        <div className="grid grid-cols-2 px-20 gap-4">
          {restockData?.map((restock: RestockProps) => (
            <RestockRecord
              key={restock.restockId}
              restockId={restock.restockId}
              date={restock.date}
              supplier={restock.supplier}
              addedStock={restock.addedStock}
              restockItems={restock.restockItems}
              onViewAll={handleViewAll}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};

export default RestockPage;
