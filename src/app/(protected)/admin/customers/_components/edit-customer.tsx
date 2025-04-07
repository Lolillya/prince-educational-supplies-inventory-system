"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "~/components/loading";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";

interface CustomerFormState {
  firstName: string;
  lastName: string;
  businessName: string;
  term: string;
  contact: string;
  email: string;
  addressLine: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  notes: string;
}

interface CustomerFormErrors {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  term?: string;
  contact?: string;
  email?: string;
  addressLine?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
}

const defaultCustomerForm: CustomerFormState = {
  firstName: "",
  lastName: "",
  businessName: "",
  term: "",
  contact: "",
  email: "",
  addressLine: "",
  city: "",
  region: "",
  country: "",
  postalCode: "",
  notes: "",
};

const EditCustomerState = ({ id }: { id: string }) => {
  const [errors] = useState<CustomerFormErrors>({});
  const [customerForm, setCustomerForm] =
    useState<CustomerFormState>(defaultCustomerForm);
  const router = useRouter();
  const { refetch } = api.customers.list.useQuery();
  const {
    data: customerData,
    isLoading,
    isError,
  } = api.customers.getById.useQuery({ id });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const personalDetailsId = session?.user?.id;

  // Add unpaid invoices query
  const { data: unpaidInvoices } = api.customers.unpaidInvoices.useQuery(
    { customerId: id },
    { enabled: !!id },
  );

  // Calculate unpaid sum
  const unpaidSum =
    unpaidInvoices?.reduce((sum, invoice) => sum + invoice.remaining, 0) ?? 0;
  const hasUnpaidInvoices = unpaidSum > 0;

  const updateCustomer = api.customers.update.useMutation({
    onSuccess: async () => {
      setSuccessMessage("Customer updated successfully!");
      setShowSuccessDialog(true); // Open success dialog after update
      await refetch();
    },
    onError: (error) => {
      setErrorMessage(`Failed to update customer: ${error.message}`);
      setShowErrorDialog(true); // Open error dialog if update fails
    },
  });

  const deleteCustomer = api.customers.delete.useMutation({
    onSuccess: async () => {
      setSuccessMessage("Customer deleted successfully!");
      setShowSuccessDialog(true); // Open success dialog after delete
      await refetch(); // Fetch updated data
    },
    onError: (error) => {
      setErrorMessage(`Failed to delete customer: ${error.message}`);
      setShowErrorDialog(true); // Open error dialog if delete fails
    },
  });

  const verifyPasswordMutation = api.customers.verifyPassword.useMutation();

  useEffect(() => {
    if (customerData) {
      setCustomerForm({
        firstName: customerData.first_name ?? "",
        lastName: customerData.last_name ?? "",
        businessName: customerData.company ?? "",
        term: customerData.term?.toString() ?? "",
        contact: customerData.contact ?? "",
        email: customerData.email ?? "",
        addressLine: customerData.location?.address_line ?? "",
        city: customerData.location?.city ?? "",
        region: customerData.location?.region ?? "",
        country: customerData.location?.country ?? "",
        postalCode: customerData.location?.postal_code ?? "",
        notes: customerData.notes ?? "",
      });
    }
  }, [customerData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateCustomer.mutateAsync({
        id,
        company: customerForm.businessName,
        term: customerForm.term.trim() ? parseInt(customerForm.term, 10) : null,
        firstName: customerForm.firstName,
        lastName: customerForm.lastName,
        contact: customerForm.contact,
        email: customerForm.email,
        addressLine: customerForm.addressLine,
        city: customerForm.city,
        region: customerForm.region,
        country: customerForm.country,
        postalCode: customerForm.postalCode,
        notes: customerForm.notes,
      });

      router.push("/admin/customers");
    } catch (error) {
      console.error("Failed to edit customer:", error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(""); // Clear any previous error messages
    setSuccessMessage(""); // Clear any previous success messages

    try {
      // Check if user is admin
      if (userRole !== "ADMIN") {
        setErrorMessage("Only ADMIN users can delete customers");
        setIsDeleting(false);
        return;
      }

      // Check if password was provided
      if (!password) {
        setErrorMessage("Please enter your password to confirm");
        setIsDeleting(false);
        return;
      }

      // Verify password first before checking unpaid invoices
      if (!personalDetailsId) {
        setErrorMessage("Authentication error: No user ID found");
        setIsDeleting(false);
        return;
      }

      const verifyResult = await verifyPasswordMutation.mutateAsync({
        personalDetailsId,
        password,
      });

      if (!verifyResult.success) {
        setErrorMessage("Incorrect password");
        setIsDeleting(false);
        return;
      }

      // Check for unpaid invoices AFTER password verification
      if (hasUnpaidInvoices) {
        setErrorMessage(
          `Cannot delete customer with unpaid balance of PHP ${unpaidSum.toFixed(2)}`,
        );
        setIsDeleting(false);
        return;
      }

      // If we're here, password is verified and there are no unpaid invoices
      await deleteCustomer.mutateAsync({ id });
      setShowDeleteDialog(false);
      setSuccessMessage("Customer deleted successfully!");
      setShowSuccessDialog(true); // Show success dialog
    } catch (error) {
      console.error("Error deleting customer:", error);
      setErrorMessage("Failed to delete customer. Please try again.");
      setShowErrorDialog(true); // Show error dialog
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccessDialogClose = () => {
    // Redirect only after the user clicks "OK" on the success dialog
    setShowSuccessDialog(false);
    router.push("/admin/customers");
  };

  if (isLoading) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <span>Error fetching data...</span>
      </section>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5 px-52">
      <form className="h-full w-full">
        <div className="flex h-full w-full flex-col justify-center gap-7">
          <div className="flex flex-col gap-2">
            <Label>
              Business <span className="text-red">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                name="businessName"
                placeholder="Business Name"
                className="p-7"
                required
                value={customerForm.businessName}
                onChange={handleInputChange}
              />
              {errors.businessName && (
                <span className="text-red">{errors.businessName}</span>
              )}
              <Input
                name="term"
                type="number"
                min="2"
                placeholder="Term by Days (minimum 2 days)"
                className="p-7"
                value={customerForm.term}
                onChange={(e) => {
                  setCustomerForm((prev) => ({
                    ...prev,
                    term: e.target.value,
                  }));
                }}
              />
              {errors.term && <span className="text-red">{errors.term}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Representative <span className="text-red"></span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                name="firstName"
                placeholder="First Name"
                className="p-7"
                value={customerForm.firstName}
                onChange={handleInputChange}
              />
              {errors.firstName && (
                <span className="text-red">{errors.firstName}</span>
              )}
              <Input
                name="lastName"
                placeholder="Last Name"
                className="p-7"
                value={customerForm.lastName}
                onChange={handleInputChange}
              />
              {errors.lastName && (
                <span className="text-red">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>Contact Number</Label>
              <Input
                name="contact"
                placeholder="Contact Number"
                className="p-7"
                value={customerForm.contact}
                onChange={handleInputChange}
              />
              {errors.contact && (
                <span className="text-red">{errors.contact}</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Email</Label>
              <Input
                name="email"
                placeholder="Email"
                className="p-7"
                value={customerForm.email}
                onChange={handleInputChange}
              />
              {errors.email && <span className="text-red">{errors.email}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Address <span className="text-red"></span>
            </Label>
            <Input
              name="addressLine"
              placeholder="Address"
              className="p-7"
              value={customerForm.addressLine}
              onChange={handleInputChange}
            />
            {errors.addressLine && (
              <span className="text-red">{errors.addressLine}</span>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>
                City <span className="text-red"></span>
              </Label>
              <Input
                name="city"
                placeholder="City"
                className="p-7"
                value={customerForm.city}
                onChange={handleInputChange}
              />
              {errors.city && <span className="text-red">{errors.city}</span>}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Region</Label>
              <Input
                name="region"
                placeholder="Region"
                className="p-7"
                value={customerForm.region}
                onChange={handleInputChange}
              />
              {errors.region && (
                <span className="text-red">{errors.region}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>
                Country <span className="text-red"></span>
              </Label>
              <Input
                name="country"
                placeholder="Country"
                className="p-7"
                value={customerForm.country}
                onChange={handleInputChange}
              />
              {errors.country && (
                <span className="text-red">{errors.country}</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Postal Code</Label>
              <Input
                name="postalCode"
                placeholder="Postal Code"
                className="p-7"
                value={customerForm.postalCode}
                onChange={handleInputChange}
              />
              {errors.postalCode && (
                <span className="text-red">{errors.postalCode}</span>
              )}
            </div>
          </div>

          <div>
            <Textarea
              name="notes"
              placeholder="About this customer..."
              rows={4}
              className="resize-none bg-gray"
              value={customerForm.notes}
              onChange={handleInputChange}
            />
            {errors.notes && <span className="text-red">{errors.notes}</span>}
          </div>

          <div className="flex justify-end gap-3"></div>
        </div>
      </form>

      {/* Buttons */}
      <div className="flex w-full items-center justify-end gap-3">
        {/* Delete Button */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              className="bg-red p-7 text-lg font-bold"
            >
              Delete Customer
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot
              be undone.
            </DialogDescription>

            <div className="mt-4 space-y-4">
              <Label className="text-slate-400">
                Enter your password to confirm
              </Label>
              <Input
                className="bg-slate-100 text-slate-700 shadow-none"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {errorMessage && (
                <div className="mt-1 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  <p className="text-rose-500">{errorMessage}</p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={() => setShowDeleteDialog(false)} // Cancel button
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleDelete()} // Trigger the delete handler
                className="bg-red text-white"
                disabled={isDeleting}
              >
                {isDeleting ? "Checking..." : "Confirm Deletion"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogTitle>{successMessage}</DialogTitle>
            <DialogDescription>
              Action was completed successfully!
            </DialogDescription>
            <DialogFooter>
              <Button
                onClick={handleSuccessDialogClose} // Close the dialog and redirect
                className="bg-green text-white"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Error Dialog */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
            <DialogFooter>
              <Button
                onClick={() => setShowErrorDialog(false)}
                className="bg-red text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          onClick={() => void handleSubmit(new Event("submit") as never)}
          className="bg-green p-7 text-lg font-bold"
          disabled={updateCustomer.isPending}
        >
          {updateCustomer.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default EditCustomerState;
