import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "~/components/ui/separator";
import { useRef } from "react";

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
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDoubleClick = useRef(false);

  const handleClick = (tab: "restock" | "invoice") => {
    if (clickTimerRef.current) {
      // Double click detected
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      isDoubleClick.current = true;
      
      // Navigate on double click
      navigateTo(tab);
      return;
    }
    
    clickTimerRef.current = setTimeout(() => {
      // If we reach here, it was a single click
      if (!isDoubleClick.current) {
        setSelectedTab(tab);
      }
      
      // Reset for next clicks
      clickTimerRef.current = null;
      isDoubleClick.current = false;
    }, 250); // 250ms threshold for detecting double clicks
  };
  
  const navigateTo = (type: "restock" | "invoice") => {
    if (type === "restock") {
      const url = `/admin/restock?clerkId=${clerkId}${employeeName ? `&searchQuery=${encodeURIComponent(employeeName || '')}` : ""}`;
      router.push(url);
    } else {
      const url = `/admin/invoice?clerkId=${clerkId}${employeeName ? `&searchQuery=${encodeURIComponent(employeeName || '')}` : ""}`;
      router.push(url);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex w-fit cursor-pointer items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500"
        onClick={() => handleClick("restock")}
      >
        Restock
        <ArrowUpRight
          className={`h-4 w-4 ${selectedTab === "restock" ? "block" : "hidden"}`}
        />
      </div>
      <Separator orientation="vertical" className="h-5 w-[2px]" />
      <div
        className="flex w-fit cursor-pointer items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500"
        onClick={() => handleClick("invoice")}
      >
        Invoice
        <ArrowUpRight
          className={`h-4 w-4 ${selectedTab === "invoice" ? "block" : "hidden"}`}
        />
      </div>
    </div>
  );
};

export default EmployeeTabs;
