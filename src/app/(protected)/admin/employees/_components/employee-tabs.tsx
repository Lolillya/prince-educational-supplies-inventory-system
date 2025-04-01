import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Separator } from "~/components/ui/separator";

interface EmployeeTabsProps {
  selectedTab: "restock" | "invoice";
  setSelectedTab: (tab: "restock" | "invoice") => void;
  clerkId: string;
  employeeName?: string | null | undefined;
}

const EmployeeTabs = ({
  selectedTab,
  setSelectedTab,
  clerkId,
  employeeName,
}: EmployeeTabsProps) => {
  const router = useRouter();

  const handleDoubleClick = (type: "restock" | "invoice") => {
    if (type === "restock") {
      const url = `/admin/restock?clerkId=${clerkId}${employeeName ? `&searchQuery=${encodeURIComponent(employeeName)}` : ""}`;
      router.push(url);
    } else {
      const url = `/admin/invoice?clerkId=${clerkId}${employeeName ? `&searchQuery=${encodeURIComponent(employeeName)}` : ""}`;
      router.push(url);
    }
  };
  return (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/restock?clerkId=${clerkId}${employeeName ? `&searchQuery=${encodeURIComponent(employeeName)}` : ""}`}
      >
        <div
          className="flex w-fit cursor-pointer items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500"
          onClick={() => setSelectedTab("restock")}
          onDoubleClick={() => handleDoubleClick("restock")}
        >
          Restock
          <ArrowUpRight
            className={`h-4 w-4 ${selectedTab === "restock" ? "block" : "hidden"}`}
          />
        </div>
      </Link>
      <Separator orientation="vertical" className="h-5 w-[2px]" />
      <Link
        href={`/admin/invoice?clerkId=${clerkId}${employeeName ? `&searchQuery=${encodeURIComponent(employeeName)}` : ""}`}
      >
        <div
          className="flex w-fit cursor-pointer items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500"
          onClick={() => setSelectedTab("invoice")}
          onDoubleClick={() => handleDoubleClick("invoice")}
        >
          Invoice
          <ArrowUpRight
            className={`h-4 w-4 ${selectedTab === "invoice" ? "block" : "hidden"}`}
          />
        </div>
      </Link>
    </div>
  );
};

export default EmployeeTabs;
