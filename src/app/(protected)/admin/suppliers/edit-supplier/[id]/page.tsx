"use client";
import { useParams } from "next/navigation";
import EditSupplierState from "../../_components/edit-supplier";
import SupplierRouter from "../../_components/supplier-router";

const EditSupplier = () => {
  const { id } = useParams();
  const idString = String(id);
  return (
    <section className="flex h-screen w-screen flex-col gap-3 p-10">
      <SupplierRouter title="EDIT SUPPLIER" />
      <EditSupplierState id={idString} />
    </section>
  );
};

export default EditSupplier;
