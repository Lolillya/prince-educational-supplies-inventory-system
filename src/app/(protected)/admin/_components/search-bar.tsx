import { Search } from "lucide-react";
import React from "react";
import { Input } from "~/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  return (
    <div className="flex w-[400px] items-center rounded-lg bg-slate-100 px-3 focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
      <Search className="text-slate-500" />
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-slate-700 shadow-none"
      />
    </div>
  );
};

export default SearchBar;
