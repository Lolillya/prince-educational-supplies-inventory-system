// "use client";
import EditSupplierState from "../../_components/edit-supplier";
import SupplierRouter from "../../_components/supplier-router";

const EditSupplier = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  return (
    <section className="flex h-screen w-screen flex-col gap-3 p-10">
      <SupplierRouter title="EDIT SUPPLIER" />
      <EditSupplierState id={id} />
    </section>
  );
};

export default EditSupplier;
