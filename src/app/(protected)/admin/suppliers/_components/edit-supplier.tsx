"use client";

import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/loading";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";

interface SupplierFormState {
    firstName: string;
    lastName: string;
    businessName: string;
    contact: string;
    email: string;
    addressLine: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
    notes: string;
}

interface SupplierFormErrors {
    firstName?: string;
    lastName?: string;
    businessName?: string;
    contact?: string;
    email?: string;
    addressLine?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    notes?: string;
}

const defaultSupplierForm: SupplierFormState = {
    firstName: "",
    lastName: "",
    businessName: "",
    contact: "",
    email: "",
    addressLine: "",
    city: "",
    region: "",
    country: "",
    postalCode: "",
    notes: "",
};

const EditSupplierState = ({ id }: { id: string }) => {
    const [errors, setErrors] = useState<SupplierFormErrors>({});
    const [supplierForm, setSupplierForm] = useState<SupplierFormState>(defaultSupplierForm);
    const router = useRouter();
    const { refetch } = api.suppliers.list.useQuery();
    const { data: supplierData, isLoading, isError } = api.suppliers.getById.useQuery({ id });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");


    const updateSupplier = api.suppliers.update.useMutation({
        onSuccess: () => {
            setSuccessMessage("Supplier updated successfully!");
            setShowSuccessDialog(true);  // Open success dialog after update
            refetch();  // Fetch updated data
        },
        onError: (error) => {
            setErrorMessage(`Failed to update supplier: ${error.message}`);
            setShowErrorDialog(true);  // Open error dialog if update fails
        },
    });

    const deleteSupplier = api.suppliers.delete.useMutation({
        onSuccess: () => {
            setSuccessMessage("Supplier deleted successfully!");
            setShowSuccessDialog(true);  // Open success dialog after delete
            refetch();  // Fetch updated data
        },
        onError: (error) => {
            setErrorMessage(`Failed to delete supplier: ${error.message}`);
            setShowErrorDialog(true);  // Open error dialog if delete fails
        },
    });

    useEffect(() => {
        if (supplierData) {
            setSupplierForm({
                firstName: supplierData.first_name ?? "",
                lastName: supplierData.last_name ?? "",
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
    }, [supplierData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSupplierForm((prev) => ({ ...prev, [name]: value }));
    };

    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const validateForm = (): SupplierFormErrors => {
        const newErrors: SupplierFormErrors = {};
        const { firstName, lastName, businessName, contact, email, addressLine, city, region, country, postalCode, notes } = supplierForm;

        if (firstName && (firstName.length < 2 || !(/^[a-zA-Z]+$/.exec(firstName)))) {
            newErrors.firstName = "First Name must only contain letters and be at least 2 characters long.";
        } else if (firstName && firstName.length > 50) {
            newErrors.firstName = "First Name must be at most 50 characters long.";
        }

        if (lastName && (lastName.length < 2 || !(/^[a-zA-Z]+$/.exec(lastName)))) {
            newErrors.lastName = "Last Name must only contain letters and be at least 2 characters long.";
        } else if (lastName && lastName.length > 50) {
            newErrors.lastName = "Last Name must be at most 50 characters long.";
        }

        if (!businessName) {
            newErrors.businessName = "Business Name is required.";
        } else if (businessName.trim().length < 2) {
            newErrors.businessName = "Business Name must be at least 2 characters long.";
        } else if (businessName.trim().length > 100) {
            newErrors.businessName = "Company name must be at most 100 characters long.";
        }

        if (contact && !/^\d{9,15}$/.test(contact)) {
            newErrors.contact = "Contact must be numeric and between 9-15 digits long.";
        }

        if (email && !isValidEmail(email)) {
            newErrors.email = "Invalid email address format.";
        }

        if (notes && notes.trim().length < 5) {
            newErrors.notes = "Notes must be at least 5 characters long.";
        } else if (notes && notes.trim().length > 500) {
            newErrors.notes = "Notes must be at most 500 characters long.";
        }

        if (addressLine && addressLine.trim().length < 5) {
            newErrors.addressLine = "Address must be at least 5 characters long.";
        } else if (addressLine && addressLine.trim().length > 100) {
            newErrors.addressLine = "Address Line must be at most 100 characters long.";
        }

        if (city && city.trim().length < 2) {
            newErrors.city = "City must be at least 2 characters long.";
        } else if (city && city.trim().length > 50) {
            newErrors.city = "City must be at most 50 characters long.";
        }

        if (region && region.trim().length < 2) {
            newErrors.region = "Region must be at least 2 characters long.";
        } else if (region && region.trim().length > 50) {
            newErrors.region = "Region must be at most 50 characters long.";
        }

        if (country && country.trim().length < 2) {
            newErrors.country = "Country must be at least 2 characters long.";
        } else if (country && country.trim().length > 50) {
            newErrors.country = "Country must be at most 50 characters long.";
        }

        if (postalCode && !/^\d{4}$/.test(postalCode)) {
            newErrors.postalCode = "Postal code must be 4 digits.";
        }

        return newErrors;
    };

    const handleSubmit = async () => {
        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            try {
                await updateSupplier.mutateAsync({
                    id,
                    company: supplierForm.businessName,
                    firstName: supplierForm.firstName,
                    lastName: supplierForm.lastName,
                    contact: supplierForm.contact,
                    email: supplierForm.email,
                    addressLine: supplierForm.addressLine,
                    city: supplierForm.city,
                    region: supplierForm.region,
                    country: supplierForm.country,
                    postalCode: supplierForm.postalCode,
                    notes: supplierForm.notes,
                });
            } catch (error) {
                console.error("Error updating supplier:", error);
                setErrorMessage("Failed to update supplier. Please try again.");
                setShowErrorDialog(true);  // Open error dialog if update fails
            }
        }
    };

    const handleDelete = async () => {
        setShowDeleteDialog(false);  // Close the delete confirmation dialog immediately
        setErrorMessage("");  // Clear any previous error messages
        setSuccessMessage("");  // Clear any previous success messages

        try {
            await deleteSupplier.mutateAsync({ id });
            setSuccessMessage("Supplier deleted successfully!");
            setShowSuccessDialog(true);  // Show success dialog
        } catch (error) {
            console.error("Error deleting supplier:", error);
            setErrorMessage("Failed to delete supplier. Please try again.");
            setShowErrorDialog(true);  // Show error dialog
        }
    };

    const handleSuccessDialogClose = () => {
        // Redirect only after the user clicks "OK" on the success dialog
        setShowSuccessDialog(false);
        router.push("/admin/suppliers");
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
                        <Input
                            name="businessName"
                            placeholder="Business Name"
                            className="p-7"
                            required
                            value={supplierForm.businessName}
                            onChange={handleInputChange}
                        />
                        {errors.businessName && (
                            <span className="text-red">{errors.businessName}</span>
                        )}
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
                                value={supplierForm.firstName}
                                onChange={handleInputChange}
                            />
                            {errors.firstName && (
                                <span className="text-red">{errors.firstName}</span>
                            )}
                            <Input
                                name="lastName"
                                placeholder="Last Name"
                                className="p-7"
                                value={supplierForm.lastName}
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
                                value={supplierForm.contact}
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
                                value={supplierForm.email}
                                onChange={handleInputChange}
                            />
                            {errors.email && (
                                <span className="text-red">{errors.email}</span>
                            )}
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
                            value={supplierForm.addressLine}
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
                                value={supplierForm.city}
                                onChange={handleInputChange}
                            />
                            {errors.city && (
                                <span className="text-red">{errors.city}</span>
                            )}
                        </div>

                        <div className="flex w-full flex-col gap-2">
                            <Label>Region</Label>
                            <Input
                                name="region"
                                placeholder="Region"
                                className="p-7"
                                value={supplierForm.region}
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
                                value={supplierForm.country}
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
                                value={supplierForm.postalCode}
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
                            placeholder="About this supplier..."
                            rows={4}
                            className="resize-none bg-gray"
                            value={supplierForm.notes}
                            onChange={handleInputChange}
                        />
                        {errors.notes && (
                            <span className="text-red">{errors.notes}</span>
                        )}
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
                            Delete Supplier
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this supplier? This action cannot be undone.
                        </DialogDescription>

                        <DialogFooter>
                            <Button
                                onClick={() => setShowDeleteDialog(false)}  // Cancel button
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}  // Trigger the delete handler
                                className="bg-red text-white"
                            >
                                Confirm Deletion
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Success Dialog */}
                <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                    <DialogContent>
                        <DialogTitle>{successMessage}</DialogTitle>
                        <DialogDescription>Action was completed successfully!</DialogDescription>
                        <DialogFooter>
                            <Button
                                onClick={handleSuccessDialogClose}  // Close the dialog and redirect
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
                            <Button onClick={() => setShowErrorDialog(false)} className="bg-red text-white">
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button onClick={handleSubmit} className="bg-green p-7 text-lg font-bold">
                    Save
                </Button>
            </div>
        </div>
    );
};

export default EditSupplierState;
