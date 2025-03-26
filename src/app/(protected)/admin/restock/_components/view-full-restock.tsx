import { ArrowUpRight, Calendar, Printer, X } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { type RestockProps } from "../page";
import RestockTable from "./restock-table";

const ViewFullRestock: React.FC<RestockProps> = ({
                                                   restockId,
                                                   date,
                                                   supplier,
                                                   restockClerk,
                                                   addedStock,
                                                   restockItems = [],
                                                   notes,
                                                 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [restockNotes, setRestockNotes] = useState<string>(notes ?? '');
  const [initialNotes, setInitialNotes] = useState<string>(notes ?? '');
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const { mutateAsync: saveRestock, isPending: isSaving } =
      api.restock.saveNotes.useMutation();

  const handleSaveRestock = async () => {
    try {
      await saveRestock({
        restockId,
        notes: restockNotes || null,
      });

      toast({
        title: "Success",
        description: "Restock notes updated successfully!",
        variant: "default",
      });

      setInitialNotes(restockNotes);
      setHasChanges(false);
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message?: string }).message ?? errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      if (isEditing) {
        setShowWarning(true);
        event.preventDefault();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRestockNotes(newValue);
    setHasChanges(newValue !== initialNotes);
  };

  useEffect(() => {
    setInitialNotes(notes ?? '');
    setRestockNotes(notes ?? '');
  }, [notes]);

  return (
      <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              if (isEditing) {
                setShowWarning(true);
                return;
              }
            }
            setIsDialogOpen(open);
            if (!open) {
              setShowWarning(false);
            }
          }}
      >
        <DialogTrigger>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200 hover:text-slate-500">
            View Details
            <ArrowUpRight strokeWidth={2.5} className="h-4 w-4" />
          </div>
        </DialogTrigger>
        <DialogContent
            className="flex max-h-[80%] !w-full !max-w-3xl flex-col [&>button]:hidden"
            onKeyDown={handleKeyDown}
        >
          <DialogHeader className={`h-full text-xl font-normal`}>
            <div className="flex items-center justify-between">
              <div className="flex h-full flex-col justify-between gap-2">
                <DialogTitle className="text-xl font-normal text-slate-700">
                  #{restockId}
                </DialogTitle>
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <DialogDescription className="text-sm tracking-wide">
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </DialogDescription>
                </div>
              </div>
              <DialogClose asChild>
                <Button variant={"secondary"} className="text-slate-700 w-12 h-12">
                  <X className="!h-6 !w-6 text-slate-400" strokeWidth={2.5} />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <Separator orientation="horizontal" className="h-[2px]" />

          <div className="flex gap-3">
            <div className="group flex w-1/2 flex-col gap-2">
              <Label className="text-slate-400">Supplier</Label>
              <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
                <Input
                    className="w-full bg-slate-100 text-slate-700 shadow-none"
                    disabled={!isEditing}
                    defaultValue={supplier}
                />
              </div>
            </div>
            <div className="group flex w-1/2 flex-col gap-2">
              <Label className="text-slate-400">Restocked by</Label>
              <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
                <Input
                    className="bg-slate-100 text-slate-700 shadow-none"
                    disabled={!isEditing}
                    defaultValue={restockClerk}
                />
              </div>
            </div>
          </div>

          <RestockTable restockItem={restockItems} isEditing={isEditing} />

          <Separator orientation="horizontal" className="h-[2px]" />

          <Textarea
              className="!min-h-16 resize-none border-none bg-slate-100 text-slate-700 focus:outline focus:outline-2 focus:outline-slate-200"
              placeholder="Your restock notes..."
              value={restockNotes}
              onChange={handleChange}
          />

          <div className="flex items-center justify-between">
            <div className="flex h-full flex-col justify-between gap-1">
              <p className="text-base font-normal text-slate-700">
                {addedStock} items
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                {/*<p className="text-sm tracking-wide">Total Added Stock</p>*/}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!hasChanges ? (
                  <Button
                      variant={"secondary"}
                      className="text-slate-700 hover:bg-slate-200"
                      disabled
                  >
                    Save Changes
                  </Button>
              ) : (
                  <Button
                      disabled={isSaving}
                      onClick={handleSaveRestock}
                      className="bg-slate-200 hover:bg-slate-200/80 text-slate-600"
                  >
                    Save Changes
                  </Button>
              )}
              {/*<Button*/}
              {/*    className="bg-green hover:bg-green/80"*/}
              {/*    disabled={isEditing}*/}
              {/*    onClick={() => {*/}
              {/*      // Add your print functionality here*/}
              {/*      console.log("Print restock:", restockId);*/}
              {/*    }}*/}
              {/*>*/}
              {/*  /!*<Printer />*!/*/}
              {/*  /!*Print Restock*!/*/}
              {/*</Button>*/}
            </div>
          </div>
          {showWarning && (
              <p className="text-right text-sm text-orange-400">
                Whoops! Don't forget to save your changes.
              </p>
          )}
        </DialogContent>
      </Dialog>
  );
};

export default ViewFullRestock;