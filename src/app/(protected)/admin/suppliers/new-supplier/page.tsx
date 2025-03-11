"use client";

import { useState } from "react";
import NewSupplierState from "../_components/new-supplier";
import SupplierRouter from "../_components/supplier-router";

type SupplierData = {
  businessName: string;
  firstName: string;
  lastName: string;
  contact: string;
  email: string;
  notes: string;
};

const NewSupplier = () => {
  // const createSuppler = api.supplier.create()
  const [supplierData, setSupplierData] = useState<SupplierData>({
    businessName: "",
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    notes: "",
  });

  const handleStateChange = <K extends keyof SupplierData>(
    field: K,
    value: SupplierData[K],
  ) => {
    setSupplierData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  // console.log(supplierData.businessName);
  return (
    <section
      className={`flex h-screen w-screen flex-col gap-3 overflow-y-scroll p-10`}
    >
      <SupplierRouter title="NEW SUPPLIER" />
      <NewSupplierState id="" />
    </section>
  );
};

export default NewSupplier;
