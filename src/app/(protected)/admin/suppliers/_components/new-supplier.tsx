"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/loading";

const NewSupplierState = ({ id }: { id: string }) => {
  const [supplierForm, setSupplierForm] = useState({
    firstname: "",
    lastname: "",
    businessName: "",
    contact: "",
    email: "",
    addressLine: "",
    city: "",
    region: "",
    country: "",
    postalCode: "",
    notes: "",
  });

  const {
    data: supplierData,
    isLoading,
    isError,
  } = api.suppliers.getById.useQuery({ id });

  useEffect(() => {
    if (!isLoading && supplierData) {
      setSupplierForm({
        firstname: supplierData.first_name ?? "",
        lastname: supplierData.last_name ?? "",
        businessName: supplierData.company ?? "",
        contact: supplierData.contact ?? "",
        email: supplierData.email ?? "",
        addressLine: supplierData.location?.address_line ?? "",
        city: supplierData.location?.city ?? "",
        region: supplierData.location?.region ?? "",
        country: supplierData.location?.country ?? "",
        postalCode: supplierData.location?.postal_code ?? "",
        notes: supplierData.notes ?? "",
      });
    }
  }, [isLoading, supplierData]);

  if (isLoading)
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  if (isError)
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <span>Error fetching data...</span>
      </section>
    );

  const handleSubmit = () => {
    // Handle submit logic
  };

  return (
    <div className="flex h-full flex-col gap-5 px-52">
      <form className="h-full w-full">
        <div className="flex h-full w-full flex-col justify-center gap-7">
          <div className="flex flex-col gap-2">
            <Label>
              Business <span className="text-red-600">*</span>
            </Label>
            <Input
              placeholder="Customer Name"
              className="p-7"
              required
              value={supplierForm.businessName}
              onChange={(e) =>
                setSupplierForm({
                  ...supplierForm,
                  businessName: e.target.value,
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Salesperson <span className="text-red-600">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Firstname"
                className="p-7"
                value={supplierForm.firstname}
                onChange={(e) =>
                  setSupplierForm({
                    ...supplierForm,
                    firstname: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Lastname"
                className="p-7"
                value={supplierForm.lastname}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, lastname: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>Contact Number</Label>
              <Input
                placeholder="Contact Number"
                className="p-7"
                value={supplierForm.contact}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, contact: e.target.value })
                }
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Email</Label>
              <Input
                placeholder="Email"
                className="p-7"
                value={supplierForm.email}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Address <span className="text-red-600">*</span>
            </Label>
            <Input
              placeholder="Address"
              className="p-7"
              value={supplierForm.addressLine}
              onChange={(e) =>
                setSupplierForm({
                  ...supplierForm,
                  addressLine: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Textarea
              placeholder="About this supplier..."
              rows={4}
              className="resize-none bg-gray"
              value={supplierForm.notes}
              onChange={(e) =>
                setSupplierForm({ ...supplierForm, notes: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3"></div>
        </div>
      </form>
      <div className="flex w-full items-center justify-end gap-3">
        <Button className="bg-green p-7 text-lg font-bold">Save</Button>
      </div>
    </div>
  );
};

export default NewSupplierState;
