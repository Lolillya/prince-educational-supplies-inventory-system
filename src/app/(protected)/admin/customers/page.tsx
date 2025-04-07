"use client";

import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Toaster } from "~/components/ui/sonner";
import { api } from "~/trpc/react";
import Filter from "../_components/filter";
import NoRecordsMessage from "../_components/no-records-message";
import RecordHeader from "../_components/record-header";
import RecordItem from "../_components/record-item";
import SearchBar from "../_components/search-bar";
import SelectRecordMessage from "../_components/select-record-message";
import SelectedCustomer from "./_components/selected-customer";

interface PersonalDetails {
  personal_details_id: string;
  location_id: number;
  contact: string | null;
  email: string | null;
  notes: string | null;
  location: Location | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  auth?: {
    username: string;
  } | null;
}

interface Customer {
  id: string;
  Personal_Details_Id: string;
  role_Id: number;
  emoji: string;
  Personal_Details: PersonalDetails;
  customerInvoices: {
    invoice_number: number;
    created_at: Date;
    total_amount: number;
    invoiceClerk: {
      Personal_Details: {
        first_name: string;
        last_name: string;
        company: string;
      };
    };
  }[];
  unpaidAmount?: number;
  hasUnpaidInvoices?: boolean;
}

interface Location {
  location_id: number;
  address_line?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

const CustomersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<Customer | null>(null);
  const [customersWithUnpaidStatus, setCustomersWithUnpaidStatus] = useState<
    Map<string, { amount: number; hasUnpaid: boolean }>
  >(new Map());

  const { data: customerData } = api.customers.list.useQuery();
  const customerIdParam = searchParams.get("customerId");

  // Effect to select customer when data is loaded and customerId is present
  useEffect(() => {
    if (customerData && customerIdParam) {
      const customer = customerData.find(
        (customer) => customer.Personal_Details_Id === customerIdParam,
      );
      if (customer) {
        setSelectedRecord(customer as Customer);
      }
    }
  }, [customerData, customerIdParam]);

  const utils = api.useUtils();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const personalDetailsId = session?.user?.id; // Get the personal_details_id from the session

  const { data: invoiceActivity } = api.customers.getCustomerInvoices.useQuery(
    { customerId: selectedRecord?.Personal_Details_Id ?? "" },
    { enabled: !!selectedRecord },
  );

  const activityCustomerData = {
    invoices: invoiceActivity ?? [],
  };

  // Add unpaid invoices query
  const { data: unpaidInvoices } = api.customers.unpaidInvoices.useQuery(
    { customerId: selectedRecord?.Personal_Details_Id ?? "" },
    { enabled: !!selectedRecord },
  );

  // Calculate sum correctly
  const unpaidSum =
    unpaidInvoices?.reduce((sum, invoice) => sum + invoice.remaining, 0) ?? 0;

  const { refetch } = api.customers.unpaidInvoices.useQuery(
    { customerId: selectedRecord?.Personal_Details_Id ?? "" },
    { enabled: !!selectedRecord },
  );

  // Check unpaid invoices for all customers - optimize by using a prefetch strategy
  const checkUnpaidQuery = api.useUtils().customers.unpaidInvoices;

  // Function to get latest unpaid balance for a customer - with debouncing/caching
  const unpaidBalanceCache = new Map<
    string,
    { amount: number; hasUnpaid: boolean; timestamp: number }
  >();
  const CACHE_EXPIRY_MS = 30000; // 30 seconds cache validity

  const getLatestUnpaidBalance = async (customerId: string) => {
    const now = Date.now();
    const cachedValue = unpaidBalanceCache.get(customerId);

    // Use cached value if available and not expired
    if (cachedValue && now - cachedValue.timestamp < CACHE_EXPIRY_MS) {
      return {
        amount: cachedValue.amount,
        hasUnpaid: cachedValue.hasUnpaid,
      };
    }

    try {
      const unpaidData = await checkUnpaidQuery.fetch({
        customerId,
      });

      const totalUnpaid = unpaidData.reduce(
        (sum, invoice) => sum + invoice.remaining,
        0,
      );

      const result = {
        amount: totalUnpaid,
        hasUnpaid: totalUnpaid > 0,
      };

      // Cache the result with timestamp
      unpaidBalanceCache.set(customerId, {
        ...result,
        timestamp: now,
      });

      return result;
    } catch (error) {
      console.error(
        `Error fetching unpaid invoices for customer ${customerId}:`,
        error,
      );
      return { amount: 0, hasUnpaid: false };
    }
  };

