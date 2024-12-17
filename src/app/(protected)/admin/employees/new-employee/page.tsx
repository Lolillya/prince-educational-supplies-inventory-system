"use client";

import { Poppins } from "next/font/google";
import EmployeeRouter from "../_components/employee-router";
import NewEmployeeState from "../_components/new-employee";
import { api } from "~/trpc/react";
import { useState } from "react";

type EmployeeData = {
  businessName: string;
  firstName: string;
  lastName: string;
  contact: string;
  email: string;
  notes: string;
};

const NewEmployee = () => {
  // const createSuppler = api.employee.create()
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    businessName: "",
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    notes: "",
  });

  const handleStateChange = <K extends keyof EmployeeData>(
      field: K,
      value: EmployeeData[K],
  ) => {
    setEmployeeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  // console.log(employeeData.businessName);
  return (
      <section
          className={`flex h-screen w-screen flex-col gap-3 overflow-y-scroll p-10`}
      >
        <EmployeeRouter title="NEW EMPLOYEE" />
        <NewEmployeeState id="" />
      </section>
  );
};

export default NewEmployee;
