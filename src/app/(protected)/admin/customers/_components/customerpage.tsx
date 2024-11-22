// src/components/CustomersPageUI.tsx
"use client";

import { Poppins } from "next/font/google";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { UsersChart } from "~/components/users-chart";

import { Pencil, Search, ListFilter } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const CustomersPageUI = ({
  filteredCustomers,
  expandedCardId,
  setExpandedCardId,
  handleNewCustomer,
  handleEditCustomer,
  searchTerm,
  setSearchTerm,
}: {
  filteredCustomers: any[];
  expandedCardId: number | null;
  setExpandedCardId: (id: number | null) => void;
  handleNewCustomer: () => void;
  handleEditCustomer: (id: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) => {
  const handleCardClick = (customerId: number) => {
    setExpandedCardId(expandedCardId === customerId ? null : customerId);
  };

  const selectedCustomer = filteredCustomers?.find(
    (customer) => customer.customer_id === expandedCardId,
  );

  return (
    <section
      className={`h-screen w-screen p-10 ${poppins.className} flex flex-col gap-3`}
    >
      {/* Search and New Customer Button */}
      <div className="flex items-center justify-between">
        <div className="flex h-16 w-full items-center justify-between gap-3">
          <div className="relative flex w-full max-w-md gap-3">
            <Search className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 transform" />
            <input
              placeholder="Search"
              className="bg-gray-100 p-5 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Bind search input to state
            />
            <div className="bg-gray-100 hover:bg-gray-300 cursor-pointer rounded-md p-3">
              <ListFilter />
            </div>
          </div>
          <Button
            onClick={handleNewCustomer}
            className="bg-[#FF7B7B] p-5 font-bold"
          >
            + New Customer
          </Button>
        </div>
      </div>
      {/* Main Content Layout */}
      <div className="mt-5 flex gap-10">
        <div className="mx-4 my-4 flex w-1/2 flex-col md:mx-8 md:my-6">
          <span>Records</span>
          <div className="mt-2 flex max-h-[75vh] min-h-[50vh] flex-col overflow-y-auto md:max-h-[80vh]">
            {filteredCustomers?.map((customer) => (
              <Card
                key={customer.customer_id}
                className={`flex cursor-pointer flex-col gap-3 p-7 transition-transform ${
                  expandedCardId === customer.customer_id
                    ? "bg-gray-300"
                    : "bg-white"
                } hover:bg-gray-100 mb-4 rounded-md shadow-md`}
                onClick={() => handleCardClick(customer.customer_id)}
              >
                <div className="flex items-center justify-between gap-5">
                  <div className="flex items-center gap-5">
                    <Label>{customer.personal_details.company}</Label>
                  </div>
                  <div className="flex flex-col gap-5">
                    <Label>{customer.customer_id}</Label>
                  </div>
                  <div
                    className="hover:cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCustomer(customer.customer_id);
                    }}
                  >
                    <Pencil color="gray" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Customer Details Section */}
        <div className="flex h-full w-3/4 flex-col">
          <span>Details</span>
          <div className="bg-gray-200 flex h-full w-full flex-col rounded-lg p-5">
            {selectedCustomer ? (
              <div className="flex flex-col gap-5">
                <UsersChart />
                <div className="flex items-center gap-5">
                  <span className="font-bold">
                    {selectedCustomer.personal_details.company}
                  </span>
                  <span>{selectedCustomer.customer_id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">Sales Person</span>
                  <span>
                    {selectedCustomer.personal_details.first_name}{" "}
                    {selectedCustomer.personal_details.last_name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">
                    Contact Number
                  </span>
                  <span>{selectedCustomer.personal_details.contact}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">Email</span>
                  <span>{selectedCustomer.personal_details.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">Location</span>
                  <span>
                    {selectedCustomer.personal_details.location?.address_line ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedCustomer.personal_details.location?.city || "N/A"}
                  </span>
                  <span>
                    {selectedCustomer.personal_details.location?.region ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedCustomer.personal_details.location?.country ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedCustomer.personal_details.location?.postal_code ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">Notes</span>
                  <span>{selectedCustomer.personal_details.notes}</span>
                </div>
                {/* Additional customers details here */}
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

export default CustomersPageUI;
