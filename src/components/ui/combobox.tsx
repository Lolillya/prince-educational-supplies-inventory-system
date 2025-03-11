import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog-transparent";
import { Button } from "~/components/ui/button";

type Status = {
  value: string;
  label: string;
};

interface ComboBoxSearchableProps {
  initialData?: Status[];
  placeholder: string;
  onAdd?: (newStatus: Status) => void;
  onDelete?: (statusToDelete: Status) => void;
  onSelect?: (selectedStatus: Status) => void;
  className?: string;
  defaultValue?: Status; // New prop for default value
}

export const ComboBoxSearchable: React.FC<ComboBoxSearchableProps> = ({
  initialData = [],
  placeholder,
  onAdd,
  onDelete,
  onSelect,
  className = "",
  defaultValue, // Destructure the defaultValue prop
}) => {
  const [statuses, setStatuses] = useState<Status[]>(initialData);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(
    defaultValue || null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Status | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);

  // Debouncing the Search:
  //
  //     If your status list grows large, debouncing the search query can improve performance and reduce unnecessary renders.
  // const debounceQuery = useRef(
  //     _.debounce((query) => setQuery(query), 500)
  // ).current;
  //
  // const handleQueryChange = (e) => {
  //   debounceQuery(e.target.value);
  // };



  // Sync statuses with initialData when it changes
  useEffect(() => {
    setStatuses(initialData);
  }, [initialData]);

  // Sync selected status with defaultValue when it changes
  useEffect(() => {
    if (defaultValue) {
      setSelectedStatus(defaultValue);
      setQuery(defaultValue.label); // Set query to the default value label
    }
  }, [defaultValue]);

  // Check for duplicate status values
  useEffect(() => {
    const values = statuses.map((status) => status.value);
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== values.length) {
      console.warn("Duplicate status values detected:", values);
    }
  }, [statuses]);

  // Filter statuses safely with additional logging
  const filteredStatuses = statuses.filter((status) => {
    // console.log("Current status:", status); // Log the current status object
    const isValidStatus = status && typeof status.label === "string"; // Ensure label is a string
    return (
      isValidStatus &&
      status.label.toLowerCase().includes(query?.toLowerCase() || "")
    ); // Safely handle query
  });

  const handleAddStatus = () => {
    setNewStatus({ value: query.toLowerCase(), label: query });
    setIsDialogOpen(true); // Open dialog
  };

  const confirmAddStatus = () => {
    if (newStatus) {
      setStatuses((prevStatuses) => [...prevStatuses, newStatus]);
      setSelectedStatus(newStatus);
      setQuery(newStatus.label);
      setOpen(false);
      if (onAdd) onAdd(newStatus);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteStatus = (status: Status) => {
    setStatusToDelete(status);
    setIsDeleteDialogOpen(true); // Open confirmation dialog
  };

  const confirmDeleteStatus = () => {
    if (statusToDelete) {
      setStatuses((prevStatuses) =>
        prevStatuses.filter((status) => status.value !== statusToDelete.value)
      );

      if (onDelete) onDelete(statusToDelete);

      // Reset selected status if the deleted status was selected
      if (selectedStatus?.value === statusToDelete.value) {
        setSelectedStatus(null);
        setQuery(""); // Clear input when the selected status is deleted
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSelectStatus = (status: Status) => {
    setSelectedStatus(status);
    setQuery(status.label); // Set input to selected label
    setOpen(false);

    // Log selected status to the console
    // console.log(`Selected: ${status.label} (Value: ${status.value})`);

    // Call the onSelect callback if provided
    if (onSelect) {
      onSelect(status); // This will trigger the logging in NewInventory
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="max-h- flex w-full max-w-lg flex-col p-6">
          <DialogTitle className="text-center">Add New Record</DialogTitle>
          <DialogHeader>
            <div className="flex w-full justify-center text-center text-lg">
              <span>
                Are you sure you want to add "<strong>{query}</strong>" as a new record?
              </span>
            </div>
          </DialogHeader>

          <div className="flex w-full items-center justify-center gap-3 mt-4">
            <Button
              size={"lg"}
              className="border-2 border-gray-300 bg-white p-3 text-gray-700 hover:bg-textGray"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size={"lg"}
              className="border-2 border-gray-300 bg-white p-3 text-gray-700 hover:bg-green"
              onClick={confirmAddStatus}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
        <DialogContent className="max-h- flex w-full max-w-lg flex-col p-6">
          <DialogTitle className="text-center">Delete Record</DialogTitle>
          <DialogHeader>
            <div className="flex w-full justify-center text-center text-lg">
              <span>
                Are you sure you want to delete "<strong>{statusToDelete?.label}</strong>"?
              </span>
            </div>
          </DialogHeader>

          <div className="flex w-full items-center justify-center gap-3 mt-4">
            <Button
              size={"lg"}
              className="border-2 border-gray-300 bg-white p-3 text-gray-700 hover:bg-textGray"
              onClick={() => setIsDeleteDialogOpen(false)} // Cancel deletion
            >
              Cancel
            </Button>
            <Button
              size={"lg"}
              className="border-2 border-gray-300 bg-white p-3 text-gray-700 hover:bg-red"
              onClick={confirmDeleteStatus} // Confirm deletion
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onClick={() => setOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} // Delay for click event
        className={`focus:ring-gray-500 w-full rounded-lg border p-2 focus:outline-none focus:ring-1 ${className}`}
      />
      {open && (
        <div className="border-gray-300 absolute z-10 mt-1 w-auto min-w-full max-w-none rounded border bg-white shadow-lg">
          <Command>
            <CommandList>
              {filteredStatuses.length > 0 ? (
                <CommandGroup>
                  {filteredStatuses.map((status, index) => (
                    <CommandItem
                      key={`${status.value}-${index}`}
                      className="hover:bg-gray-200"
                    >
                      <span
                        onClick={() => handleSelectStatus(status)} // Handle selection on click
                        className="flex-grow cursor-pointer p-2"
                      >
                        {status.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent click from firing the item click
                          handleDeleteStatus(status);
                        }}
                        className="hover:text-gray-800 ml-2 text-black"
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
                <div className="border-gray-300 border-t p-2">
                  <button
                    onClick={handleAddStatus}
                    className="text-blue-600 hover:bg-blue-100 w-full px-4 py-2 text-left"
                  >
                    + Add "{query}" to record
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
