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
import { LoadingSpinner } from "~/components/loading";
import { useSearchParams } from 'next/navigation';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface RestockProps {
  restockId: number;
  date: string | undefined;
  supplier: string | null;
  restockClerk: string;
  addedStock: number;
  restockItems: {
    variant: string;
    item: string;
    brand: string;
    quantity: number;
    price: number | undefined;
    mainUnit: string;
    unitConversion: {
      [key: string]: any;
    }[];
  }[];
}

const RestockPage = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<RestockProps | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const searchParams = useSearchParams();
  const clerkId = searchParams.get('clerkId');
  const supplierId = searchParams.get('supplierId');


  const {
    data: restockData,
    isLoading,
    error,
  } = api.restock.getRestockData.useQuery(
    clerkId ? { clerkId } : supplierId ? { supplierId } : undefined
  );


  if (isLoading)
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );

  const handleViewAll = (batch: RestockProps) => {
    console.log("Selected Batch:", batch);
    setSelectedBatch(batch);
    setIsOpen(true);
  };

  // Filtering Restock Data
  const filteredRestocks = restockData?.filter((restock) => {
    const query = searchQuery.toLowerCase();

    const restockId = restock.restockId?.toString()?.toLowerCase() ?? "";
    const supplier = restock.supplier?.toLowerCase() ?? "";
    const restockClerk = restock.restockClerk?.toLowerCase() ?? "";
    const date = restock.date?.toLowerCase() ?? "";

    return (
      restockId.includes(query) ||
      supplier.includes(query) ||
      restockClerk.includes(query) ||
      date.includes(query)
    );
  });

  return (
    <section
      className={`h-auto w-full ${poppins.className} flex flex-col gap-3 py-10`}
    >
      <div className="flex items-center justify-between px-20">
        <div className="flex items-center gap-3">
          {/*//Searchbar*/}
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
          {filteredRestocks?.map((restock: RestockProps) => (
            <RestockRecord
              key={restock.restockId}
              restockId={restock.restockId}
              date={restock.date}
              supplier={restock.supplier}
              restockClerk={restock.restockClerk}
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
