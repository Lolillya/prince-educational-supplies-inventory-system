import Image from "next/image";
import Up_Trend_Icon from "public/icons/up-trend.svg";
import Down_Trend_Icon from "public/icons/down-trend.svg";
import Stock_Icon from "public/icons/stock-icon.svg";
import Sales_Icon from "public/icons/sales-icon.svg";
import { Label } from "~/components/ui/label";
import { Card, CardDescription, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import {
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  Table,
  TableBody,
  TableCell,
} from "./ui/table";
import { Button } from "./ui/button";

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
            <div className="flex items-center gap-1">
              <span>STOCKED IN</span>
              <span>(OCTOBER)</span>
            </div>
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
                  <TableCell>2023-05-15</TableCell>
                  <TableCell>50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Global Supplies Inc.</TableCell>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>2023-05-14</TableCell>
                  <TableCell>75</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tech Innovations Ltd.</TableCell>
                  <TableCell>Bob Johnson</TableCell>
                  <TableCell>2023-05-13</TableCell>
                  <TableCell>100</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="m-3 mt-4 flex justify-end gap-3 text-center text-sm text-gray-500">
              <Button
                size={"lg"}
                className="border-[#FF7B7B] bg-white font-bold text-[#FF7B7B] hover:bg-[#FF7B7B] hover:text-white"
              >
                Print
              </Button>
              <Button
                size={"lg"}
                className="bg-[#FF7B7B] font-bold text-white hover:bg-white hover:text-[#FF7B7B]"
              >
                Save
              </Button>
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
            <div className="flex items-center gap-1">
              <span>STOCKED OUT</span>
              <span>(OCTOBER)</span>
            </div>
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
                  <TableCell>2023-05-15</TableCell>
                  <TableCell>50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Global Supplies Inc.</TableCell>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>2023-05-14</TableCell>
                  <TableCell>75</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tech Innovations Ltd.</TableCell>
                  <TableCell>Bob Johnson</TableCell>
                  <TableCell>2023-05-13</TableCell>
                  <TableCell>100</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="m-3 mt-4 flex justify-end gap-3 text-center text-sm text-gray-500">
              <Button
                size={"lg"}
                className="border-[#FF7B7B] bg-white font-bold text-[#FF7B7B] hover:bg-[#FF7B7B] hover:text-white"
              >
                Print
              </Button>
              <Button
                size={"lg"}
                className="bg-[#FF7B7B] font-bold text-white hover:bg-white hover:text-[#FF7B7B]"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardStockedInOut;
