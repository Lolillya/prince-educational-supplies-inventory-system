"use client";

import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/loading";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogClose } from "~/components/ui/dialog";
import {DialogTitle} from "@radix-ui/react-dialog";



interface CustomerFormState {
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

interface CustomerFormErrors {
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


const defaultCustomerForm: CustomerFormState = {
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

const NewCustomerState = ({ id }: { id: string }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const { refetch } = api.customers.list.useQuery();
    const [dialogOpen, setDialogOpen] = useState(false);


    const createCustomer = api.customers.create.useMutation({
        onSuccess: () => {
            setDialogOpen(true); // Show dialog
            handleClear();
            refetch();
        },
        onError: (error) => {
            alert(`Failed to create customer: ${error.message}`);
        },
    });


    const [customerForm, setCustomerForm] = useState({
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
    });

    const {
        data: customerData,
        isLoading,
        isError,
    } = api.customers.getById.useQuery({ id });

    useEffect(() => {
        if (!isLoading && customerData) {
            setCustomerForm({
                firstName: customerData.first_name ?? "",
                lastName: customerData.last_name ?? "",
                businessName: customerData.company ?? "",
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
    }, [isLoading, customerData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setCustomerForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

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

    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    const validateForm = (): CustomerFormErrors => {
        const newErrors: CustomerFormErrors = {};
        const { firstName, lastName, businessName, contact, email, addressLine, city, region, country, postalCode, notes } = customerForm;

        if (firstName && (firstName.length < 2 || !firstName.match(/^[a-zA-Z]+$/))) {
            newErrors.firstName = "First Name must only contain letters and be at least 2 characters long.";
        } else if (firstName && firstName.length > 50) {
            newErrors.firstName = "First Name must be at most 50 characters long.";
        }

        if (lastName && (lastName.length < 2 || !lastName.match(/^[a-zA-Z]+$/))) {
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
                await createCustomer.mutateAsync({
                    company: customerForm.businessName,
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
            } catch (error) {
                console.error("Error creating customer:", error);
            }
        }
    };

    const handleClear = () => {
        setCustomerForm(defaultCustomerForm);
        setErrors({});
    };


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
                            value={customerForm.businessName}
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
                            {errors.lastname && (
                                <span className="text-red">{errors.lastname}</span>
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
                        {errors.notes && (
                            <span className="text-red">{errors.notes}</span>
                        )}
                    </div>

                    <div className="flex justify-end gap-3"></div>
                </div>
            </form>

            {/* Buttons */}
            <div className="flex w-full items-center justify-end gap-3">
                <Button onClick={handleClear} className="bg-green p-7 text-lg font-bold">
                    Clear
                </Button>
                <Button onClick={handleSubmit} className="bg-green p-7 text-lg font-bold">
                    Save
                </Button>
            </div>

            <div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogTitle>Success</DialogTitle> {/* Add this */}
                        <p>Customer created successfully!</p>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    setDialogOpen(false);
                                    router.push("/admin/customers"); // Redirect
                                }}
                                className="bg-green p-7 text-lg font-bold"
                            >
                                OK
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

    );
};

export default NewCustomerState;
