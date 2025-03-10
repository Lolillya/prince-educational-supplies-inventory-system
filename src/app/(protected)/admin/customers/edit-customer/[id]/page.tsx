import CustomerRouter from "../../_components/customer-router";
import EditCustomerState from "../../_components/edit-customer";

interface Props {
  params: { id: string };
}

const EditCustomer = ({ params }: Props) => {
  const id = params.id;
  return (
    <section className="flex h-screen w-screen flex-col gap-3 p-10">
      <CustomerRouter title="EDIT CUSTOMER" />
      <EditCustomerState id={id} />
    </section>
  );
};

export default EditCustomer;
