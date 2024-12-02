"use client";
// src/app/admin/customers/page.tsx
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import CustomersPageUI from "./_components/customerpage";
import { useState } from "react";
import { ListFilter, Pencil, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

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
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [selectedCustomer, setselectedCustomer] = useState<Customer | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleNewCustomer = () => {
    router.push("/admin/customers/new-customer"); // Redirect to create new customer
  };
  const handleEditCustomer = (customerId: string) => {
    router.push(`/admin/customers/edit-customer/${customerId}`); // Redirect to edit customer
  };

  const { data: customers, isLoading } = api.customer.list.useQuery();

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  // Filter customers based on search term
  // const filteredCustomers = customers?.filter((customer) => {
  //   if (!searchTerm) {
  //     return true;
  //   }
  //   const companyName = customer.personal_details.company.toLowerCase();
  //   const searchValue = searchTerm.toLowerCase();
  //   return companyName.includes(searchValue);
  // });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="flex w-full flex-col gap-3 p-10">
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

      <div className="flex gap-10">
        <div className="flex w-[80%] flex-col rounded-md">
          <span>Records</span>
          <div className="mt-2 flex max-h-[75vh] min-h-[50vh] flex-col overflow-y-auto pr-5 md:max-h-[80vh]">
            {customers?.map((customer) => (
              <Card
                key={customer.Personal_Details_Id}
                className={`flex cursor-pointer flex-col gap-3 p-7 transition-transform ${
                  selectedCustomer?.Personal_Details_Id ===
                  customer.Personal_Details_Id
                    ? "bg-gray"
                    : "bg-white"
                } mb-4 rounded-md shadow-md transition-all duration-300 hover:bg-gray`}
                onClick={() => setselectedCustomer(customer)}
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

        <div className="flex h-full w-full flex-col">
          <span>Details</span>
          <div className="mt-2 flex h-full flex-col overflow-y-hidden rounded-md bg-gray p-3 pr-5 md:max-h-[80vh]">
            {selectedCustomer ? (
              <div className="flex gap-5">
                <div className="flex h-full w-full flex-col gap-3">
                  {/* <UsersChart /> */}
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
                        ?.address_line || "N/A"}
                    </span>
                    <span>
                      {selectedCustomer.Personal_Details.location?.city ||
                        "N/A"}
                    </span>
                    <span>
                      {selectedCustomer.Personal_Details.location?.region ||
                        "N/A"}
                    </span>
                    <span>
                      {selectedCustomer.Personal_Details.location?.country ||
                        "N/A"}
                    </span>
                    <span>
                      {selectedCustomer.Personal_Details.location
                        ?.postal_code || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">Notes</span>
                    <span>{selectedCustomer.Personal_Details.notes}</span>
                  </div>
                </div>

                <Separator orientation="vertical" />

                <div className="flex w-full flex-col">
                  <div className="flex items-center justify-between">
                    <Label className="text-textGray">Restocks</Label>
                    <Button variant={"link"} className="m-0 p-0 text-green">
                      View all
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 overflow-y-auto pb-3">
                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedCustomer.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedCustomer.Personal_Details.first_name}{" "}
                          {selectedCustomer.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedCustomer.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedCustomer.Personal_Details.first_name}{" "}
                          {selectedCustomer.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedCustomer.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedCustomer.Personal_Details.first_name}{" "}
                          {selectedCustomer.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedCustomer.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedCustomer.Personal_Details.first_name}{" "}
                          {selectedCustomer.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedCustomer.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedCustomer.Personal_Details.first_name}{" "}
                          {selectedCustomer.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>
                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedCustomer.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedCustomer.Personal_Details.first_name}{" "}
                          {selectedCustomer.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>
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
    // <CustomersPageUI
    //   filteredCustomers={filteredCustomers}
    //   expandedCardId={expandedCardId}
    //   setExpandedCardId={setExpandedCardId}
    //   handleNewCustomer={handleNewCustomer}
    //   handleEditCustomer={handleEditCustomer}
    //   searchTerm={searchTerm}
    //   setSearchTerm={setSearchTerm}
    // />
  );
};

export default CustomersPage;
