// src/components/ui/supplierpageui.tsx
"use client";

import { Poppins } from "next/font/google";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Pencil, Search, ListFilter } from "lucide-react";
import { UsersChart } from "~/components/users-chart";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const SupplierPageUI = ({
  filteredSuppliers,
  expandedCardId,
  setExpandedCardId,
  handleNewSupplier,
  handleEditSupplier,
  searchTerm,
  setSearchTerm,
}: {
  filteredSuppliers: any[];
  expandedCardId: number | null;
  setExpandedCardId: (id: number | null) => void;
  handleNewSupplier: () => void;
  handleEditSupplier: (id: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}) => {
  const handleCardClick = (supplierId: number) => {
    setExpandedCardId(expandedCardId === supplierId ? null : supplierId);
  };

  const selectedSupplier = filteredSuppliers?.find(
    (supplier) => supplier.supplier_id === expandedCardId,
  );
  return (
    <section
      className={`h-screen w-screen p-10 ${poppins.className} flex flex-col gap-3`}
    >
      {/* Search and New Supplier Button */}
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
            onClick={handleNewSupplier}
            className="bg-[#FF7B7B] p-5 font-bold"
          >
            + New Supplier
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-5 flex gap-10">
        <div className="mx-4 my-4 flex w-1/2 flex-col md:mx-8 md:my-6">
          <span>Records</span>
          <div className="mt-2 flex max-h-[75vh] min-h-[50vh] flex-col overflow-y-auto md:max-h-[80vh]">
            {filteredSuppliers?.map((supplier) => (
              <Card
                key={supplier.supplier_id}
                className={`flex cursor-pointer flex-col gap-3 p-7 transition-transform ${
                  expandedCardId === supplier.supplier_id
                    ? "bg-gray-300"
                    : "bg-white"
                } hover:bg-gray-100 mb-4 rounded-md shadow-md`}
                onClick={() => handleCardClick(supplier.supplier_id)}
              >
                <div className="flex items-center justify-between gap-5">
                  <div className="flex items-center gap-5">
                    <Label>{supplier.personal_details.company}</Label>
                  </div>
                  <div className="flex flex-col gap-5">
                    <Label>{supplier.supplier_id}</Label>
                  </div>
                  <div
                    className="hover:cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSupplier(supplier.supplier_id);
                    }}
                  >
                    <Pencil color="gray" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Supplier Details Section */}
        <div className="flex h-full w-3/4 flex-col">
          <span>Details</span>
          <div className="bg-gray-200 flex h-full w-full flex-col rounded-lg p-5">
            {selectedSupplier ? (
              <div className="flex flex-col gap-5">
                <UsersChart />
                <div className="flex items-center gap-5">
                  <span className="font-bold">
                    {selectedSupplier.personal_details.company}
                  </span>
                  <span>{selectedSupplier.supplier_id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">Sales Person</span>
                  <span>
                    {selectedSupplier.personal_details.first_name}{" "}
                    {selectedSupplier.personal_details.last_name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">
                    Contact Number
                  </span>
                  <span>{selectedSupplier.personal_details.contact}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">Email</span>
                  <span>{selectedSupplier.personal_details.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">Location</span>
                  <span>
                    {selectedSupplier.personal_details.location?.address_line ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedSupplier.personal_details.location?.city || "N/A"}
                  </span>
                  <span>
                    {selectedSupplier.personal_details.location?.region ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedSupplier.personal_details.location?.country ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedSupplier.personal_details.location?.postal_code ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 font-light">Notes</span>
                  <span>{selectedSupplier.personal_details.notes}</span>
                </div>
                {/* Additional supplier details here */}
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

export default SupplierPageUI;
