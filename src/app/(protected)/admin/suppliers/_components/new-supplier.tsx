"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/loading";

// Define the type for the error state
interface SupplierFormErrors {
    firstname?: string;
    lastname?: string;
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

    const [statusMessage, setStatusMessage] = useState<{
        type: "success" | "error" | null;
        text: string;
    }>({ type: null, text: "" });

    const [errors, setErrors] = useState<SupplierFormErrors>({});

    const { data: supplierData, isLoading, isError } = api.suppliers.getById.useQuery({ id });
    const createSupplierMutation = api.suppliers.create.useMutation();

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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSupplierForm({
            ...supplierForm,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = (): SupplierFormErrors => {
        const newErrors: SupplierFormErrors = {};

        const { firstname, lastname, businessName, contact, email, addressLine, city, region, country, postalCode, notes } = supplierForm;

        // Firstname validation
        if (firstname && (firstname.length < 2 || !firstname.match(/^[a-zA-Z]+$/))) {
            newErrors.firstname = "Firstname must only contain letters and be at least 2 characters long.";
        } else if (firstname && firstname.length > 50) {
            newErrors.firstname = "First Name must be at most 50 characters long.";
        }

        // Lastname validation
        if (lastname && (lastname.length < 2 || !lastname.match(/^[a-zA-Z]+$/))) {
            newErrors.lastname = "Lastname must only contain letters and be at least 2 characters long.";
        } else if (lastname && lastname.length > 50) {
            newErrors.lastname = "Last Name must be at most 50 characters long.";
        }

        // Business Name validation
        if (!businessName) {
            newErrors.businessName = "Business Name is required.";
        } else if (businessName.trim().length < 2) {
            newErrors.businessName = "Business Name must be at least 2 characters long.";
        } else if (businessName.trim().length > 100) {
            newErrors.businessName = "Company name must be at most 100 characters long.";
        }

        // Contact validation
        if (contact && !/^\d{9,15}$/.test(contact)) {
            newErrors.contact = "Contact must be numeric and between 9-15 digits long.";
        }

        // Email validation
        if (email && !isValidEmail(email)) {
            newErrors.email = "Invalid email address format.";
        }

        // Notes validation
        if (notes && notes.trim().length < 5) {
            newErrors.notes = "Notes must be at least 5 characters long.";
        } else if (notes && notes.trim().length > 500) {
            newErrors.notes = "Notes must be at most 500 characters long.";
        }

        // Address Line validation
        if (addressLine && addressLine.trim().length < 5) {
            newErrors.addressLine = "Address must be at least 5 characters long.";
        } else if (addressLine && addressLine.trim().length > 100) {
            newErrors.addressLine = "Address Line must be at most 100 characters long.";
        }

        // City validation
        if (city && city.trim().length < 2) {
            newErrors.city = "City must be at least 2 characters long.";
        } else if (city && city.trim().length > 50) {
            newErrors.city = "City must be at most 50 characters long.";
        }

        // Region validation
        if (region && region.trim().length < 2) {
            newErrors.region = "Region must be at least 2 characters long.";
        } else if (region && region.trim().length > 50) {
            newErrors.region = "Region must be at most 50 characters long.";
        }

        // Country validation
        if (country && country.trim().length < 2) {
            newErrors.country = "Country must be at least 2 characters long.";
        } else if (country && country.trim().length > 50) {
            newErrors.country = "Country must be at most 50 characters long.";
        }

        // Postal Code validation
        if (postalCode && !/^\d{4,7}$/.test(postalCode)) {
            newErrors.postalCode = "Postal Code must be numeric and between 4-7 digits long.";
        }

        return newErrors;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (isSubmitting) return; // Prevent double submissions

        setIsSubmitting(true);
        try {
            await createSupplierMutation.mutateAsync({
                firstname: supplierForm.firstname,
                lastname: supplierForm.lastname,
                company: supplierForm.businessName,
                contact: supplierForm.contact,
                email: supplierForm.email,
                address: {
                    addressLine: supplierForm.addressLine,
                    city: supplierForm.city,
                    region: supplierForm.region,
                    country: supplierForm.country,
                    postalCode: supplierForm.postalCode,
                },
                notes: supplierForm.notes,
            });

            setStatusMessage({ type: "success", text: "Supplier created successfully!" });
            setSupplierForm({
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
            setErrors({});
        } catch (error) {
            setStatusMessage({ type: "error", text: "Failed to create supplier. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
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

    return (
        <div className="flex h-full flex-col gap-5 px-52">
            {statusMessage.type && (
                <div
                    className={`w-full p-3 text-center font-bold ${
                        statusMessage.type === "success" ? "text-green" : "text-red"
                    }`}
                >
                    {statusMessage.text}
                </div>
            )}
            <form className="h-full w-full" onSubmit={handleSubmit}>
                <div className="flex h-full w-full flex-col justify-center gap-7">
                    {/* Business Name */}
                    <div className="flex flex-col gap-2">
                        <Label>
                            Business <span className="text-red text-sm">*</span>
                        </Label>
                        <Input
                            name="businessName"
                            placeholder="Customer Name"
                            className="p-7"
                            required
                            value={supplierForm.businessName}
                            onChange={handleInputChange}
                        />
                        {errors.businessName && (
                            <span className="text-red text-sm">{errors.businessName}</span>
                        )}
                    </div>

                    {/* Firstname and Lastname */}
                    <div className="flex flex-col gap-2">
                        <Label>Salesperson</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                name="firstname"
                                placeholder="Firstname"
                                className="p-7"
                                value={supplierForm.firstname}
                                onChange={handleInputChange}
                            />
                            {errors.firstname && (
                                <span className="text-red text-sm">{errors.firstname}</span>
                            )}
                            <Input
                                name="lastname"
                                placeholder="Lastname"
                                className="p-7"
                                value={supplierForm.lastname}
                                onChange={handleInputChange}
                            />
                            {errors.lastname && (
                                <span className="text-red text-sm">{errors.lastname}</span>
                            )}
                        </div>
                    </div>

                    {/* Contact and Email */}
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
                                <span className="text-red text-sm">{errors.contact}</span>
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
                                <span className="text-red text-sm">{errors.email}</span>
                            )}
                        </div>
                    </div>

                    {/* Address, City, Region, Country, Postal Code */}
                    <div className="flex gap-3">
                        <div className="flex w-full flex-col gap-2">
                            <Label>Address Line</Label>
                            <Input
                                name="addressLine"
                                placeholder="Address Line"
                                className="p-7"
                                value={supplierForm.addressLine}
                                onChange={handleInputChange}
                            />
                            {errors.addressLine && (
                                <span className="text-red text-sm">{errors.addressLine}</span>
                            )}
                        </div>
                        <div className="flex w-full flex-col gap-2">
                            <Label>City</Label>
                            <Input
                                name="city"
                                placeholder="City"
                                className="p-7"
                                value={supplierForm.city}
                                onChange={handleInputChange}
                            />
                            {errors.city && <span className="text-red text-sm">{errors.city}</span>}
                        </div>
                    </div>

                    {/* Region, Country, Postal Code */}
                    <div className="flex gap-3">
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
                                <span className="text-red text-sm">{errors.region}</span>
                            )}
                        </div>
                        <div className="flex w-full flex-col gap-2">
                            <Label>Country</Label>
                            <Input
                                name="country"
                                placeholder="Country"
                                className="p-7"
                                value={supplierForm.country}
                                onChange={handleInputChange}
                            />
                            {errors.country && (
                                <span className="text-red text-sm">{errors.country}</span>
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
                                <span className="text-red text-sm">{errors.postalCode}</span>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Textarea
                            name="notes"
                            placeholder="About this supplier..."
                            rows={4}
                            className="resize-none bg-gray"
                            value={supplierForm.notes}
                            onChange={handleInputChange}
                        />
                        {errors.notes && <span className="text-red text-sm">{errors.notes}</span>}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="submit"
                            className="bg-green p-7 text-lg font-bold"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default NewSupplierState;
