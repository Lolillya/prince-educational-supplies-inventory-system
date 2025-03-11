import React, { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface Supplier {
    id: string;
    company: string;
}

interface SupplierDropdownProps {
    suppliers: Supplier[];
    selectedSupplier: Supplier | null;
    setSelectedSupplier: (supplier: { id: string; name: string }) => void;
}

const SupplierDropdown = ({ suppliers, selectedSupplier, setSelectedSupplier }: SupplierDropdownProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Update filtered suppliers when search term changes
    useEffect(() => {
        if (searchTerm.trim() !== "") {
            const filtered = suppliers.filter((supplier) =>
                (supplier.company?.toLowerCase() || "").includes(searchTerm.toLowerCase())
            );
            setFilteredSuppliers(filtered);
            setDropdownVisible(filtered.length > 0); // Show dropdown only if there are matches
        } else {
            setFilteredSuppliers([]);
            setDropdownVisible(false); // Hide dropdown when input is cleared
        }
    }, [searchTerm, suppliers]);


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            setHighlightedIndex((prevIndex) =>
                prevIndex < filteredSuppliers.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === "ArrowUp") {
            setHighlightedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
            );
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault(); // Prevent default form submission
            const selectedSupplier = filteredSuppliers[highlightedIndex];
            if (selectedSupplier) {
                handleSelectSupplier(selectedSupplier);
            }
            setDropdownVisible(false); // Ensure dropdown is hidden
        } else if (e.key === "Escape") {
            setDropdownVisible(false); // Close dropdown on Escape
        }
    };

    // const handleSelectSupplier = (supplierCompany) => {
    //     setSelectedSupplier(supplierCompany);
    //     setSearchTerm(supplierCompany); // Display selected supplier
    //     setDropdownVisible(false); // Immediately hide the dropdown
    //     setHighlightedIndex(-1); // Reset index
    // };
    const handleSelectSupplier = (supplier: Supplier) => {
        // Set both the supplier id and company name
        setSelectedSupplier({
            id: supplier.id, // Set supplier ID
            name: supplier.company, // Set company name
        });
        setSearchTerm(supplier.company); // Display selected supplier name
        setDropdownVisible(false); // Immediately hide the dropdown
        setHighlightedIndex(-1); // Reset index
    };


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim() === "") {
            setDropdownVisible(false); // Hide dropdown when input is cleared
        }
    };

    const handleBlur = () => {
        // Close the dropdown after a short delay to allow clicks to register
        setTimeout(() => setDropdownVisible(false), 150);
    };

    const parseConversions = (conversionString: string) => {
        const regex = /(\w+)\s\((\d+)\s(\w+)/g; // Matches formats like "Boxes (10 Cases"
        const conversions = [];

        let match;
        let currentFrom = conversionString.split(" ")[0]; // Starting unit (e.g., "Boxes")

        while ((match = regex.exec(conversionString)) !== null) {
            const [, from, amount, to] = match;
            conversions.push({
                from: currentFrom,
                to,
                amount: Number(amount),
            });
            currentFrom = to; // Set next "from" as current "to"
        }

        return conversions;
    };


    return (
        <div className="relative w-full">
            <Input
                placeholder="Search Supplier by Company"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setDropdownVisible(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="bg-emerald-100 text-black placeholder-slate-500"
            />
            {dropdownVisible && filteredSuppliers.length > 0 && (
                <div
                    className="absolute top-full mt-1 w-full rounded-md bg-white shadow-lg z-10"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                    {filteredSuppliers.map((supplier, index) => (
                        <div
                            key={supplier.id}
                            // key={supplier.company}
                            className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${highlightedIndex === index ? "bg-emerald-200" : ""
                                }`}
                            onMouseDown={() => handleSelectSupplier(supplier)} // Prevent blur on click
                        >
                            {supplier.company}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SupplierDropdown;
