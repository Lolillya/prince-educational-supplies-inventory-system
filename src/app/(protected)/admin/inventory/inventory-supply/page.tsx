import { Badge } from "~/components/ui/badge";

import { Pencil } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import InventorySearchAndButtonRouter from "../_components/inventory-search";

const InventorySupply = () => {
  return (
    <section className="flex h-auto w-screen flex-col gap-3 overflow-y-scroll p-10 pb-0">
      <InventorySearchAndButtonRouter />

      <div className="relative flex flex-grow gap-3 overflow-hidden px-3">
        {/* Records Section */}
        <div className="flex w-1/2 flex-col">
          <span>Records</span>
          <div className="scrollbar-hidden overflow-y-scroll">
            {/* <ScrollArea> */}
            <div className="flex flex-col gap-3 pb-3 pr-3">
              <Card className="flex items-center justify-between gap-2 p-5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red"></div>
                  <div className="flex items-center gap-2">
                    <Label>Item - Brand - Variant</Label>
                    <Label className="text-textGray">#itemID</Label>
                  </div>
                </div>

                <Pencil color="#989FB3" />
              </Card>
              <Card className="flex items-center justify-between gap-2 p-5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green"></div>
                  <div className="flex items-center gap-2">
                    <Label>Item - Brand - Variant</Label>
                    <Label className="text-textGray">#itemID</Label>
                  </div>
                </div>

                <Pencil color="#989FB3" />
              </Card>

              <Card className="flex items-center justify-between gap-2 p-5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orage"></div>
                  <div className="flex items-center gap-2">
                    <Label>Item - Brand - Variant</Label>
                    <Label className="text-textGray">#itemID</Label>
                  </div>
                </div>

                <Pencil color="#989FB3" />
              </Card>
            </div>
            {/* </ScrollArea> */}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex w-1/2 flex-col">
          <span>Details</span>
          <div className="bg-gray-200 flex h-full flex-col gap-5 overflow-auto rounded-lg bg-gray p-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold"></span>
                    <span className="font-bold"></span>
                    <span className="font-bold"></span>
                  </div>
                  <Badge>Category</Badge>
                </div>
                <span>#item id</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-400 font-light">Notes</span>
                <span>desc</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span># Batches</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant={"link"}
                    className="min-h-fit min-w-fit text-green"
                  >
                    View All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="text-center font-bold">
                    Verify it's you!
                  </DialogTitle>

                  <div className="flex flex-col gap-1">
                    <Label className="text-textGray">Password</Label>
                    <Input
                      placeholder="Enter Password"
                      className="p-6 placeholder:text-textGray"
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button size={"lg"}>Continue</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Separator orientation="horizontal" className="bg-textGray" />

            {/* Scrollable batches section */}
            {/* <ScrollArea className={"scrollbar-hidden"}> */}
            {/* <ScrollArea className={"scrollbar-hidden"}> */}
            <div className="flex flex-col gap-5 rounded-lg">
              {/* {selectedItem?.variant.Batch &&
                selectedItem.variant.Batch.length > 0 ? (
                  selectedItem.variant.Batch.map((batch) => (
                    <BatchAccordion key={batch.batch_id} batch={batch} />
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-gray-500 text-lg font-semibold">
                      No batches available
                    </p>
                  </div>
                )} */}
            </div>
            {/* </ScrollArea> */}
            {/* </ScrollArea> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventorySupply;
