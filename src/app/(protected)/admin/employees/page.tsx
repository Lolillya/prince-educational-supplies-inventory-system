"use client"

import { Plus } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { api } from "~/trpc/react"
import Filter from '../_components/filter'
import NoRecordsMessage from '../_components/no-records-message'
import RecordHeader from '../_components/record-header'
import RecordItem from './_components/record-item'
import SearchBar from '../_components/search-bar'
import SelectRecordMessage from '../_components/select-record-message'
import SelectedEmployee from './_components/selected-employee'
import { Toaster } from '~/components/ui/sonner'
import {useSession} from "next-auth/react";

interface Employee {
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

const EmployeesPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<Employee | null>(null);

  const { data: employeeData } = api.employees.list.useQuery();





  const utils = api.useUtils();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const personalDetailsId = session?.user?.id; // Get the personal_details_id from the session

  const { data: restockData } = api.employees.getRestockActivity.useQuery(
      { clerkId: selectedRecord?.Personal_Details_Id ?? '' },
      { enabled: !!selectedRecord }
  );

  const { data: invoiceData } = api.employees.getInvoiceActivity.useQuery(
      { clerkId: selectedRecord?.Personal_Details_Id ?? '' },
      { enabled: !!selectedRecord }
  );

  const activityData = {
    restocks: restockData ?? [],
    invoices: invoiceData ?? []
  };

  const verifyPasswordMutation = api.employees.verifyPassword.useMutation();
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

  const deleteEmployeeMutation = api.employees.delete.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
      setSelectedRecord(null);
    },
    onError: (error) => {
      console.error("Error deleting employee:", error.message);
    },
  });

  const checkAdminRole = () => {
    if (userRole !== 'ADMIN') {
      alert('Only ADMIN users can delete employees');
      return false;
    }
    return true;
  };

  // const { data: activityData } = api.restock.getActivityData.useQuery(); 
  // TODO: fetch employee activity data: restocks, invoices, edits, deletes...

  const filteredEmployees = employeeData?.filter((employee) => {
    const name = (employee.Personal_Details.first_name?.toLowerCase() + ' ' + employee.Personal_Details.last_name?.toLowerCase());
    const company = employee.Personal_Details.company?.toLowerCase() ?? "";
    const contact = employee.Personal_Details.contact?.toLowerCase() ?? "";
    const email = employee.Personal_Details.email?.toLowerCase() ?? "";

    return (
      name.includes(searchTerm.toLowerCase()) ??
      company.includes(searchTerm.toLowerCase()) ??
      contact.includes(searchTerm.toLowerCase()) ??
      email.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <section className='px-20 py-10 text-base min-h-screen flex flex-col'>
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter />
        </div>
        <Button
          onClick={() => router.push("/admin/employees/new-employee")}
          className="bg-green hover:bg-green/80">
          <Plus strokeWidth={3} /> New Employee
        </Button>
      </div>
      <div className="mt-8 flex gap-3 flex-grow">
        <div className="flex flex-col gap-3 w-3/5 flex-grow">
          <RecordHeader
            record="Employees"
            number={filteredEmployees?.length ?? 0} 
            data={filteredEmployees ?? []}
          />
          <div className="flex flex-grow rounded-lg h-full overflow-hidden">
            {(filteredEmployees?.length ?? 0) > 0 ? (
              <ScrollArea className="w-full h-full">
                <div className="flex flex-col items-center w-full h-40">
                  {filteredEmployees?.map((employee) => (
                    <RecordItem
                      key={employee.Personal_Details_Id}
                      name={employee.Personal_Details.first_name + ' ' + employee.Personal_Details.last_name}
                      id={employee.Personal_Details_Id}
                      emoji={employee.emoji}
                      onClick={() => setSelectedRecord(employee)}
                      isSelected={selectedRecord?.Personal_Details_Id === employee.Personal_Details_Id}
                      recordType={'Employees'}
                      onVerifyPassword={handleVerifyPassword}
                      onDelete={(id) => {
                        if (!checkAdminRole()) return;
                        deleteEmployeeMutation.mutate({ id });
                      }}
                      userRole={userRole}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <NoRecordsMessage records={'employees'} link={'/admin/employees/new-employee'} item={'employee'} />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-2/5 flex-grow">
          <div className="bg-slate-100 w-full rounded-lg text-lg px-6 py-3">
            <p className="text-slate-500">Details</p>
          </div>
          <div className="bg-slate-100 flex flex-grow rounded-lg">
            {selectedRecord ? (
              <ScrollArea className="w-full h-full">
                <div className="flex flex-col w-full h-40">
                  <SelectedEmployee
                    id={selectedRecord.Personal_Details_Id}
                    role_Id={selectedRecord.role_Id}
                    emoji={selectedRecord.emoji}
                    name={selectedRecord.Personal_Details.first_name + ' ' + selectedRecord.Personal_Details.last_name}
                    contact={selectedRecord.Personal_Details.contact}
                    email={selectedRecord.Personal_Details.email}
                    location={
                      [
                        selectedRecord.Personal_Details.location?.address_line,
                        selectedRecord.Personal_Details.location?.city,
                        selectedRecord.Personal_Details.location?.region,
                        selectedRecord.Personal_Details.location?.country,
                        selectedRecord.Personal_Details.location?.postal_code,
                      ]
                        .filter((line) => line)
                        .join("\n")
                    }
                    notes={selectedRecord.Personal_Details.notes}
                    auth={selectedRecord.Personal_Details.auth}
                    activityData={activityData}
                    clerkId={selectedRecord.Personal_Details_Id}
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
  )
}

export default EmployeesPage