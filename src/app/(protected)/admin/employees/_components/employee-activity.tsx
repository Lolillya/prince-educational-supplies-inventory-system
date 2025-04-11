import { useState } from "react";
import { Separator } from "~/components/ui/separator";
import EmployeeTabs from "./employee-tabs";
import InvoiceDialog from "./invoice-dialog";
import RestockDialog from "./restock-dialog";

interface EmployeeActivityProps {
  restockId?: number;
  date?: string;
  employee?: string;
  addedStock?: number;
  restockData?: any;
  activityData?: {
    restocks: any[];
    invoices: any[];
  };
  clerkId: string;
  employeeName?: string | null | undefined;
}

const EmployeeActivity = ({
                            activityData,
                            clerkId,
                            employeeName,
                          }: EmployeeActivityProps) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"restock" | "invoice">(
      "restock",
  );

  const currentData =
      selectedTab === "restock"
          ? (activityData?.restocks ?? [])
          : (activityData?.invoices ?? []);

  const displayedData = showAll ? currentData : currentData.slice(0, 3);
  const totalCount = currentData.length;
  const shownCount = displayedData.length;

  return (
      <div className="rounded-lg bg-white/60 p-5 text-slate-400">
        <div className="flex items-center justify-between">
          <EmployeeTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              clerkId={clerkId}
              employeeName={employeeName}
          />
          {totalCount > 0 && (
              <p className="pr-5 text-sm text-slate-400">
                {shownCount} of {totalCount}
              </p>
          )}
        </div>
        <div className="mt-2">
          <div className="flex flex-col gap-1">
            {displayedData.map((activity) =>
                selectedTab === "restock" ? (
                    <RestockDialog
                        key={activity.batch_id}
                        restock={activity}
                        clerkId={clerkId}
                        activity={activity}
                        context="employee"
                    />
                ) : (
                    <div key={activity.invoice_id} onClick={() => console.log("Invoice clicked:", activity)}>
                      <InvoiceDialog
                          activity={activity}
                          invoice={{
                            invoice_number: activity.invoice_number,
                            created_at: activity.created_at,
                            total_amount: activity.total_amount,
                            invoiceClerk: activity.invoiceClerk || {
                              Personal_Details: {
                                first_name: "",
                                last_name: "",
                                company: "",
                              }
                            }
                          }}
                          id={activity.invoice_id.toString()}
                          context="employee"
                      />
                    </div>
                ),
            )}
            {totalCount === 0 && (
                <p className="py-4 text-center text-slate-400">No activity found</p>
            )}
            <Separator orientation="horizontal" className="h-[1px]" />
          </div>
        </div>
        {totalCount > 3 && (
            <div className="mt-4">
              <p
                  className="cursor-pointer text-center hover:underline"
                  onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show less" : "Show more"}
              </p>
            </div>
        )}
      </div>
  );
};

export default EmployeeActivity;
