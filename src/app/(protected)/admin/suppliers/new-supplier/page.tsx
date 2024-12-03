"use client";

import { Poppins } from "next/font/google";
import NewSupplierRouter from "../_components/supplier-router";
import NewSupplierState from "../_components/new-supplier";
import { api } from "~/trpc/react";
import { useState } from "react";

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
      <NewSupplierRouter title="NEW SUPPLIER" />
      <NewSupplierState id="" />
    </section>
  );
};

export default NewSupplier;
