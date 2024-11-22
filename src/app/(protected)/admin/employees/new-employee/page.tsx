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

const NewEmployee = () => {
  const router = useRouter();
  const [employeeForm, setEmployeeForm] = useState({
    firstname: "",
    lastname: "",
    contact: "",
    email: "",
    addressLine: "",
    city: "",
    region: "",
    country: "",
    postalCode: "",
    notes: "",
    username: "", // New username field
    password: "", // New password field
  });

  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    postalCode: "",
    addressLine: "",
    city: "",
    region: "",
    country: "",
    notes: "",
    username: "", // New username field
    password: "", // New password field
  });

  const { refetch: refetchEmployees } = api.employee.list.useQuery();
  const createEmployee = api.employee.create.useMutation({
    onSuccess: () => {
      alert("Employee created successfully!"); // Success message
      refetchEmployees(); // Refetch employees after creation
      handleClear(); // Clear the form after successful creation
      router.push("/admin/employees"); // Redirect to employees page
    },
    onError: (error) => {
      alert(`Failed to create employee: ${error.message}`); // Error message
    },
  });

  const handleinputChange = (
    e: React.ChangeEvent<HTMLinputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({
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
      contact: "",
      email: "",
      addressLine: "",
      city: "",
      region: "",
      country: "",
      postalCode: "",
      notes: "",
      username: "", // New username field
      password: "", // New password field
    };

    const {
      firstname,
      lastname,
      contact,
      email,
      addressLine,
      city,
      region,
      country,
      postalCode,
      notes,
      username,
      password,
    } = employeeForm;

    if (!firstname.trim()) {
      newErrors.firstname = "Firstname is required.";
    } else if (firstname.length < 2 || !firstname.match(/^[a-zA-Z]+$/)) {
      newErrors.firstname =
        "Firstname must only contain letters and be at least 2 characters long.";
    }

    if (!lastname.trim()) {
      newErrors.lastname = "Lastname is required.";
    } else if (lastname.length < 2 || !lastname.match(/^[a-zA-Z]+$/)) {
      newErrors.lastname =
        "Lastname must only contain letters and be at least 2 characters long.";
    }
    if (!username.trim()) {
      newErrors.username = "Username is required."; // Required check
    }
    if (!password.trim()) {
      newErrors.password = "Password is required."; // Required check
    } else if (password.trim().length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    if (contact && !contact.match(/^\d{9,10}$/)) {
      newErrors.contact = "Contact Number must be 9-10 digits.";
    }
    if (email && !isValidEmail(email.trim())) {
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
    if (notes && notes.trim().length < 5) {
      newErrors.notes = "Notes must be at least 5 characters long.";
    }

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

    const employeeData = {
      firstName: firstname.trim(),
      lastName: lastname.trim(),
      username: username.trim(), // Include username
      password: password, // Include password
      ...(contact && { contact }),
      ...(email && { email: email.trim() }),
      ...(locationData && { location: locationData }),
      ...(notes && { notes }),
    };

    createEmployee.mutate(employeeData);
  };

  const handleClear = () => {
    setEmployeeForm({
      firstname: "",
      lastname: "",
      contact: "",
      email: "",
      addressLine: "",
      city: "",
      region: "",
      country: "",
      postalCode: "",
      notes: "",
      username: "", // New username error
      password: "", // New password error
    });
    setErrors({});
  };

  const handleBack = () => {
    router.push("/admin/employees"); // Navigate back to employees page
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
            onClick={handleBack} // Navigate to employees page on click
          />
          <span className="font-bold">NEW EMPLOYEE</span>
          <span className="text-gray-400 ml-3 text-sm font-light">#12345</span>
        </div>
      </div>

      <div className="flex h-full flex-col gap-5 px-52">
        <div className="flex h-full w-full flex-col justify-center gap-7">
          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>
                First Name <span className="text-red-600">*</span>
              </Label>
              <input
                name="firstname"
                placeholder="First Name"
                className="p-7"
                value={employeeForm.firstname}
                onChange={handleinputChange}
              />
              {errors.firstname && (
                <span className="text-red-500">{errors.firstname}</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>
                Last Name <span className="text-red-600">*</span>
              </Label>
              <input
                name="lastname"
                placeholder="Last Name"
                className="p-7"
                value={employeeForm.lastname}
                onChange={handleinputChange}
              />
              {errors.lastname && (
                <span className="text-red-500">{errors.lastname}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>Contact Number</Label>
              <input
                name="contact"
                placeholder="Contact Number"
                className="p-7"
                value={employeeForm.contact}
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
                value={employeeForm.email}
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
              value={employeeForm.addressLine}
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
                value={employeeForm.city}
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
                value={employeeForm.region}
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
                value={employeeForm.country}
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
                value={employeeForm.postalCode}
                onChange={handleinputChange}
              />
              {errors.postalCode && (
                <span className="text-red-500">{errors.postalCode}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex w-full flex-col gap-2">
              <Label>
                Username <span className="text-red-600">*</span>
              </Label>
              <input
                name="username"
                placeholder="Username"
                className="p-7"
                value={employeeForm.username}
                onChange={handleinputChange}
              />
              {errors.username && (
                <span className="text-red-500">{errors.username}</span>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <Label>
                Password <span className="text-red-600">*</span>
              </Label>
              <input
                name="password"
                type="password" // Ensure password is masked
                placeholder="Password"
                className="p-7"
                value={employeeForm.password}
                onChange={handleinputChange}
              />
              {errors.password && (
                <span className="text-red-500">{errors.password}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Notes</Label>
            <textarea
              name="notes"
              placeholder="Notes"
              className="p-7"
              value={employeeForm.notes}
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

export default NewEmployee;
