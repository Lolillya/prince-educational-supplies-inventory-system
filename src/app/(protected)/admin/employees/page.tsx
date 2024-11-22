"use client";
// src/app/admin/customers/page.tsx
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { useState } from "react";
import EmployeePageUI from "./_components/employee-page";

const EmployeesPage = () => {
  const router = useRouter();
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleNewEmployee = () => {
    router.push("/admin/employees/new-employee"); // Redirect to create new employee
  };

  const handleEditEmployee = (employeeId: number) => {
    router.push(`/admin/employees/edit-employee/${employeeId}`); // Redirect to edit employee
  };

  const { data: employees, isLoading } = api.employee.list.useQuery();

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  // Filter employees based on search term
  const filteredEmployees = employees?.filter((employee) => {
    if (!searchTerm) {
      return true; // Show all items when searchTerm is empty
    }

    const fullName =
      `${employee.personal_details.first_name} ${employee.personal_details.last_name}`.toLowerCase();
    const searchValue = searchTerm.toLowerCase();
    return fullName.includes(searchValue); // Check if the full name includes the search term
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <EmployeePageUI
      filteredEmployees={filteredEmployees}
      expandedCardId={expandedCardId}
      setExpandedCardId={setExpandedCardId}
      handleNewEmployee={handleNewEmployee}
      handleEditEmployee={handleEditEmployee}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
};

export default EmployeesPage;
