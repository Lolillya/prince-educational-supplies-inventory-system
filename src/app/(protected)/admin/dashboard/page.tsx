import { Label } from "~/components/ui/label";
import { Poppins } from "next/font/google";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";

import Up_Trend_Icon from "public/icons/up-trend.svg";
import Down_Trend_Icon from "public/icons/down-trend.svg";
import Stock_Icon from "public/icons/stock-icon.svg";
import Sales_Icon from "public/icons/sales-icon.svg";
import Image from "next/image";
import { DashboardChart } from "~/app/_components/dashboard-chart";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const AdminDashboard = () => {
  return (
    <section
      className={`h-auto w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <div className="flex items-center justify-between">
        <Label className="text-4xl font-extrabold">Hello, Joshua</Label>

        <div className="flex items-center gap-3">
          <Button
            size={"lg"}
            className="border-2 border-[#FF7B7B] bg-white font-bold text-[#FF7B7B] hover:bg-[#FF7B7B] hover:text-white"
          >
            Print
          </Button>
          <Button
            size={"lg"}
            className="border-2 border-[#FF7B7B] bg-[#FF7B7B] font-bold text-white hover:bg-white hover:text-[#FF7B7B]"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <Card className="w-full p-5">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <CardDescription>Stocked In</CardDescription>
              <CardContent className="pl-0">
                <Label className="pb-3 pt-3 text-xl font-bold">40,689</Label>
              </CardContent>
            </div>
            <Image src={Stock_Icon} alt="stock icon" />
          </div>
          <CardFooter className="p-0">
            <div className="flex gap-1">
              <Image src={Up_Trend_Icon} alt="uptrend icon" width={15} />
              <Label className="text-[#00B69B]">8.5%</Label>
              <Label>Up from past week</Label>
            </div>
          </CardFooter>
        </Card>

        <Card className="w-full p-5">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <CardDescription>Stocked Out</CardDescription>
              <CardContent className="pl-0">
                <Label className="pb-3 pt-3 text-xl font-bold">10,293</Label>
              </CardContent>
            </div>
            <Image src={Stock_Icon} alt="stock icon" />
          </div>
          <CardFooter className="p-0">
            <div className="flex gap-1">
              <Image src={Up_Trend_Icon} alt="uptrend icon" width={15} />
              <Label className="text-[#00B69B]">1.3%</Label>
              <Label>Up from past week</Label>
            </div>
          </CardFooter>
        </Card>

        <Card className="w-full p-5">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <CardDescription>Stocked Out</CardDescription>
              <CardContent className="pl-0">
                <Label className="pb-3 pt-3 text-xl font-bold">10,293</Label>
              </CardContent>
            </div>
            <Image src={Sales_Icon} alt="stock icon" />
          </div>
          <CardFooter className="p-0">
            <div className="flex gap-1">
              <Image src={Down_Trend_Icon} alt="uptrend icon" width={15} />
              <Label className="text-[#F93C65]">1.3%</Label>
              <Label>Up from past week</Label>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="flex w-full justify-center">
        <DashboardChart />
      </div>
    </section>
  );
};

export default AdminDashboard;
