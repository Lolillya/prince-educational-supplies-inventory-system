"use client";

import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { ArrowLeft } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const EditEmployee = ({ params }: { params: { employeeId: string } }) => {
  const router = useRouter();
  const employeeId = parseInt(params.employeeId); // Parse employeeId as a number
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
    username: "", // Add username to state
    password: "", // Add password to state
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
    username: "", // Add error field for username
    password: "", // Add error field for password
  });

  const { refetch: refetchEmployees } = api.employee.list.useQuery();
  const { data: employees, isLoading } = api.employee.list.useQuery();
  const updateEmployee = api.employee.update.useMutation({
    onSuccess: () => {
      alert("Employee updated successfully!"); // Success message
      refetchEmployees(); // Refetch employees after creation
      handleClear(); // Clear the form after successful update
      router.push("/admin/employees"); // Redirect to employees page
    },
    onError: (error) => {
      alert(`Failed to update employee: ${error.message}`); // Error message
    },
  });

  useEffect(() => {
    if (employees) {
      const employee = employees.find((s) => s.employee_id === employeeId);
      if (employee) {
        setEmployeeForm({
          firstname: employee.personal_details.first_name,
          lastname: employee.personal_details.last_name,
          contact: employee.personal_details.contact || "",
          email: employee.personal_details.email || "",
          addressLine: employee.personal_details.location?.address_line || "",
          city: employee.personal_details.location?.city || "",
          region: employee.personal_details.location?.region || "",
          country: employee.personal_details.location?.country || "",
          postalCode: employee.personal_details.location?.postal_code || "",
          notes: employee.personal_details.notes || "",
          username: employee.personal_details.auth.username || "", // Add username from employee data
          password: "", // Initialize password as empty
        });
      }
    }
  }, [employees, employeeId]);

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
    // Initialize error messages
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
      username: "", // Error for username
      password: "", // Error for password
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

    // Validate fields
    if (firstname === null || firstname.trim() === "") {
      newErrors.firstname = "Firstname is required.";
    } else if (!/^[a-zA-Z]{2,}$/.test(firstname.trim())) {
      newErrors.firstname =
        "Firstname must only contain letters and be at least 2 characters long.";
    }
    if (lastname === null || lastname.trim() === "") {
      newErrors.lastname = "Lastname is required.";
    } else if (!/^[a-zA-Z]{2,}$/.test(lastname.trim())) {
      newErrors.lastname =
        "Lastname must only contain letters and be at least 2 characters long.";
    }
    if (email && !isValidEmail(email.trim()))
      newErrors.email = "Please enter a valid email address.";
    if (contact && !/^\d*$/.test(contact))
      newErrors.contact = "Contact must contain only numbers.";
    if (postalCode && !/^\d*$/.test(postalCode))
      newErrors.postalCode = "Postal Code must contain only numbers.";
    if (addressLine && addressLine.trim().length < 5)
      newErrors.addressLine = "Address must be at least 5 characters long.";
    if (city && city.trim().length < 2)
      newErrors.city = "City must be at least 2 characters long.";
    if (region && region.trim().length < 2)
      newErrors.region = "Region must be at least 2 characters long.";
    if (country && country.trim().length < 2)
      newErrors.country = "Country must be at least 2 characters long.";
    if (notes && notes.trim().length < 5)
      newErrors.notes = "Notes must be at least 5 characters long.";
    if (!username.trim()) newErrors.username = "Username is required."; // Validate username
    if (password && password.length < 8)
      newErrors.password = "Password must be at least 8 characters long.";
    // if (password && password.length < 6) newErrors.password = "Password must be at least 6 characters long."; // Validate password length

    // Set errors if any
    if (Object.values(newErrors).some((msg) => msg)) {
      setErrors(newErrors);
      return;
    }

    // Proceed to save employee data if no errors
    setErrors({}); // Clear previous errors

    // Check if location exists and handle accordingly
    const hasLocation = !!(
      addressLine ||
      city ||
      region ||
      country ||
      postalCode
    );

    const locationData = hasLocation
      ? { addressLine, city, region, country, postalCode }
      : null; // Set to null if no location data provided

    updateEmployee.mutate({
      employeeId: employeeId,
      firstName: firstname.trim(),
      lastName: lastname.trim(),
      contact,
      email: email.trim(),
      location: locationData,
      notes,
      username: username.trim(), // Add username to mutation payload
      password: password.trim(), // Add password to mutation payload
    });
  };

  const deleteEmployee = trpc.employee.delete.useMutation({
    onSuccess: () => {
      alert("Employee deleted successfully!");
      refetchEmployees(); // Refresh the employee list
      router.push("/admin/employees"); // Redirect to the employees page
    },
    onError: (error) => {
      alert(`Failed to delete employee: ${error.message}`);
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteEmployee.mutate({ employeeId });
    }
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
      username: "", // Clear username
      password: "", // Clear password
    });
  };

  const handleBack = () => {
    router.push("/admin/employees"); // Navigate back to employees page
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          <span className="font-bold">EDIT EMPLOYEE</span>
          <span className="text-gray-400 ml-3 text-sm font-light">
            #{employeeId}
          </span>
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
                name="password" // Ensure this matches the state
                type="password" // Set the type to "password"
                placeholder="New Password"
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
              placeholder="Additional Notes"
              className="p-7"
              value={employeeForm.notes}
              onChange={handleinputChange}
            />
            {errors.notes && (
              <span className="text-red-500">{errors.notes}</span>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleDelete}>
              Delete Employee
            </Button>

            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditEmployee;
