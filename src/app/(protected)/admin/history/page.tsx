import { ListFilter, Search } from "lucide-react";
import { Poppins } from "next/font/google";

import { Button } from "~/components/ui/button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const HistoryPage = async () => {
  // const inventoryItems = await api.items.getAll();
  return (
    <section
      className={`h-auto w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <div className="relative flex items-center justify-between px-3">
        <div className="flex h-16 w-full items-center justify-between gap-3">
          <div className="relative flex h-auto w-full max-w-md gap-3">
            <Search className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 transform" />
            <input placeholder="Search" className="bg-gray-100 p-5 pl-10" />

            <div className="bg-gray-100 hover:bg-gray-300 rounded-md p-3 hover:cursor-pointer">
              <ListFilter />
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex h-full justify-between gap-3 px-3">
        <div className="flex w-full flex-col">
          <span>Records</span>
          <div className="flex flex-col gap-3">
            {/* {inventoryItems.map((item) => ( */}
            <div className="hover:bg-gray-200 flex items-center justify-between rounded-md px-7 py-5">
              <div className="flex w-full items-center gap-3">
                <span>test</span>
                <span>test</span>
                <span className="text-gray-400 text-xs">test</span>
              </div>

              <div className="w-full">
                <span>10:53 AM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full w-full flex-col">
          <span>Details</span>
          <div className="bg-gray-200 flex h-full w-full flex-col rounded-lg p-10">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-5">
                <span className="font-bold">Stock Out | October 8, 2024</span>
                <span>10:53 AM</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-400 font-light">Customer</span>
                <span>The Huang Company</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-400 font-light">Employee</span>
                <span>Jerald Dagaang</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-400 font-light">Invoice</span>
                <span>12345678</span>
              </div>

              <div className="flex w-full items-center gap-3">
                <Button className="w-full p-6 text-lg font-bold" size={"lg"}>
                  Delete
                </Button>
                <Button className="w-full p-6 text-lg font-bold" size={"lg"}>
                  Revert
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-400 text-xs font-light">
                  Note: History will be deleted after 365 days.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoryPage;
