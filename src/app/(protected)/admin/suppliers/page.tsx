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
import SelectedSupplier from "./_components/selected-supplier";

interface Supplier {
  id: string;
  Personal_Details_Id: string;
  role_Id: number;
  emoji: string;
  Personal_Details: PersonalDetails;
}

interface PersonalDetails {
  personal_details_id: string;
  first_name: string | null;
  last_name: string | null;
  contact: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
  location_id: number | null;
  location: Location | null;
  auth?: {
    username: string;
  } | null;
}

interface Location {
  location_id: number;
  address_line?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

const SuppliersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<Supplier | null>(null);

  const { data: supplierData } = api.suppliers.list.useQuery();
  const { data: restockData } = api.restock.getRestockData.useQuery();

  const utils = api.useUtils();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const personalDetailsId = session?.user?.id; // Get the personal_details_id from the session

  // Get the selected supplier ID from URL if available
  const selectedSupplierId = searchParams.get("selected");

  // When supplier data is loaded, find and select the supplier with the matching ID
  useEffect(() => {
    if (selectedSupplierId && supplierData && !selectedRecord) {
      const supplierToSelect = supplierData.find(
        (supplier) => supplier.id === selectedSupplierId,
      );

      if (supplierToSelect) {
        setSelectedRecord(supplierToSelect);
      }
    }
  }, [selectedSupplierId, supplierData, selectedRecord]);

  const { data: restockActivity } = api.suppliers.getSupplierRestocks.useQuery(
    { supplierId: selectedRecord?.id ?? "" }, // Use selectedRecord.id (User_Role's id)
    { enabled: !!selectedRecord },
  );

  const activityData = {
    restocks: restockActivity ?? [],
  };

  const verifyPasswordMutation = api.suppliers.verifyPassword.useMutation();
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

  const deleteSupplierMutation = api.suppliers.delete.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
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

  const filteredSuppliers = supplierData?.filter((supplier) => {
    const company = supplier.Personal_Details.company?.toLowerCase() ?? "";
    const contact = supplier.Personal_Details.contact?.toLowerCase() ?? "";
    const email = supplier.Personal_Details.email?.toLowerCase() ?? "";

    return (
      company.includes(searchTerm.toLowerCase()) ??
      contact.includes(searchTerm.toLowerCase()) ??
      email.includes(searchTerm.toLowerCase())
    );
  });

  //TODO: Change reference to ID becuase companies might have the same name
  // const supplierRestockData = selectedRecord
  //   ? restockData?.filter((restock) => restock.supplier === selectedRecord.Personal_Details.company)
  //   : [];

  const handleDelete = async (id: string) => {
    if (!checkAdminRole()) return;
    try {
      await deleteSupplierMutation.mutateAsync({ id });
      void router.refresh();
    } catch (error) {
      console.error("Failed to delete supplier:", error);
    }
  };

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
          onClick={() => router.push("/admin/suppliers/new-supplier")}
          className="bg-green hover:bg-green/80"
        >
          <Plus strokeWidth={3} /> New Supplier
        </Button>
      </div>
      <div className="mt-8 flex flex-grow gap-3">
        <div className="flex w-3/5 flex-grow flex-col gap-3">
          <RecordHeader
            record="Suppliers"
            number={filteredSuppliers?.length ?? 0}
            data={filteredSuppliers ?? []}
          />
          <div className="flex h-full flex-grow overflow-hidden rounded-lg">
            {(filteredSuppliers?.length ?? 0) > 0 ? (
              <ScrollArea className="h-full w-full">
                <div className="flex h-40 w-full flex-col items-center">
                  {filteredSuppliers?.map((supplier) => (
                    <RecordItem
                      key={supplier.Personal_Details_Id}
                      name={supplier.Personal_Details.company}
                      id={supplier.Personal_Details_Id}
                      emoji={supplier.emoji}
                      onClick={() => setSelectedRecord(supplier)}
                      isSelected={
                        selectedRecord?.Personal_Details_Id ===
                        supplier.Personal_Details_Id
                      }
                      recordType={"Suppliers"}
                      onVerifyPassword={handleVerifyPassword}
                      onDelete={async (id) => {
                        if (!checkAdminRole()) return;
                        await handleDelete(id);
                      }}
                      userRole={userRole}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <NoRecordsMessage
                records={"suppliers"}
                link={"/admin/suppliers/new-supplier"}
                item={"supplier"}
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
                  <SelectedSupplier
                    id={selectedRecord.Personal_Details_Id}
                    role_Id={selectedRecord.role_Id}
                    emoji={selectedRecord.emoji}
                    company={selectedRecord.Personal_Details.company}
                    representative={
                      // `${selectedRecord.Personal_Details.first_name} ${selectedRecord.Personal_Details.last_name}`
                      [
                        selectedRecord.Personal_Details.first_name,
                        selectedRecord.Personal_Details.last_name,
                      ]
                        .filter((line) => line)
                        .join(" ")
                    }
                    contact={selectedRecord.Personal_Details.contact}
                    email={selectedRecord.Personal_Details.email}
                    location={[
                      selectedRecord.Personal_Details.location?.address_line,
                      selectedRecord.Personal_Details.location?.city,
                      selectedRecord.Personal_Details.location?.region,
                      selectedRecord.Personal_Details.location?.country,
                      selectedRecord.Personal_Details.location?.postal_code,
                    ]
                      .filter((line) => line)
                      .join("\n")}
                    notes={selectedRecord.Personal_Details.notes}
                    auth={selectedRecord.Personal_Details.auth}
                    // activityData={activityData}

                    // TODO: reflect restock data based on selected supplier
                    // restockData={supplierRestockData}
                    restockData={activityData}
                    clerkId={selectedRecord.id ?? ""}
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

export default SuppliersPage;
