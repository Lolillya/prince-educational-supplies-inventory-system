"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useState } from "react";
import { ListFilter, Pencil, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { UsersChart } from "../customers/_components/users-chart";
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

interface Supplier {
  id: string;
  Personal_Details_Id: string;
  role_Id: number;
  Personal_Details: PersonalDetails;
}

const SuppliersPage = () => {
  const router = useRouter();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleNewSupplier = () => {
    router.push("/admin/suppliers/new-supplier");
  };

  const handleEditSupplier = (supplierId: string) => {
    router.push(`/admin/suppliers/edit-supplier/${supplierId}`);
  };
  const { data, isError, isLoading } = api.suppliers.list.useQuery();
  console.log(data);

  // const filteredSuppliers = data?.filter((supplier) => {
  //   if (!searchTerm) {
  //     return true;
  // }

  // const companyName = data.Personal_Details.company.toLowerCase();
  // const searchValue = searchTerm.toLowerCase();
  // return companyName.includes(searchValue);
  // });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data...</div>;
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
            onClick={handleNewSupplier}
            className="bg-green p-5 font-bold"
          >
            + New Supplier
          </Button>
        </div>
      </div>

      <div className="flex gap-10">
        <div className="flex w-1/2 flex-col rounded-md">
          <span>Records</span>
          <div className="mt-2 flex max-h-[75vh] min-h-[50vh] flex-col overflow-y-auto pr-5 md:max-h-[80vh]">
            {data?.map((supplier) => (
              <Card
                key={supplier.Personal_Details_Id}
                className={`flex cursor-pointer flex-col gap-3 p-7 transition-transform ${
                  expandedCardId === supplier.Personal_Details_Id
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

        <div className="flex h-full w-1/2 flex-col">
          <span>Details</span>
          <div className="mt-2 flex h-full flex-col overflow-y-hidden rounded-md bg-gray p-3 pr-5 md:max-h-[80vh]">
            {selectedSupplier ? (
              <div className="flex flex-col gap-5">
                {/* <UsersChart /> */}
                <div className="flex items-center gap-5">
                  <span className="font-bold">
                    {selectedSupplier.Personal_Details.company}
                  </span>
                  <span>{selectedSupplier.Personal_Details_Id}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-ligh text-textGray">Sales Person</span>
                  <span>
                    {selectedSupplier.Personal_Details.first_name}{" "}
                    {selectedSupplier.Personal_Details.last_name}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-textGray font-light">
                    Contact Number
                  </span>
                  <span>{selectedSupplier.Personal_Details.contact}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-textGray font-light">Email</span>
                  <span>{selectedSupplier.Personal_Details.email}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-textGray font-light">Location</span>
                  <span>
                    {selectedSupplier.Personal_Details.location?.address_line ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedSupplier.Personal_Details.location?.city || "N/A"}
                  </span>
                  <span>
                    {selectedSupplier.Personal_Details.location?.region ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedSupplier.Personal_Details.location?.country ||
                      "N/A"}
                  </span>
                  <span>
                    {selectedSupplier.Personal_Details.location?.postal_code ||
                      "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-textGray font-light">Notes</span>
                  <span>{selectedSupplier.Personal_Details.notes}</span>
                </div>
                <div className="flex w-full flex-col">
                  <div className="flex items-center justify-between">
                    <Label className="text-textGray">Restocks</Label>
                    <Button variant={"link"} className="m-0 p-0 text-green">
                      View all
                    </Button>
                  </div>
                  <Separator orientation="horizontal" />
                  <div
                    className="mt-3 flex flex-col gap-3 overflow-y-auto pb-3 pr-3"
                    style={{ maxHeight: "200px" }}
                  >
                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label>{selectedSupplier.id}</Label>
                        <Label className="text-textGray">
                          {selectedSupplier.Personal_Details.first_name}{" "}
                          {selectedSupplier.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="text-textGray flex flex-col gap-3">
                        <Label>Date: 10/15/24</Label>
                        <Label>Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label>{selectedSupplier.id}</Label>
                        <Label className="text-textGray">
                          {selectedSupplier.Personal_Details.first_name}{" "}
                          {selectedSupplier.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="text-textGray flex flex-col gap-3">
                        <Label>Date: 10/15/24</Label>
                        <Label>Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label>{selectedSupplier.id}</Label>
                        <Label className="text-textGray">
                          {selectedSupplier.Personal_Details.first_name}{" "}
                          {selectedSupplier.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="text-textGray flex flex-col gap-3">
                        <Label>Date: 10/15/24</Label>
                        <Label>Time: 9:00 AM</Label>
                      </div>
                    </Card>
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
