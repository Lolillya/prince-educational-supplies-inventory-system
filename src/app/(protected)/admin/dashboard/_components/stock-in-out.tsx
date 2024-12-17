import Image from "next/image";
import Up_Trend_Icon from "public/icons/up-trend.svg";
import Down_Trend_Icon from "public/icons/down-trend.svg";
import Stock_Icon from "public/icons/stock-icon.svg";
import Sales_Icon from "public/icons/sales-icon.svg";
import { Label } from "~/components/ui/label";
import { Card, CardDescription, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  Table,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
// import { button } from "./ui/button";

const DashboardStockedInOut = () => {
  return (
    <div className="flex h-fit w-full max-w-3xl items-center justify-between gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Card className="h-fit w-full p-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-3">
                <CardDescription className="flex items-center gap-1">
                  <Label>Stocked In</Label>
                  <Image src={Up_Trend_Icon} alt="uptrend icon" width={15} />
                  <Label className="text-[#00B69B]">1.3%</Label>
                </CardDescription>
                <CardContent className="pl-0">
                  <Label className="pb-3 pt-3 text-xl font-bold">10,293</Label>
                </CardContent>
              </div>
              <Image src={Stock_Icon} alt="stock icon" />
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="flex h-full max-h-[80%] w-full max-w-5xl flex-col justify-start">
          <DialogHeader className="h-fit">
            <DialogTitle className="flex items-center gap-1">
              STOCKED IN
              <Label className="font-light text-textGray">
                MM/DD/YY - MM/DD/YY
              </Label>
            </DialogTitle>
          </DialogHeader>

          <div className="flex h-full w-full flex-col justify-between overflow-x-auto">
            <Table className="h-full w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Supplier</TableHead>
                  <TableHead className="w-[25%]">Recorded by</TableHead>
                  <TableHead className="w-[25%]">Date</TableHead>
                  <TableHead className="w-[25%]">Items Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-y-scroll">
                <TableRow>
                  <TableCell>Acme Corp</TableCell>
                  <TableCell>John Doe</TableCell>
                  <TableCell>October 1, 2024</TableCell>
                  <TableCell>+ 50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Global Supplies Inc.</TableCell>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>October 1, 2024</TableCell>
                  <TableCell>+ 75</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tech Innovations Ltd.</TableCell>
                  <TableCell>Bob Johnson</TableCell>
                  <TableCell>October 1, 2024</TableCell>
                  <TableCell>+ 100</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="m-3 mt-4 flex items-center justify-end gap-3 text-center text-sm">
              <Button variant={"link"}>Close</Button>
              <Button variant={"default"}>Export</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Card className="h-fit w-full p-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-3">
                <CardDescription className="flex items-center gap-1">
                  <Label>Stocked In</Label>
                  <Image src={Up_Trend_Icon} alt="uptrend icon" width={15} />
                  <Label className="text-[#00B69B]">1.3%</Label>
                </CardDescription>
                <CardContent className="pl-0">
                  <Label className="pb-3 pt-3 text-xl font-bold">10,293</Label>
                </CardContent>
              </div>
              <Image src={Stock_Icon} alt="stock icon" />
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="flex h-full max-h-[80%] w-full max-w-5xl flex-col justify-start">
          <DialogHeader className="h-fit">
            <DialogTitle className="flex items-center gap-1">
              STOCKED OUT
              <span className="text-sm font-light text-textGray">
                MM/DD/YY - MM/DD/YY
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex h-full w-full flex-col justify-between overflow-x-auto">
            <Table className="h-full w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Supplier</TableHead>
                  <TableHead className="w-[25%]">Recorded by</TableHead>
                  <TableHead className="w-[25%]">Date</TableHead>
                  <TableHead className="w-[25%]">Items Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-y-scroll">
                <TableRow>
                  <TableCell>Acme Corp</TableCell>
                  <TableCell>John Doe</TableCell>
                  <TableCell>October 1, 2024</TableCell>
                  <TableCell>+ 50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Global Supplies Inc.</TableCell>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>October 1, 2024</TableCell>
                  <TableCell>+ 75</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tech Innovations Ltd.</TableCell>
                  <TableCell>Bob Johnson</TableCell>
                  <TableCell>October 1, 2024</TableCell>
                  <TableCell>+ 100</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="m-3 mt-4 flex items-center justify-end gap-3 text-center text-sm">
              <Button variant={"link"}>Close</Button>
              <Button variant={"default"}>Export</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardStockedInOut;
