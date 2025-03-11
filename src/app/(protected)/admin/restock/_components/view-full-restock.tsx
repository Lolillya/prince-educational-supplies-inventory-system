import { ArrowUpRight, Calendar, Printer } from "lucide-react";
import { Poppins } from "next/font/google";
import { useState } from "react";
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
import RecordEditor from "../../_components/record-editor";
import RecordExpand from "../../_components/record-expand";
import { type RestockProps } from "../page";
import RestockTable from "./restock-table";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ViewFullRestock: React.FC<RestockProps> = ({
  restockId,
  date,
  supplier,
  restockClerk,
  addedStock,
  restockItems = [], // Default to an empty array
}) => {

  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleEdit = () => {
    setIsEditing((prev) => !prev);
    setShowWarning(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isEditing) {
      setShowWarning(true);
      event.preventDefault();
    }
  };

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
        className="!w-full !max-w-3xl [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className={`text-xl ${poppins.className} font-normal`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-xl font-normal text-slate-700">
                #{restockId}
              </DialogTitle>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="h-4 w-4" />
                <DialogDescription className="text-sm tracking-wide">
                  {date}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RecordEditor isEditing={isEditing} handleEdit={handleEdit} />
              <RecordExpand />
            </div>
          </div>
        </DialogHeader>

        <Separator orientation="horizontal" className="h-[2px]" />

        <div className="flex gap-3">
          <div className="flex w-1/2 flex-col gap-2">
            <Label className="text-slate-400">Supplier</Label>
            <Input
              className="bg-slate-100 text-slate-700 shadow-none"
              disabled={!isEditing}
              value={supplier}
            />
          </div>
          <div className="flex w-1/2 flex-col gap-2">
            <Label className="text-slate-400">Recorded by</Label>
            <Input
              className="bg-slate-100 text-slate-700 shadow-none"
              disabled={!isEditing}
              value={restockClerk}
            />
          </div>
        </div>

        <RestockTable restockItem={restockItems} isEditing={isEditing} />

        <Separator orientation="horizontal" className="h-[2px]" />

        <Textarea
          className="!min-h-16 border-none text-slate-700 bg-slate-100 resize-none focus:outline focus:outline-2 focus:outline-slate-200"
          placeholder="Your record notes..."
          disabled={!isEditing}
        />

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-base font-normal text-slate-700">{addedStock}</p>
            <p className="text-sm text-slate-400">Added Stock</p>
          </div>
          <div className="flex items-center gap-2">
            <DialogClose asChild disabled={isEditing}>
              <Button variant="secondary" className="text-slate-700 hover:bg-slate-200" disabled={isEditing}>
                Close
              </Button>
            </DialogClose>
            <Button className="bg-green hover:bg-green/80" disabled={isEditing}>
              <Printer />
              Print Restock
            </Button>
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
