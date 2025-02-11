"use client";

import { Poppins } from "next/font/google";
import CustomerRouter from "../_components/customer-router";
import NewCustomerState from "../_components/new-customer";
import { api } from "~/trpc/react";
import { useState } from "react";

type CustomerData = {
  businessName: string;
  firstName: string;
  lastName: string;
  contact: string;
  email: string;
  notes: string;
};

const NewCustomer = () => {
  // const createCustomer = api.customer.create()
  const [customerData, setCustomerData] = useState<CustomerData>({
    businessName: "",
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    notes: "",
  });

  const handleStateChange = <K extends keyof CustomerData>(
    field: K,
    value: CustomerData[K],
  ) => {
    setCustomerData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <section
      className={`flex h-screen w-screen flex-col gap-3 overflow-y-scroll p-10`}
    >
      <CustomerRouter title="NEW CUSTOMER" />
      <NewCustomerState id="" />
    </section>
  );
};

export default NewCustomer;
