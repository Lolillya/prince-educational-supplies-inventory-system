import NewSupplierState from "../../_components/new-supplier";
import NewSupplierRouter from "../../_components/supplier-router";

const EditSupplier = () => {
  return (
    <section className="flex h-screen w-screen flex-col gap-3 p-10">
      <NewSupplierRouter title="EDIT SUPPLIER" />
      <NewSupplierState />
    </section>
  );
};

export default EditSupplier;
