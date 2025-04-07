import { PopoverClose } from "@radix-ui/react-popover";
import { Undo2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import { toast } from "~/hooks/use-toast";

interface RefundProps {
  className?: string;
  paymentId: number;
  onRefundSuccess?: () => void;
}

const Refund: React.FC<RefundProps> = ({
  className,
  paymentId,
  onRefundSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const personalDetailsId = session?.user?.id;

  const { mutate: refundPayment, isPending } = api.payment.refund.useMutation({
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Refund Successful",
        description:
          "The payment has been refunded and the amount has been added back to the unpaid balance.",
        variant: "default",
      });

      if (onRefundSuccess) {
        onRefundSuccess();
      }
      // Close the popover
      const popoverTrigger = document.querySelector(
        "[data-radix-popper-content-wrapper]",
      );
      if (popoverTrigger instanceof HTMLElement) {
        popoverTrigger.click();
      }
    },
    onError: (error) => {
      setError(error.message);
      toast({
        title: "Refund Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefund = () => {
    if (!personalDetailsId) {
      setError("User session not found");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    refundPayment({
      paymentId,
      personalDetailsId,
      password,
    });
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="ghost"
          className={`group flex h-12 w-12 items-center justify-center rounded-xl bg-transparent transition-all duration-300 hover:bg-rose-200/60 ${className}`}
        >
          <Undo2
            className="!h-5 !w-5 text-slate-500 transition-colors duration-300 group-hover:text-rose-500"
            strokeWidth={2.5}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="shadow-none" popoverTarget="">
        <p className="font-medium text-slate-700">Refund</p>
        <div className="mt-4">
          <Label className="text-slate-400">
            Enter your password to confirm
          </Label>
          <Input
            className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
          />
          {error && (
            <div className="mt-2 flex items-center gap-2 text-rose-500">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex w-full gap-2">
          <PopoverClose asChild>
            <Button className="w-1/2 bg-slate-200 text-slate-700 hover:bg-slate-300">
              Cancel
            </Button>
          </PopoverClose>
          <Button
            className="w-1/2 bg-rose-100 text-red hover:bg-rose-200"
            onClick={handleRefund}
            disabled={!password || isPending}
          >
            {isPending ? "Processing..." : "Refund"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Refund;
