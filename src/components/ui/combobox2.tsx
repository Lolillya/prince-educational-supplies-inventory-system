import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "~/components/ui/command";

type Status = {
    value: string;
    label: string;
};

interface ComboBoxSearchableWithCheckboxProps {
    initialData?: Status[];
    placeholder: string;
    onAdd?: (newStatus: Status) => void;
    onDelete?: (statusToDelete: Status) => void;
    onSelectionChange?: (selectedStatuses: Status[]) => void;
    className?: string;
}

export const ComboBoxSearchableWithCheckbox: React.FC<
    ComboBoxSearchableWithCheckboxProps
> = ({
         initialData = [],
         placeholder,
         onAdd,
         onDelete,
         onSelectionChange,
         className = "",
     }) => {
    const [statuses, setStatuses] = useState<Status[]>(initialData);
    const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
        new Set(),
    );
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync statuses with initialData on changes
    useEffect(() => {
        setStatuses(initialData);
    }, [initialData]);

    const filteredStatuses = statuses.filter((status) =>
        status.label.toLowerCase().includes(query.toLowerCase()),
    );

    const displayValue = Array.from(selectedStatuses)
        .map((value) => statuses.find((s) => s.value === value)?.label)
        .join(", ");

    const handleAddStatus = () => {
        const confirmAdd = window.confirm(
            `Are you sure you want to add "${query}" as a new status?`,
        );
        if (confirmAdd) {
            const newStatus = { value: query.toLowerCase(), label: query };
            setStatuses((prevStatuses) => [...prevStatuses, newStatus]);
            setQuery("");
            if (onAdd) onAdd(newStatus);
        }
    };

    const handleDeleteStatus = (statusToDelete: Status) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${statusToDelete.label}"?`,
        );
        if (confirmDelete) {
            setStatuses((prevStatuses) =>
                prevStatuses.filter((status) => status.value !== statusToDelete.value),
            );
            if (onDelete) onDelete(statusToDelete);
        }
    };

    const toggleSelectStatus = (status: Status) => {
        setSelectedStatuses((prevSelectedStatuses) => {
            const newSelectedStatuses = new Set(prevSelectedStatuses);
            if (newSelectedStatuses.has(status.value)) {
                newSelectedStatuses.delete(status.value);
            } else {
                newSelectedStatuses.add(status.value);
            }
            // Delay the onSelectionChange call
            setTimeout(() => {
                if (onSelectionChange) {
                    onSelectionChange(
                        Array.from(newSelectedStatuses).map(
                            (value) => statuses.find((s) => s.value === value) as Status,
                        ),
                    );
                }
            }, 0);
            return newSelectedStatuses;
        });
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            inputRef.current &&
            !inputRef.current.contains(event.target as Node)
        ) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            <input
                type="text"
                ref={inputRef}
                placeholder={placeholder}
                value={isFocused ? query : displayValue}
                onClick={() => setOpen(true)}
                onFocus={() => {
                    setIsFocused(true);
                    setOpen(true);
                }}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                    setQuery(e.target.value);
                }}
                className={`w-full rounded-lg border p-2 focus:outline-none focus:ring-1 focus:ring-gray-500 ${className}`}
            />
            {open && (
                <div
                    className="absolute z-10 mt-1 rounded border border-gray-300 bg-white shadow-lg"
                    style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        minWidth: "100%",
                        whiteSpace: "nowrap",
                    }}
                >
                    <Command>
                        <CommandList>
                            {filteredStatuses.length > 0 ? (
                                <CommandGroup>
                                    {filteredStatuses.map((status) => (
                                        <CommandItem
                                            key={status.value}
                                            value={status.value}
                                            onClick={() => toggleSelectStatus(status)}
                                            className="flex cursor-pointer items-center overflow-hidden whitespace-nowrap"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedStatuses.has(status.value)}
                                                onChange={(e) => {
                                                    e.stopPropagation(); // Prevent click event bubbling
                                                    toggleSelectStatus(status); // Call toggle function
                                                }}
                                                className="mr-2"
                                            />
                                            <span className="flex-grow overflow-hidden text-ellipsis">
                        {status.label}
                      </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteStatus(status);
                                                }}
                                                className="ml-2 text-black hover:text-gray-800"
                                            >
                                                &times;
                                            </button>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ) : (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}
                            {filteredStatuses.length === 0 && query && (
                                <div className="border-t border-gray-300 p-2">
                                    <button
                                        onClick={handleAddStatus}
                                        className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-100"
                                    >
                                        + Add "{query}" to statuses
                                    </button>
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
};
