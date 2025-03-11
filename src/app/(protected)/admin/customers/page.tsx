"use client";

import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<Customer | null>(null);

  const { data: customerData } = api.customers.list.useQuery();


  const utils = api.useUtils();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const personalDetailsId = session?.user?.id; // Get the personal_details_id from the session

  const { data: invoiceActivity } = api.customers.getCustomerInvoices.useQuery(
    { customerId: selectedRecord?.id ?? '' }, // Use selectedRecord.id (User_Role's id)
    { enabled: !!selectedRecord }
  );

  const activityCustomerData = {
    invoices: invoiceActivity ?? []
  };

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
    if (userRole !== 'ADMIN') {
      alert('Only ADMIN users can delete suppliers');
      return false;
    }
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!checkAdminRole()) return;
    try {
      await deleteCustomerMutation.mutateAsync({ id });
      void router.refresh();
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
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
            data={filteredCustomers?.map(customer => ({
              ...customer,
              Personal_Details: {
                ...customer.Personal_Details,
                personal_details_id: customer.Personal_Details_Id,
                location_id: customer.Personal_Details.location?.location_id ?? 0,
              }
            })) ?? []}
          />
          <div className="flex h-full flex-grow overflow-hidden rounded-lg">
            {(filteredCustomers?.length ?? 0) > 0 ? (
              <ScrollArea className="h-full w-full">
                <div className="flex h-40 w-full flex-col items-center">
                  {filteredCustomers?.map((customer) => (
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
                      recordType={'Customers'}
                      onVerifyPassword={handleVerifyPassword}
                      onDelete={(id) => {
                        handleDelete(id);
                      }}
                      userRole={userRole}
                    />
                  ))}
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
                    representative={`${selectedRecord.Personal_Details.first_name} ${selectedRecord.Personal_Details.last_name}`}
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
                    clerkId={selectedRecord.id ?? ''}
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
