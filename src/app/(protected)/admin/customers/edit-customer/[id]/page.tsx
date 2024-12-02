import CustomerRouter from "../../_components/CustomerRouter";
import CustomerState from "../../_components/CustomerState";

const EditCustomer = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  return (
    <section className="flex h-screen w-screen flex-col gap-3 p-10">
      <CustomerRouter title="EDIT CUSTOMER" />
      <CustomerState id={id} />
    </section>
  );
};

export default EditCustomer;
