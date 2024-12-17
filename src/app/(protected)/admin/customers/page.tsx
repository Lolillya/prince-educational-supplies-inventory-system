"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {useEffect, useState} from "react";
import { ListFilter, Pencil, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { UsersChart } from "../customers/_components/users-chart";
import { Separator } from "~/components/ui/separator";
import { LoadingSpinner } from "~/components/loading";
import { ScrollArea } from "~/components/ui/scroll-area";

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

interface Customer {
  id: string;
  Personal_Details_Id: string;
  role_Id: number;
  Personal_Details: PersonalDetails;
}

const CustomersPage = () => {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
      null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleNewCustomer = () => {
    router.push("/admin/customers/new-customer");
  };

  const handleEditCustomer = (id: string) => {
    router.push(`/admin/customers/edit-customer/${id}`);
  };
  const { data, isError, isLoading, refetch } = api.customers.list.useQuery();
  console.log(data);

  // Filter customers based on search term
  const filteredCustomers = data?.filter((customer) => {
    const company = customer.Personal_Details.company?.toLowerCase() ?? "";
    const contact = customer.Personal_Details.contact?.toLowerCase() ?? "";
    const email = customer.Personal_Details.email?.toLowerCase() ?? "";

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
          className={`flex h-auto w-screen flex-col gap-3 overflow-y-scroll p-10 pb-0`}
      >
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
                onClick={handleNewCustomer}
                className="bg-green p-5 font-bold"
            >
              + New Customer
            </Button>
          </div>
        </div>

        <div className="flex gap-10 overflow-hidden">
          <div className="flex w-1/2 flex-col rounded-md">
            <span>Records</span>
            <div className="mt-2 flex flex-col overflow-y-scroll pr-5">
              {filteredCustomers?.map((customer) => (
                  <Card
                      key={customer.Personal_Details_Id}
                      className={`flex cursor-pointer flex-col gap-3 p-7 transition-transform ${
                          selectedCustomer?.Personal_Details_Id ===
                          customer.Personal_Details_Id
                              ? "bg-gray"
                              : "bg-white"
                      } mb-4 rounded-md shadow-md transition-all duration-300 hover:bg-gray`}
                      onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center justify-between gap-5">
                      <div className="flex w-full items-center gap-5">
                        <Label>{customer.Personal_Details.company}</Label>
                      </div>
                      <div className="flex w-full flex-col gap-5">
                        <Label>{customer.Personal_Details_Id}</Label>
                      </div>
                      <div
                          className="transition-all duration-300 hover:scale-125"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCustomer(customer.Personal_Details_Id);
                          }}
                      >
                        <Pencil color="gray" />
                      </div>
                    </div>
                  </Card>
              ))}
            </div>
          </div>

          <div className="flex h-full w-1/2 flex-col">
            <span>Details</span>
            <div
                className="mt-2 flex h-full flex-col rounded-md bg-gray p-3 pr-5 min-h-[calc(100vh-200px)] overflow-auto">
              {selectedCustomer ? (
                  <div className="flex gap-5">
                    <div className="flex h-full w-full flex-col gap-3">
                      <UsersChart/>
                      <div className="flex items-center gap-5 text-xs">
                    <span className="font-bold">
                      {selectedCustomer.Personal_Details.company}
                    </span>
                        <span>{selectedCustomer.Personal_Details_Id}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                    <span className="font-ligh text-textGray">
                      Sales Person
                    </span>
                        <span>
                      {selectedCustomer.Personal_Details.first_name}{" "}
                          {selectedCustomer.Personal_Details.last_name}
                    </span>
                      </div>
                      <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">
                      Contact Number
                    </span>
                        <span>{selectedCustomer.Personal_Details.contact}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-light text-textGray">Email</span>
                        <span>{selectedCustomer.Personal_Details.email}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-light text-textGray">Location</span>
                        <span>
                      {selectedCustomer.Personal_Details.location
                          ?.address_line ?? "N/A"}
                    </span>
                        <span>
                      {selectedCustomer.Personal_Details.location?.city ??
                          "N/A"}
                    </span>
                        <span>
                      {selectedCustomer.Personal_Details.location?.region ??
                          "N/A"}
                    </span>
                        <span>
                      {selectedCustomer.Personal_Details.location?.country ??
                          "N/A"}
                    </span>
                        <span>
                      {selectedCustomer.Personal_Details.location
                          ?.postal_code ?? "N/A"}
                    </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-light text-textGray">Notes</span>
                        <span>{selectedCustomer.Personal_Details.notes}</span>
                      </div>
                    </div>

                    <Separator orientation="vertical"/>

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
                                      {selectedCustomer.id}
                                    </Label>
                                    <Label className="text-gray-600 text-xs">
                                      {selectedCustomer.Personal_Details.first_name}{" "}
                                      {selectedCustomer.Personal_Details.last_name}
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
                    Select a customer to view details
                  </p>
              )}
            </div>
          </div>
        </div>
      </section>
  );
};

export default CustomersPage;
