"use client";

import { useParams } from "next/navigation";
import CustomerRouter from "../../_components/customer-router";
import EditCustomerState from "../../_components/edit-customer";

const EditCustomer = () => {
  const { id } = useParams();
  const idString = String(id);
  return (
    <section className="flex h-screen w-screen flex-col gap-3 p-10">
      <CustomerRouter title="EDIT CUSTOMER" />
      <EditCustomerState id={idString} />
    </section>
  );
};

export default EditCustomer;
