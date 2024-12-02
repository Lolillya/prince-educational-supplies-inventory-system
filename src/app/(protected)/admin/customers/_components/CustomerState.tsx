"use client";

import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

const CustomerState = ({ id }: { id: string }) => {
  const [customerForm, setCustomerForm] = useState({
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
    data: customerData,
    isLoading,
    isError,
  } = api.customer.getById.useQuery({ id });

  const handleSubmit = () => {
    // handle submit logic
  };

  useEffect(() => {
    if (!isLoading && customerForm) {
      setCustomerForm({
        firstname: customerData?.first_name ?? "",
        lastname: customerData?.last_name ?? "",
        businessName: customerData?.company ?? "",
        contact: customerData?.contact ?? "",
        email: customerData?.email ?? "",
        addressLine: customerData?.location?.address_line ?? "",
        city: customerData?.location?.city ?? "",
        region: customerData?.location?.region ?? "",
        country: customerData?.location?.country ?? "",
        postalCode: customerData?.location?.postal_code ?? "",
        notes: customerForm.notes ?? "",
      });
    }
  }, [isLoading, customerData]);
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
              value={customerForm.businessName}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
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
                value={customerForm.firstname}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    firstname: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Lastname"
                className="p-7"
                value={customerForm.lastname}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, lastname: e.target.value })
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
                value={customerForm.contact}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, contact: e.target.value })
                }
              />
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Email</Label>
              <Input
                placeholder="Email"
                className="p-7"
                value={customerForm.email}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, email: e.target.value })
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
              value={customerForm.addressLine}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
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
              value={customerForm.notes}
              onChange={(e) =>
                setCustomerForm({ ...customerForm, notes: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3"></div>
        </div>
      </form>
    </div>
  );
};

export default CustomerState;
