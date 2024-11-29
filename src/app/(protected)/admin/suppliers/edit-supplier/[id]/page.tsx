// "use client";
import NewSupplierState from "../../_components/new-supplier";
import NewSupplierRouter from "../../_components/supplier-router";

const EditSupplier = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  return (
    <section className="flex h-screen w-screen flex-col gap-3 p-10">
      <NewSupplierRouter title="EDIT SUPPLIER" />
      <NewSupplierState id={id} />
    </section>
  );
};

export default EditSupplier;