  // Use effect to check unpaid invoices for all customers - optimize to reduce number of requests
  useEffect(() => {
    if (customerData) {
      const fetchUnpaidForAllCustomers = async () => {
        const unpaidMap = new Map<
          string,
          { amount: number; hasUnpaid: boolean }
        >();

        // Process customers in batches to avoid too many simultaneous requests
        const batchSize = 3; // Reduced batch size to prevent overloading
        for (let i = 0; i < customerData.length; i += batchSize) {
          const batch = customerData.slice(i, i + batchSize);

          // Process each batch with Promise.all for better performance
          const promises = batch.map(async (customer) => {
            const customerId = customer.Personal_Details_Id;
            return {
              id: customerId,
              data: await getLatestUnpaidBalance(customerId),
            };
          });

          // Wait for all promises in this batch to resolve
          const results = await Promise.all(promises);

          // Update the map with the results
          results.forEach((result) => {
            unpaidMap.set(result.id, result.data);
          });

          // Add a small delay between batches to prevent UI freezing
          if (i + batchSize < customerData.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        setCustomersWithUnpaidStatus(unpaidMap);
      };

      void fetchUnpaidForAllCustomers();
    }
  }, [customerData]);

  const verifyPasswordMutation = api.customers.verifyPassword.useMutation();
  const handleVerifyPassword = async (password: string) => {
    if (!personalDetailsId) return false;

    try {
      const result = await verifyPasswordMutation.mutateAsync({
        personalDetailsId,
        password,
      });
      return result.success;
    } catch (error) {
      return false;
    }
  };

  const deleteCustomerMutation = api.customers.delete.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      setSelectedRecord(null);
    },
    onError: (error) => {
      console.error("Error deleting supplier:", error.message);
    },
  });

  const checkAdminRole = () => {
    if (userRole !== "ADMIN") {
      alert("Only ADMIN users can delete suppliers");
      return false;
    }
    return true;
  };

  const handleDelete = (id: string): Promise<void> => {
    if (!checkAdminRole()) return Promise.resolve();

    // We no longer need to check for unpaid invoices here
    // as the Delete component will handle it with the props we pass

    return deleteCustomerMutation
      .mutateAsync({ id })
      .then(() => {
        void router.refresh();
      })
      .catch((error) => {
        console.error("Failed to delete customer:", error);
        throw error;
      });
  };

  // Add a function to handle refund success
  const handleRefundSuccess = () => {
    // Refetch unpaid invoices to update the total
    void refetch();
  };

  const filteredCustomers = customerData?.filter((customer) => {
    const company = customer.Personal_Details.company?.toLowerCase() ?? "";
    const contact = customer.Personal_Details.contact?.toLowerCase() ?? "";
    const email = customer.Personal_Details.email?.toLowerCase() ?? "";

    return (
      company.includes(searchTerm.toLowerCase()) ??
      contact.includes(searchTerm.toLowerCase()) ??
      email.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <section className="flex min-h-screen flex-col px-20 py-10 text-base">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter />
        </div>
        <Button
          onClick={() => router.push("/admin/customers/new-customer")}
          className="bg-green hover:bg-green/80"
        >
          <Plus strokeWidth={3} /> New Customer
        </Button>
      </div>
      <div className="mt-8 flex flex-grow gap-3">
        <div className="flex w-3/5 flex-grow flex-col gap-3">
          <RecordHeader
            record="Customers"
            number={filteredCustomers?.length ?? 0}
            data={
              filteredCustomers?.map((customer) => ({
                ...customer,
                Personal_Details: {
                  ...customer.Personal_Details,
                  personal_details_id: customer.Personal_Details_Id,
                  location_id:
                    customer.Personal_Details.location?.location_id ?? 0,
                },
              })) ?? []
            }
          />
          <div className="flex h-full flex-grow overflow-hidden rounded-lg">
            {(filteredCustomers?.length ?? 0) > 0 ? (
              <ScrollArea className="h-full w-full">
                <div className="flex h-40 w-full flex-col items-center">
                  {filteredCustomers?.map((customer) => {
                    const unpaidStatus = customersWithUnpaidStatus.get(
                      customer.Personal_Details_Id,
                    );
                    return (
                      <RecordItem
                        key={customer.Personal_Details_Id}
                        name={customer.Personal_Details.company}
                        id={customer.Personal_Details_Id}
                        emoji={customer.emoji}
                        onClick={() => setSelectedRecord(customer as Customer)}
                        isSelected={
                          selectedRecord?.Personal_Details_Id ===
                          customer.Personal_Details_Id
                        }
                        recordType={"Customers"}
                        onVerifyPassword={handleVerifyPassword}
                        onDelete={handleDelete}
                        userRole={userRole}
                        unpaidAmount={unpaidStatus?.amount ?? 0}
                        hasUnpaidInvoices={unpaidStatus?.hasUnpaid ?? false}
                        getLatestUnpaidBalance={() =>
                          getLatestUnpaidBalance(customer.Personal_Details_Id)
                        }
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <NoRecordsMessage
                records={"customers"}
                link={"/admin/customers/new-customer"}
                item={"customer"}
              />
            )}
          </div>
        </div>
        <div className="flex w-2/5 flex-grow flex-col gap-3">
          <div className="w-full rounded-lg bg-slate-100 px-6 py-3 text-lg">
            <p className="text-slate-500">Details</p>
          </div>
          <div className="flex flex-grow rounded-lg bg-slate-100">
            {selectedRecord ? (
              <ScrollArea className="h-full w-full">
                <div className="flex h-40 w-full flex-col">
                  <SelectedCustomer
                    first_name={
                      selectedRecord.Personal_Details.first_name ?? ""
                    }
                    last_name={selectedRecord.Personal_Details.last_name ?? ""}
                    id={selectedRecord.Personal_Details_Id}
                    role_Id={selectedRecord.role_Id}
                    emoji={selectedRecord.emoji}
                    company={selectedRecord.Personal_Details.company ?? ""}
                    representative={[
                      selectedRecord.Personal_Details.first_name,
                      selectedRecord.Personal_Details.last_name,
                    ]
                      .filter((line) => line)
                      .join(" ")}
                    contact={selectedRecord.Personal_Details.contact ?? ""}
                    email={selectedRecord.Personal_Details.email ?? ""}
                    invoiceData={selectedRecord.customerInvoices}
                    location={[
                      selectedRecord.Personal_Details.location?.address_line,
                      selectedRecord.Personal_Details.location?.city,
                      selectedRecord.Personal_Details.location?.region,
                      selectedRecord.Personal_Details.location?.country,
                      selectedRecord.Personal_Details.location?.postal_code,
                    ]
                      .filter((line) => line)
                      .join("\n")}
                    notes={selectedRecord.Personal_Details.notes ?? ""}
                    auth={selectedRecord.Personal_Details.auth}
                    // activityData={activityData}
                    // TODO: reflect restock data based on selected supplier
                    // restockData={supplierRestockData}
                    invoiceHistoryData={activityCustomerData}
                    clerkId={selectedRecord.id ?? ""}
                    unpaidInvoices={unpaidInvoices ?? []}
                    unpaidSum={unpaidSum}
                    onPaymentSuccess={() => refetch()}
                    onRefundSuccess={handleRefundSuccess}
                  />
                </div>
              </ScrollArea>
            ) : (
              <SelectRecordMessage />
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  );
};

export default CustomersPage;
