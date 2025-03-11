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
import { DialogTitle } from "@radix-ui/react-dialog";
import SwitchComponent from "~/app/(protected)/admin/employees/_components/switch";



interface EmployeeFormState {
    firstName: string;
    lastName: string;
    contact: string;
    email: string;
    addressLine: string;
    city: string;
    region: string;
    country: string;
    postalCode: string;
    notes: string;
    username: string,
    password: string,
}

interface EmployeeFormErrors {
    firstName?: string;
    lastName?: string;
    contact?: string;
    email?: string;
    addressLine?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    notes?: string;
    username?: string,
    password?: string,
}


const defaultEmployeeForm: EmployeeFormState = {
    firstName: "",
    lastName: "",
    contact: "",
    email: "",
    addressLine: "",
    city: "",
    region: "",
    country: "",
    postalCode: "",
    notes: "",
    username: "",
    password: "",
};

const NewEmployeeState = ({ id }: { id: string }) => {
    const [errors, setErrors] = useState<EmployeeFormErrors>({});
    const router = useRouter();
    const { refetch } = api.employees.list.useQuery();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);



    const createEmployee = api.employees.create.useMutation({
        onSuccess: () => {
            setDialogOpen(true); // Show dialog
            handleClear();
            refetch();
        },
        onError: (error) => {
            alert(`Failed to create employee: ${error.message}`);
        },
    });


    const [employeeForm, setEmployeeForm] = useState({
        firstName: "",
        lastName: "",
        contact: "",
        email: "",
        addressLine: "",
        city: "",
        region: "",
        country: "",
        postalCode: "",
        notes: "",
        username: "",
        password: "",
    });

    const {
        data: employeeData,
        isLoading,
        isError,
    } = api.employees.getById.useQuery({ id });

    useEffect(() => {
        if (!isLoading && employeeData) {
            setEmployeeForm({
                firstName: employeeData.first_name ?? "",
                lastName: employeeData.last_name ?? "",
                contact: employeeData.contact ?? "",
                email: employeeData.email ?? "",
                addressLine: employeeData.location?.address_line ?? "",
                city: employeeData.location?.city ?? "",
                region: employeeData.location?.region ?? "",
                country: employeeData.location?.country ?? "",
                postalCode: employeeData.location?.postal_code ?? "",
                notes: employeeData.notes ?? "",
                username: employeeData.auth?.username ?? "",  // Access from employeeData.auth
                password: employeeData.auth?.password ?? "",  // Access from employeeData.auth
            });
        }
    }, [isLoading, employeeData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setEmployeeForm((prev) => ({
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

    const validateForm = (): EmployeeFormErrors => {
        const newErrors: EmployeeFormErrors = {};
        const { firstName, lastName, contact, email, addressLine, city, region, country, postalCode, notes, username, password } = employeeForm;

        if (!firstName) {
            newErrors.firstName = "First Name is required.";
        } else if (firstName.length < 2 || !firstName.match(/^[a-zA-Z]+$/)) {
            newErrors.firstName = "First Name must only contain letters and be at least 2 characters long.";
        } else if (firstName.length > 50) {
            newErrors.firstName = "First Name must be at most 50 characters long.";
        }

        if (!lastName) {
            newErrors.lastName = "Last Name is required.";
        } else if (lastName.length < 2 || !lastName.match(/^[a-zA-Z]+$/)) {
            newErrors.lastName = "Last Name must only contain letters and be at least 2 characters long.";
        } else if (lastName.length > 50) {
            newErrors.lastName = "Last Name must be at most 50 characters long.";
        }

        if (!username) {
            newErrors.username = "Username is required.";
        } else if (username.length < 4) {
            newErrors.username = "Username must be at least 4 characters long.";
        } else if (username.length > 50) {
            newErrors.username = "Username must be at most 50 characters long.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
        } else if (password.length > 50) {
            newErrors.password = "Password must be at most 50 characters long.";
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
                await createEmployee.mutateAsync({
                    firstName: employeeForm.firstName,
                    lastName: employeeForm.lastName,
                    contact: employeeForm.contact,
                    email: employeeForm.email,
                    addressLine: employeeForm.addressLine,
                    city: employeeForm.city,
                    region: employeeForm.region,
                    country: employeeForm.country,
                    postalCode: employeeForm.postalCode,
                    notes: employeeForm.notes,
                    username: employeeForm.username,
                    password: employeeForm.password,
                    isAdmin,
                });
            } catch (error) {
                console.error("Error creating employee:", error);
            }
        }
    };

    const handleClear = () => {
        setEmployeeForm(defaultEmployeeForm);
        setErrors({});
    };


    return (
        <div className="flex h-full flex-col gap-5 px-52">
            <form className="h-full w-full">
                <div className="flex h-full w-full flex-col justify-center gap-7">
                    <div className="flex w-full justify-end">
                        <div className="flex flex-col gap-2 w-[200px]"> {/* Set a fixed width */}
                            <Label>
                                Administrator Privileges
                            </Label>
                            <SwitchComponent
                                isAllowed={isAdmin}
                                onToggle={setIsAdmin}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>
                            Employee <span className="text-red">*</span>
                        </Label>
                        <div className="flex items-center gap-3">
                            <Input
                                name="firstName"
                                placeholder="First Name"
                                className="p-7"
                                value={employeeForm.firstName}
                                onChange={handleInputChange}
                            />
                            {errors.firstName && (
                                <span className="text-red">{errors.firstName}</span>
                            )}
                            <Input
                                name="lastName"
                                placeholder="Last Name"
                                className="p-7"
                                value={employeeForm.lastName}
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
                                value={employeeForm.contact}
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
                                value={employeeForm.email}
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
                            value={employeeForm.addressLine}
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
                                value={employeeForm.city}
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
                                value={employeeForm.region}
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
                                value={employeeForm.country}
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
                                value={employeeForm.postalCode}
                                onChange={handleInputChange}
                            />
                            {errors.postalCode && (
                                <span className="text-red">{errors.postalCode}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex w-full flex-col gap-2">
                            <Label>
                                Username <span className="text-red">*</span>
                            </Label>
                            <Input
                                name="username"
                                placeholder="Username"
                                className="p-7"
                                value={employeeForm.username}
                                onChange={handleInputChange}
                            />
                            {errors.username && (
                                <span className="text-red">{errors.username}</span>
                            )}
                        </div>

                        <div className="flex w-full flex-col gap-2">
                            <Label>
                                Password <span className="text-red">*</span>
                            </Label>
                            <Input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="p-7"
                                value={employeeForm.password}
                                onChange={handleInputChange}
                            />
                            {errors.password && (
                                <span className="text-red">{errors.password}</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <Textarea
                            name="notes"
                            placeholder="About this employee..."
                            rows={4}
                            className="resize-none bg-gray"
                            value={employeeForm.notes}
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
                        <p>Employee created successfully!</p>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    setDialogOpen(false);
                                    router.push("/admin/employees"); // Redirect
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

export default NewEmployeeState;
