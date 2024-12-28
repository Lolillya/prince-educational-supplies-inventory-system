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
import { useState } from "react";
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// TODO: Pricing

export type RestockProps = {
  restockId: number;
  date: string;
  supplier: string;
  addedStock: number;
  restockItem: {
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

const sampleRestock: RestockProps = {
  restockId: 12345678,
  date: "December 21, 2024",
  supplier: "Rich Adrian Huang",
  addedStock: 500,
  restockItem: [
    {
      variant: "Dustless Small",
      item: "Eraser",
      brand: "Joy",
      quantity: 100,
      mainUnit: "Cartons",
      unitConversion: [
        { from: "Cartons", count: 20, to: "Boxes" },
        { from: "Boxes", count: 5, to: "Pieces" },
      ],
    },
    {
      variant: "Gel Finetip",
      item: "Pen",
      brand: "Smoothwrite",
      quantity: 20,
      mainUnit: "Boxes",
      unitConversion: [
        { from: "Boxes", count: 10, to: "Pieces" },
      ],
    },
    {
      variant: "A4",
      item: "Notebook",
      brand: "Notepro",
      quantity: 300,
      mainUnit: "Pieces",
      unitConversion: [
        { from: "Pieces", count: 1, to: "Pieces" },
      ],
    },
    {
      variant: 'Plastic Cover',
      item: 'Book Cover',
      brand: 'CoverShield',
      quantity: 50,
      mainUnit: "Cartons",
      unitConversion: [
        { from: "Cartons", count: 10, to: "Pieces" },
      ],
    },
    {
      variant: 'Neon Colors',
      item: 'Highlighter',
      brand: 'BrightMark',
      quantity: 30,
      mainUnit: "Boxes",
      unitConversion: [
        { from: "Boxes", count: 10, to: "Cases" },
      ],
    },
  ],
};

const RestockPage = () => {

  const router = useRouter();

  return (
      <section className={`h-auto w-full ${poppins.className} flex flex-col gap-3 overflow-y-scroll py-10 px-20`}>
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <SearchBar value={""} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
            throw new Error("Function not implemented.");
          } } />
            <Filter />

          </div>
          <Button
              onClick={() => router.push("restock/add-stock")}
              className="bg-green hover:bg-green/80">
            <Plus strokeWidth={3} /> Add Stock
          </Button>
        </div>


        <div className="mt-5 flex flex-col gap-4">
          <RestockRecord
              restockId={sampleRestock.restockId}
              date={sampleRestock.date}
              supplier={sampleRestock.supplier}
              addedStock={sampleRestock.addedStock}
              restockItem={sampleRestock.restockItem}
          />
        </div>
      </section>
  );
};

export default RestockPage;
