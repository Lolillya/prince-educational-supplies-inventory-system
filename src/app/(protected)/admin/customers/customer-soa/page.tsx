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

const SOA = () => {
  return (
    <section className="flex h-screen max-h-screen w-screen flex-col gap-3 overflow-y-scroll p-10 pb-0">
      <CustomerRouter title="STATEMENT OF ACCOUNT" />

      <div className="flex h-full flex-col gap-5 px-52">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold">Php 200,000.00</span>
            <span className="text-textGray">Remaining Balance</span>
          </div>

          <div className="flex gap-3">
            <Card className="flex items-center justify-center p-4 transition duration-300 hover:scale-105 hover:cursor-pointer hover:bg-gray">
              <FileDown color="#00B69B" />
            </Card>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"default"} className="font-bold">
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
            <TableRow>
              <TableCell>MM/DD/YY</TableCell>
              <TableCell>Order</TableCell>
              <TableCell className="text-green">#123456</TableCell>
              <TableCell className="text-right">+ Php 2,000.00</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>MM/DD/YY</TableCell>
              <TableCell>Order</TableCell>
              <TableCell className="text-green">#123456</TableCell>
              <TableCell className="text-right">+ Php 2,000.00</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>MM/DD/YY</TableCell>
              <TableCell>Order</TableCell>
              <TableCell className="text-green">#123456</TableCell>
              <TableCell className="text-right">+ Php 2,000.00</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>MM/DD/YY</TableCell>
              <TableCell>Order</TableCell>
              <TableCell className="text-green">#123456</TableCell>
              <TableCell className="text-right">+ Php 2,000.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default SOA;
