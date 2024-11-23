// import { useRouter } from "next/navigation";
import { api } from "~/trpc/server";
import SupplierPageUI from "./_components/suppliers-page";
// import { useState } from "react";

const SuppliersPage = async () => {
  // const router = useRouter();
  // const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  // const [searchTerm, setSearchTerm] = useState<string>("");

  // const handleNewSupplier = () => {
  //   router.push("/admin/suppliers/new-supplier");
  // };

  // const handleEditSupplier = (supplierId: number) => {
  //   router.push(`/admin/suppliers/editSupplier/${supplierId}`);
  // };

  // TODO: FIX BACKEND
  const suppliers = api.suppliers.list;
  console.log(suppliers);

  // const toggleExpand = (id: number) => {
  //   setExpandedCardId(expandedCardId === id ? null : id);
  // };

  // const filteredSuppliers = suppliers?.filter((supplier) => {
  //   if (!searchTerm) {
  //     return true;
  //   }

  //   const companyName = supplier.personal_details.company.toLowerCase();
  //   const searchValue = searchTerm.toLowerCase();
  //   return companyName.includes(searchValue);
  // });

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return <div>{JSON.stringify(suppliers)}</div>;
  // <SupplierPageUI
  //   filteredSuppliers={filteredSuppliers}
  //   expandedCardId={expandedCardId}
  //   setExpandedCardId={setExpandedCardId}
  //   handleNewSupplier={handleNewSupplier}
  //   handleEditSupplier={handleEditSupplier}
  //   searchTerm={searchTerm}
  //   setSearchTerm={setSearchTerm}
  // />
};

export default SuppliersPage;
