"use client";
// src/app/admin/suppliers/page.tsx

import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import SupplierPageUI from "./_components/suppliers-page";
import { useState } from "react";

const SuppliersPage = () => {
  const router = useRouter();
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleNewSupplier = () => {
    router.push("/admin/suppliers/new-supplier");
  };

  const handleEditSupplier = (supplierId: number) => {
    router.push(`/admin/suppliers/editSupplier/${supplierId}`);
  };

  // TODO: FIX BACKEND
  const { data: suppliers, isLoading } = api.supplier.list.useQuery();

  const toggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const filteredSuppliers = suppliers?.filter((supplier) => {
    if (!searchTerm) {
      return true;
    }

    const companyName = supplier.personal_details.company.toLowerCase();
    const searchValue = searchTerm.toLowerCase();
    return companyName.includes(searchValue);
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SupplierPageUI
      filteredSuppliers={filteredSuppliers}
      expandedCardId={expandedCardId}
      setExpandedCardId={setExpandedCardId}
      handleNewSupplier={handleNewSupplier}
      handleEditSupplier={handleEditSupplier}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
};

export default SuppliersPage;
