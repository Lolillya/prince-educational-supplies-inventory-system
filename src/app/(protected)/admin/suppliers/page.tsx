"use client";

import { ListFilter, Pencil, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { UsersChart } from "../customers/_components/users-chart";

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
}

interface Location {
  location_id: number;
  address_line?: string;
  city?: string;
  region?: string;
  country?: string;
  postal_code?: string;
}

interface Supplier {
  id: string;
  Personal_Details_Id: string;
  role_Id: number;
  Personal_Details: PersonalDetails;
}

const SuppliersPage = () => {
  const router = useRouter();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleNewSupplier = () => {
    router.push("/admin/suppliers/new-supplier");
  };

  const handleEditSupplier = (id: string) => {
    router.push(`/admin/suppliers/edit-supplier/${id}`);
  };
  const { data, isError, isLoading, refetch } = api.suppliers.list.useQuery();
  console.log(data);

  // Filter suppliers based on search term
  const filteredSuppliers = data?.filter((supplier) => {
    const company = supplier.Personal_Details.company?.toLowerCase() ?? "";
    const contact = supplier.Personal_Details.contact?.toLowerCase() ?? "";
    const email = supplier.Personal_Details.email?.toLowerCase() ?? "";

    return (
      company.includes(searchTerm.toLowerCase()) ??
      contact.includes(searchTerm.toLowerCase()) ??
      email.includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    const handleRouteChange = () => {
      refetch(); // Refetch data whenever route changes
    };

    router.events?.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events?.off("routeChangeComplete", handleRouteChange);
    };
  }, [refetch, router.events]);


  if (isLoading) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <span>Error fetching data...</span>
      </section>
    );
  }

  return (
    <section
      className={`flex h-auto w-screen flex-col gap-3 overflow-y-scroll px-20 py-10`}
    >

      {/** Search bar */}
      <div className="flex items-center justify-between">
        <div className="flex h-16 w-full items-center justify-between gap-3">
          <div className="relative flex w-full max-w-md items-center gap-3">
            <Search className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 transform" />
            <Input
              placeholder="Search"
              className="bg-gray p-5 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Bind search input to state
            />
            <div className="bg-gray-100 hover:bg-gray-300 cursor-pointer rounded-md p-3">
              <ListFilter />
            </div>
          </div>
          <Button
            onClick={handleNewSupplier}
            className="bg-green p-5 font-bold">
            + New Supplier
          </Button>
        </div>
      </div>

    {/** Rows of items mapped -- turn this into a component */}
      <div className="flex gap-10 overflow-hidden">
        <div className="flex w-1/2 flex-col rounded-md">
          <span>Records</span>
          <div className="mt-2 flex flex-col overflow-y-scroll pr-5">
            {filteredSuppliers?.map((supplier) => (
              <Card
                key={supplier.Personal_Details_Id}
                className={`flex cursor-pointer flex-col gap-3 p-7 transition-transform ${selectedSupplier?.Personal_Details_Id ===
                  supplier.Personal_Details_Id
                  ? "bg-gray"
                  : "bg-white"
                  } mb-4 rounded-md shadow-md transition-all duration-300 hover:bg-gray`}
                onClick={() => setSelectedSupplier(supplier)}
              >
                <div className="flex items-center justify-between gap-5">
                  <div className="flex w-full items-center gap-5">
                    <Label>{supplier.Personal_Details.company}</Label>
                  </div>
                  <div className="flex w-full flex-col gap-5">
                    <Label>{supplier.Personal_Details_Id}</Label>
                  </div>
                  <div
                    className="transition-all duration-300 hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSupplier(supplier.Personal_Details_Id);
                    }}
                  >
                    <Pencil color="gray" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/** Record details -- turn this into a component */}
        <div className="flex h-full w-1/2 flex-col">
          <span>Details</span>
          <div className="mt-2 flex h-full flex-col rounded-md bg-gray p-3 pr-5 min-h-[calc(100vh-200px)] overflow-auto">
            {selectedSupplier ? (
              <div className="flex gap-5">
                <div className="flex h-full w-full flex-col gap-3">
                  <UsersChart />
                  <div className="flex items-center gap-5 text-xs">
                    <span className="font-bold">
                      {selectedSupplier.Personal_Details.company}
                    </span>
                    <span>{selectedSupplier.Personal_Details_Id}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-ligh text-textGray">
                      Representative
                    </span>
                    <span>
                      {selectedSupplier.Personal_Details.first_name}{" "}
                      {selectedSupplier.Personal_Details.last_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">
                      Contact Number
                    </span>
                    <span>{selectedSupplier.Personal_Details.contact}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">Email</span>
                    <span>{selectedSupplier.Personal_Details.email}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">Location</span>
                    <span>
                      {selectedSupplier.Personal_Details.location
                        ?.address_line ?? "N/A"}
                    </span>
                    <span>
                      {selectedSupplier.Personal_Details.location?.city ??
                        "N/A"}
                    </span>
                    <span>
                      {selectedSupplier.Personal_Details.location?.region ??
                        "N/A"}
                    </span>
                    <span>
                      {selectedSupplier.Personal_Details.location?.country ??
                        "N/A"}
                    </span>
                    <span>
                      {selectedSupplier.Personal_Details.location
                        ?.postal_code ?? "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">Notes</span>
                    <span>{selectedSupplier.Personal_Details.notes}</span>
                  </div>
                </div>

                <Separator orientation="vertical" />

                {/** Cards associated with the records */}
                <div className="flex w-full flex-col overflow-y-hidden">
                  <div className="flex items-center justify-between">
                    <Label className="text-textGray">Restocks</Label>
                    <Button variant={"link"} className="m-0 p-0 text-green">
                      View all
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-col pb-3">
                    <ScrollArea className="h-[calc(100vh-200px)] w-full">
                      <div className="mt-3 flex flex-col gap-3 pb-3 pr-3">
                        {[...Array(6)].map((_, index) => (
                          <Card
                            key={index}
                            className="flex w-full items-center justify-between p-5"
                          >
                            <div className="flex flex-col gap-3">
                              <Label className="text-xs">
                                {selectedSupplier.id}
                              </Label>
                              <Label className="text-gray-600 text-xs">
                                {selectedSupplier.Personal_Details.first_name}{" "}
                                {selectedSupplier.Personal_Details.last_name}
                              </Label>
                            </div>

                            <div className="text-gray-600 flex flex-col gap-3">
                              <Label className="text-xs">Date: 10/15/24</Label>
                              <Label className="text-xs">Time: 9:00 AM</Label>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mt-6 text-center">
                Select a supplier to view details
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuppliersPage;
