// "use client";
import EditEmployeeState from "../../_components/edit-employee";
import EmployeeRouter from "../../_components/employee-router";

const EditEmployee = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  return (
      <section className="flex h-screen w-screen flex-col gap-3 p-10">
        <EmployeeRouter title="EDIT EMPLOYEE" />
        <EditEmployeeState id={id} />
      </section>
  );
};

export default EditEmployee;
