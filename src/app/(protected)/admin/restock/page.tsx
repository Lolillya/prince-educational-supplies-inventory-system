"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { Ellipsis, Plus } from "lucide-react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Filter from "../_components/filter";
import SearchBar from "../_components/search-bar";
import RestockRecord from "./_components/restock-record";
import { api } from "~/trpc/react";
import UnitLine from "~/app/(protected)/admin/restock/_components/unit-line";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import ViewFullRestock from "~/app/(protected)/admin/restock/_components/view-full-restock";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

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

  interface RestockProps {
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

  return (
    <section
      className={`h-auto w-full ${poppins.className} flex flex-col gap-3 overflow-y-scroll px-20 py-10`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SearchBar />
          <Filter />
        </div>
        <Button
          onClick={() => router.push("restock/add-stock")}
          className="bg-green hover:bg-green/80"
        >
          <Plus strokeWidth={3} /> Add Stock
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
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
    </section>
  );
};

export default RestockPage;
