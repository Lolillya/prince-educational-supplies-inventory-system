"use client";

import { Button } from "~/components/ui/button";
import CustomerRouter from "../_components/customer-router";
import { Card } from "~/components/ui/card";
import { FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { DialogHeader } from "~/components/ui/dialog-transparent";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useState } from "react";
import { OrderDialog } from "../_components/order-dialog";
import { PaymentDialog } from "../_components/payment-dialog";

// DUMMY DATA --------------

type Transaction = {
  date: string;
  type: "Payment" | "Order";
  reference: string;
  amount: string;
};

const transactions: Transaction[] = [
  {
    date: "MM/DD/YY",
    type: "Payment",
    reference: "#123456",
    amount: "+ Php 2,000.00",
  },
  {
    date: "MM/DD/YY",
    type: "Order",
    reference: "#123456",
    amount: "+ Php 2,000.00",
  },
  {
    date: "MM/DD/YY",
    type: "Payment",
    reference: "#123456",
    amount: "+ Php 2,000.00",
  },
  {
    date: "MM/DD/YY",
    type: "Order",
    reference: "#123456",
    amount: "+ Php 2,000.00",
  },
];

// --------------------------

const SOA = () => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };
  return (
    <section className="flex h-screen max-h-screen w-screen flex-col gap-3 overflow-y-scroll p-10 pb-0">
      <CustomerRouter title="STATEMENT OF ACCOUNT" />

      <div className="flex h-full flex-col gap-5 px-52">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold">Php 200,000.00</span>
            <span className="text-textGray">Remaining Balance</span>
          </div>

          <div className="flex items-center gap-3">
            <Card className="flex items-center justify-center p-2 transition duration-300 hover:scale-105 hover:cursor-pointer hover:bg-gray">
              <FileDown color="#00B69B" />
            </Card>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-green font-bold hover:bg-green/80">
                  + New Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="py-10">
                <DialogTitle className="text-center">NEW PAYMENT</DialogTitle>
                <DialogHeader>
                  <Label className="text-textGray">Amount</Label>
                  <Input />
                </DialogHeader>
                <DialogDescription>
                  <Textarea
                    placeholder="Payment Notes..."
                    className="resize-none"
                    rows={4}
                  />
                </DialogDescription>
                <div className="flex w-full justify-center">
                  <Button variant={"default"}>OK</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Transaction Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow
                key={index}
                onClick={() => handleRowClick(transaction)}
                className="cursor-pointer"
              >
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell className="text-green-500">
                  {transaction.reference}
                </TableCell>
                <TableCell className="text-right">
                  {transaction.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedTransaction?.type === "Payment" && (
          <PaymentDialog
            isOpen={!!selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            transaction={selectedTransaction}
          />
        )}

        {selectedTransaction?.type === "Order" && (
          <OrderDialog
            isOpen={!!selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            transaction={selectedTransaction}
          />
        )}
      </div>
    </section>
  );
};

export default SOA;
