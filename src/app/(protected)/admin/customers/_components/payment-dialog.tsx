import React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

type PaymentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    date: string;
    reference: string;
    amount: string;
  };
};

export function PaymentDialog({
  isOpen,
  onClose,
  transaction,
}: PaymentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>{transaction.reference}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 py-1">
          <Label className="text-textGray">Customer</Label>
          <Input placeholder="INSERT COMPANY HERE" />
        </div>

        <div className="flex flex-col gap-1 py-1">
          <Label className="text-textGray">Recorded by</Label>
          <Input placeholder="INSERT NAME HERE" />
        </div>

        <div className="flex flex-col gap-1 py-1">
          <Label className="text-textGray">Amount</Label>
          <Input placeholder="INSERT AMOUNT HERE" />
        </div>

        <div className="flex flex-col gap-1 py-1">
          <Label className="text-textGray">Customer</Label>
          <Input placeholder="INSERT COMPANY HERE" />
        </div>

        <div className="flex flex-col gap-1 py-1">
          <Textarea
            className="resize-none placeholder:text-textGray"
            rows={4}
            placeholder="Payment Notes..."
          />
        </div>

        <div className="flex flex-col">
          <Button variant={"default"}>OK</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
