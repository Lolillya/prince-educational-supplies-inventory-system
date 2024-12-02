"use client";
// src/app/admin/customers/page.tsx
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
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

interface Employee {
  id: string;
  Personal_Details_Id: string;
  role_Id: number;
  Personal_Details: PersonalDetails;
}

const EmployeesPage = () => {
  const router = useRouter();
  const [selectedEmployee, setselectedEmployee] = useState<Employee | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleNewEmployee = () => {
    router.push("/admin/employees/new-employee"); // Redirect to create new employee
  };

  const handleEditEmployee = (employeeId: string) => {
    router.push(`/admin/employees/edit-employee/${employeeId}`); // Redirect to edit employee
  };

  const { data: employees, isLoading } = api.employees.list.useQuery();

  // Filter employees based on search term
  const filteredEmployees = employees?.filter((employee) => {
    if (!searchTerm) {
      return true; // Show all items when searchTerm is empty
    }

    const fullName =
      `${employee.Personal_Details.first_name} ${employee.Personal_Details.last_name}`.toLowerCase();
    const searchValue = searchTerm.toLowerCase();
    return fullName.includes(searchValue); // Check if the full name includes the search term
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    // <EmployeePageUI
    //   filteredEmployees={filteredEmployees}
    //   expandedCardId={expandedCardId}
    //   setExpandedCardId={setExpandedCardId}
    //   handleNewEmployee={handleNewEmployee}
    //   handleEditEmployee={handleEditEmployee}
    //   searchTerm={searchTerm}
    //   setSearchTerm={setSearchTerm}
    // />
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
            onClick={handleNewEmployee}
            className="bg-green p-5 font-bold"
          >
            + New employee
          </Button>
        </div>
      </div>

      <div className="flex gap-10">
        <div className="flex w-[80%] flex-col rounded-md">
          <span>Records</span>
          <div className="mt-2 flex max-h-[75vh] min-h-[50vh] flex-col overflow-y-auto pr-5 md:max-h-[80vh]">
            {employees?.map((employee) => (
              <Card
                key={employee.Personal_Details_Id}
                className={`flex cursor-pointer flex-col gap-3 p-7 transition-transform ${
                  selectedEmployee?.Personal_Details_Id ===
                  employee.Personal_Details_Id
                    ? "bg-gray"
                    : "bg-white"
                } mb-4 rounded-md shadow-md transition-all duration-300 hover:bg-gray`}
                onClick={() => setselectedEmployee(employee)}
              >
                <div className="flex items-center justify-between gap-5">
                  <div className="flex w-full items-center gap-1">
                    <Label>{employee.Personal_Details.first_name}</Label>
                    <Label>{employee.Personal_Details.last_name}</Label>
                  </div>
                  <div className="flex w-full flex-col gap-5">
                    <Label>{employee.Personal_Details_Id}</Label>
                  </div>
                  <div
                    className="transition-all duration-300 hover:scale-125"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEmployee(employee.Personal_Details_Id);
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
            {selectedEmployee ? (
              <div className="flex gap-5">
                <div className="flex h-full w-full flex-col gap-3">
                  {/* <UsersChart /> */}
                  <div className="flex items-center gap-5 text-xs">
                    <span className="font-bold">
                      {selectedEmployee.Personal_Details.company}
                    </span>
                    <span>{selectedEmployee.Personal_Details_Id}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-ligh text-textGray">
                      Sales Person
                    </span>
                    <span>
                      {selectedEmployee.Personal_Details.first_name}{" "}
                      {selectedEmployee.Personal_Details.last_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">
                      Contact Number
                    </span>
                    <span>{selectedEmployee.Personal_Details.contact}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">Email</span>
                    <span>{selectedEmployee.Personal_Details.email}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">Location</span>
                    <span>
                      {selectedEmployee.Personal_Details.location
                        ?.address_line || "N/A"}
                    </span>
                    <span>
                      {selectedEmployee.Personal_Details.location?.city ||
                        "N/A"}
                    </span>
                    <span>
                      {selectedEmployee.Personal_Details.location?.region ||
                        "N/A"}
                    </span>
                    <span>
                      {selectedEmployee.Personal_Details.location?.country ||
                        "N/A"}
                    </span>
                    <span>
                      {selectedEmployee.Personal_Details.location
                        ?.postal_code || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-light text-textGray">Notes</span>
                    <span>{selectedEmployee.Personal_Details.notes}</span>
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
                        <Label className="text-xs">{selectedEmployee.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedEmployee.Personal_Details.first_name}{" "}
                          {selectedEmployee.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedEmployee.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedEmployee.Personal_Details.first_name}{" "}
                          {selectedEmployee.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedEmployee.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedEmployee.Personal_Details.first_name}{" "}
                          {selectedEmployee.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedEmployee.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedEmployee.Personal_Details.first_name}{" "}
                          {selectedEmployee.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>

                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedEmployee.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedEmployee.Personal_Details.first_name}{" "}
                          {selectedEmployee.Personal_Details.last_name}
                        </Label>
                      </div>

                      <div className="flex flex-col gap-3 text-textGray">
                        <Label className="text-xs">Date: 10/15/24</Label>
                        <Label className="text-xs">Time: 9:00 AM</Label>
                      </div>
                    </Card>
                    <Card className="flex w-full items-center justify-between p-5">
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs">{selectedEmployee.id}</Label>
                        <Label className="text-xs text-textGray">
                          {selectedEmployee.Personal_Details.first_name}{" "}
                          {selectedEmployee.Personal_Details.last_name}
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
                Select a employee to view details
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployeesPage;
