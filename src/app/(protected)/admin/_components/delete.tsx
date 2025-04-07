import { AlertCircle, CheckCircle, Trash2 } from "lucide-react";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

interface DeleteProps {
  className?: string;
  recordInfo: string | null;
  recordType: string;
  id: string; // Changed from variantId to string ID
  onDelete: (id: string) => Promise<void>;
  onVerifyPassword: (password: string) => Promise<boolean>;
  userRole?: string;
  unpaidAmount?: number;
  hasUnpaidInvoices?: boolean;
  getLatestUnpaidBalance?: () => Promise<{
    amount: number;
    hasUnpaid: boolean;
  }>;
}

const Delete: React.FC<DeleteProps> = ({
  className,
  recordInfo,
  recordType,
  id,
  onDelete,
  onVerifyPassword,
  userRole,
  unpaidAmount = 0,
  hasUnpaidInvoices = false,
  getLatestUnpaidBalance,
}) => {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    // Clear any previous error
    setError(null);
    setIsLoading(true);

    try {
      // Immediately check if user is ADMIN
      if (userRole !== "ADMIN") {
        setError("Only ADMIN users can delete records");
        setIsLoading(false);
        return;
      }

      // Check password exists
      if (!password) {
        setError("Please enter your password to confirm");
        setIsLoading(false);
        return;
      }

      // Verify password first
      const isPasswordCorrect = await onVerifyPassword(password);
      if (!isPasswordCorrect) {
        setError("Incorrect password");
        setIsLoading(false);
        return;
      }

      // Password is correct, now check if customer has unpaid invoices
      // Only check for unpaid invoices if this is a customer record
      if (recordType === "Customers") {
        // For customers with unpaid invoices, only check real-time data if necessary
        if (hasUnpaidInvoices || getLatestUnpaidBalance) {
          let currentUnpaidAmount = unpaidAmount;
          let currentHasUnpaid = hasUnpaidInvoices;

          // Only fetch latest data if we have the function
          if (getLatestUnpaidBalance) {
            try {
              const result = await getLatestUnpaidBalance();
              currentUnpaidAmount = result.amount;
              currentHasUnpaid = result.hasUnpaid;
            } catch (err) {
              console.error("Failed to check latest unpaid balance:", err);
              // Fall back to props if fetching fails
            }
          }

          if (currentHasUnpaid) {
            setError(
              `Cannot delete customer with unpaid balance of PHP ${currentUnpaidAmount.toFixed(2)}`,
            );
            setIsLoading(false);
            return;
          }
        }
      }

      // Proceed with deletion
      await onDelete(id);
      setIsSuccess(true);

      // Clear any existing errors on success
      setError(null);
    } catch (error) {
      // Handle specific error messages from server
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete record";

      setError(errorMessage);

      // Clear success state if there was an error
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`group flex h-12 w-12 items-center justify-center rounded-xl bg-transparent transition-all duration-300 hover:bg-rose-200/60 ${className}`}
        >
          <Trash2
            className="!h-5 !w-5 text-slate-500 transition-colors duration-300 group-hover:text-rose-500"
            strokeWidth={2.5}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="!w-full !max-w-3xl [&>button]:hidden">
        {isSuccess ? (
          <>
            <DialogHeader className={`text-xl font-normal`}>
              <div className="flex flex-col gap-2">
                <DialogTitle className="text-xl font-normal text-slate-700">
                  Record Deleted Successfully
                </DialogTitle>
                <div className="flex items-center gap-3 text-slate-400">
                  <DialogDescription className="text-sm tracking-wide">
                    The record <span className="font-bold">{recordInfo}</span>{" "}
                    has been successfully deleted from{" "}
                    <span className="font-bold">{recordType}</span>.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <Separator orientation="horizontal" className="h-[2px]" />
            <div className="mt-1 flex items-center gap-2">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <p className="text-green-500">Record deleted successfully!</p>
            </div>
            <Separator orientation="horizontal" className="h-[2px]" />
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button className="bg-green hover:bg-green/80">Close</Button>
              </DialogClose>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className={`text-xl font-normal`}>
              <div className="flex flex-col gap-2">
                <DialogTitle className="text-xl font-normal text-slate-700">
                  Delete Record
                </DialogTitle>
                <div className="flex items-center gap-3 text-slate-400">
                  <DialogDescription className="text-sm tracking-wide">
                    You're about to delete{" "}
                    <span className="font-bold">{recordInfo}</span> from
                    <span className="font-bold"> {recordType}</span>.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Separator orientation="horizontal" className="h-[2px]" />
            <div className="mt-2 flex flex-col gap-2">
              <Label className="text-slate-400">
                Enter your password to confirm
              </Label>
              <div className="flex gap-3">
                <Input
                  className="bg-slate-100 text-slate-700 shadow-none"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="mt-1 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  <p className="text-rose-500">{error}</p>
                </div>
              )}
            </div>
            <Separator orientation="horizontal" className="h-[2px]" />
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  className="text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="bg-red hover:bg-red/80"
                onClick={() => void handleDelete()}
                disabled={isLoading}
              >
                {isLoading ? "Checking..." : "Delete Record"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Delete;
