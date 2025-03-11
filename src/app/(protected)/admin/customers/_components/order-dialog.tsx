import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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

type OrderDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    date: string;
    reference: string;
    amount: string;
  };
};

export function OrderDialog({
  isOpen,
  onClose,
  transaction,
}: OrderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-full max-h-[80%] w-full max-w-5xl flex-col">
        <DialogHeader>
          <DialogTitle>{transaction.reference} - MONTH DAY, YYYY</DialogTitle>
          <div className="flex w-full flex-col gap-3">
            <div className="text-gray-400 flex flex-col gap-1">
              <Label className="text-textGray">Customer & Term</Label>
              <div className="flex">
                <Input
                  placeholder="Business Name"
                  className="w-full rounded-r-none"
                />
                <Input placeholder="30" className="w-[20%] rounded-l-none" />
              </div>
            </div>

            <div className="w text-gray-400 flex flex-col gap-1">
              <Label className="text-textGray">Recorded by</Label>
              <Input placeholder="Employee Name" />
            </div>
          </div>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Discound</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Item - Brand - Variand</TableCell>
              <TableCell>200</TableCell>
              <TableCell>Boxes</TableCell>
              <TableCell className="text-right">0000.00</TableCell>
              <TableCell className="text-right">0000.00</TableCell>
              <TableCell className="text-right">0000.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
