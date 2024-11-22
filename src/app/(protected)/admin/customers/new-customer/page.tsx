"use client";

import { Poppins } from "next/font/google";
import { ArrowLeft } from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

import { api } from "~/utils/api";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const NewCustomer = () => {
  const router = useRouter();
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

  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    postalCode: "",
    businessName: "",
    addressLine: "",
    city: "",
    region: "",
    country: "",
    notes: "",
  });

  const { refetch: refetchCustomers } = api.customer.list.useQuery();
  const createCustomer = api.customer.create.useMutation({
    onSuccess: () => {
      alert("Customer created successfully!"); // Success message
      refetchCustomers(); // Refetch customers after creation
      handleClear(); // Clear the form after successful creation
      router.push("/admin/customers"); // Redirect to customers page
    },
    onError: (error) => {
      alert(`Failed to create customer: ${error.message}`); // Error message
    },
  });

  const handleinputChange = (
    e: React.ChangeEvent<HTMLinputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSave = () => {
    let newErrors = {
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
    };

    const {
      firstname,
      lastname,
      businessName,
      contact,
      email,
      addressLine,
      city,
      region,
      country,
      postalCode,
      notes,
    } = customerForm;

    if (
      firstname &&
      (firstname.length < 2 || !firstname.match(/^[a-zA-Z]+$/))
    ) {
      newErrors.firstname =
        "Firstname must only contain letters and be at least 2 characters long.";
    }
    if (lastname && (lastname.length < 2 || !lastname.match(/^[a-zA-Z]+$/))) {
      newErrors.lastname =
        "Lastname must only contain letters and be at least 2 characters long.";
    }
    if (!businessName) {
      newErrors.businessName = "Business Name is required.";
    } else if (businessName.trim().length < 2) {
      newErrors.businessName =
        "Business Name must be at least 2 characters long.";
    }
    if (contact && !contact.match(/^\d{9,10}$/)) {
      newErrors.contact = "Contact Number must be 9-10 digits.";
    }
    if (email && !isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (addressLine && addressLine.trim().length < 5) {
      newErrors.addressLine = "Address must be at least 5 characters long.";
    }
    if (city && city.trim().length < 2) {
      newErrors.city = "City must be at least 2 characters long.";
    }
    if (region && region.trim().length < 2) {
      newErrors.region = "Region must be at least 2 characters long.";
    }
    if (country && country.trim().length < 2) {
      newErrors.country = "Country must be at least 2 characters long.";
    }
    if (postalCode && !/\d/.test(postalCode)) {
      newErrors.postalCode = "Postal Code must contain at least one digit.";
    }
    if (notes && notes.length < 5) {
      newErrors.notes = "Notes must be at least 5 characters long.";
    }

    // Set errors if any
    if (Object.values(newErrors).some((msg) => msg)) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear previous errors

    // Collect location data only if at least one location field is provided
    const locationData =
      addressLine || city || region || country || postalCode
        ? {
            ...(addressLine && { addressLine }),
            ...(city && { city }),
            ...(region && { region }),
            ...(country && { country }),
            ...(postalCode && { postalCode }),
          }
        : null;

    const customerData = {
      firstName: firstname.trim(),
      lastName: lastname.trim(),
      ...(businessName && { company: businessName }),
      ...(contact && { contact }),
      ...(email && { email: email.trim() }),
      ...(locationData && { location: locationData }),
      ...(notes && { notes }),
    };

    createCustomer.mutate(customerData);
  };

  const handleClear = () => {
    setCustomerForm({
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
  };

  const handleBack = () => {
    router.push("/admin/customers"); // Navigate back to customers page
  };

  return (
    <section
      className={`h-screen w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-2">
          <ArrowLeft
            size={25}
            color="#FF7B7B"
            className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
            onClick={handleBack} // Navigate to customers page on click
          />
          <span className="font-bold">NEW CUSTOMER</span>
          <span className="text-gray-400 ml-3 text-sm font-light">#12345</span>
        </div>
      </div>

      <div className="flex h-full flex-col gap-5 px-52">
        <div className="flex h-full w-full flex-col justify-center gap-7">
          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>First Name</Label>
              <input
                name="firstname"
                placeholder="First Name"
                className="p-7"
                value={customerForm.firstname}
                onChange={handleinputChange}
              />
              {errors.firstname && (
                <span className="text-red-500">{errors.firstname}</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Last Name</Label>
              <input
                name="lastname"
                placeholder="Last Name"
                className="p-7"
                value={customerForm.lastname}
                onChange={handleinputChange}
              />
              {errors.lastname && (
                <span className="text-red-500">{errors.lastname}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>
              Business <span className="text-red-600">*</span>
            </Label>
            <input
              name="businessName"
              placeholder="Business Name"
              className="p-7"
              value={customerForm.businessName}
              onChange={handleinputChange}
            />
            {errors.businessName && (
              <span className="text-red-500">{errors.businessName}</span>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>Contact Number</Label>
              <input
                name="contact"
                placeholder="Contact Number"
                className="p-7"
                value={customerForm.contact}
                onChange={handleinputChange}
              />
              {errors.contact && (
                <span className="text-red-500">{errors.contact}</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Email</Label>
              <input
                name="email"
                placeholder="Email"
                className="p-7"
                value={customerForm.email}
                onChange={handleinputChange}
              />
              {errors.email && (
                <span className="text-red-500">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Address</Label>
            <input
              name="addressLine"
              placeholder="Address Line"
              className="p-7"
              value={customerForm.addressLine}
              onChange={handleinputChange}
            />
            {errors.addressLine && (
              <span className="text-red-500">{errors.addressLine}</span>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>City</Label>
              <input
                name="city"
                placeholder="City"
                className="p-7"
                value={customerForm.city}
                onChange={handleinputChange}
              />
              {errors.city && (
                <span className="text-red-500">{errors.city}</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Region</Label>
              <input
                name="region"
                placeholder="Region"
                className="p-7"
                value={customerForm.region}
                onChange={handleinputChange}
              />
              {errors.region && (
                <span className="text-red-500">{errors.region}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>Country</Label>
              <input
                name="country"
                placeholder="Country"
                className="p-7"
                value={customerForm.country}
                onChange={handleinputChange}
              />
              {errors.country && (
                <span className="text-red-500">{errors.country}</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>Postal Code</Label>
              <input
                name="postalCode"
                placeholder="Postal Code"
                className="p-7"
                value={customerForm.postalCode}
                onChange={handleinputChange}
              />
              {errors.postalCode && (
                <span className="text-red-500">{errors.postalCode}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Notes</Label>
            <textarea
              name="notes"
              placeholder="Notes"
              className="p-7"
              value={customerForm.notes}
              onChange={handleinputChange}
            />
            {errors.notes && (
              <span className="text-red-500">{errors.notes}</span>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewCustomer;
