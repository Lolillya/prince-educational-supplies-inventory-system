"use client";
// src/app/admin/customers/page.tsx
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import CustomersPageUI from "./_components/customerpage";
import { useState } from "react";

const CustomersPage = () => {
  const router = useRouter();
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleNewCustomer = () => {
    router.push("/admin/customers/new-customer"); // Redirect to create new customer
  };
  const handleEditCustomer = (customerId: number) => {
    router.push(`/admin/customers/editCustomer/${customerId}`); // Redirect to edit customer
  };

  const { data: customers, isLoading } = api.customer.list.useQuery();

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  // Filter customers based on search term
  const filteredCustomers = customers?.filter((customer) => {
    if (!searchTerm) {
      return true; // Show all items when searchTerm is empty
    }
    const companyName = customer.personal_details.company.toLowerCase();
    const searchValue = searchTerm.toLowerCase();
    return companyName.includes(searchValue); // Check if the company name includes the search term
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <CustomersPageUI
      filteredCustomers={filteredCustomers}
      expandedCardId={expandedCardId}
      setExpandedCardId={setExpandedCardId}
      handleNewCustomer={handleNewCustomer}
      handleEditCustomer={handleEditCustomer}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
};

export default CustomersPage;
