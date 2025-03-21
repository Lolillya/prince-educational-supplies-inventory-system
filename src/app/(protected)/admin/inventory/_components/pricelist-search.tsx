import { Search } from "lucide-react";
import React from "react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { RouterOutputs } from "~/trpc/react";

type Inventory = RouterOutputs["inventory"]["listInventory"][0];

interface PriceListSearchProps {
  filteredItems?: Inventory[];
  onItemSelect?: (item: Inventory) => void;
}

const PriceListSearch = ({
  filteredItems,
  onItemSelect,
}: PriceListSearchProps) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleItemClick = (item: Inventory) => {
    onItemSelect?.(item);
    setIsFocused(false);
    setSearchTerm("");
    inputRef.current?.blur(); // Remove focus from input
  };

  const filteredResults = filteredItems?.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const itemName = item.variant.item.name.toLowerCase();
    const brandName = item.variant.item.brand.name.toLowerCase();
    const variantName = item.variant.name?.toLowerCase() || "";

    return (
      itemName.includes(searchLower) ||
      brandName.includes(searchLower) ||
      variantName.includes(searchLower)
    );
  });

  return (
    <div className="relative">
      <div className="flex w-full items-center rounded-lg bg-slate-100 pl-3 focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
        <Search className="text-slate-700" />
        <Input
          ref={inputRef}
          placeholder={"Search..."}
          className="w-full bg-transparent text-slate-700 shadow-none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select defaultValue="variants">
          <SelectTrigger className="w-40 bg-slate-100 text-slate-600 pl-4 h-8 border-l-4 border-y-0 border-r-0 rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-100 shadow-none mt-2 border-4">
            <SelectItem value="variants" className="text-slate-700 hover:bg-slate-200">Variants</SelectItem>
            <SelectItem value="items" className="text-slate-700 hover:bg-slate-200">Items</SelectItem>
            <SelectItem value="brands" className="text-slate-700 hover:bg-slate-200">Brands</SelectItem>
            <SelectItem value="categories" className="text-slate-700 hover:bg-slate-200">Categories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isFocused && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border-4 border-slate-200/50 bg-slate-100 p-2">
          <ScrollArea className="h-36">
            {filteredResults && filteredResults.length > 0 ? (
              filteredResults.map((item) => (
                <div
                  key={item.variant.variant_id}
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleItemClick(item);
                  }}
                >
                  {item.variant.item.name} - {item.variant.item.brand.name}
                  {item.variant.name && ` - ${item.variant.name}`}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-center text-sm text-slate-500">
                No items found
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default PriceListSearch;
