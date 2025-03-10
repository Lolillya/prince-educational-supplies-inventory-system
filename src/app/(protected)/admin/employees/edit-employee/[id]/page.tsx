"use client";
import { useParams } from "next/navigation";
import EditEmployeeState from "../../_components/edit-employee";
import EmployeeRouter from "../../_components/employee-router";

const EditEmployee = () => {
  const { id } = useParams();
  const idString = String(id);
  return (
    <section className="flex h-screen w-screen flex-col gap-3 p-10">
      <EmployeeRouter title="EDIT EMPLOYEE" />
      <EditEmployeeState id={idString} />
    </section>
  );
};

export default EditEmployee;
