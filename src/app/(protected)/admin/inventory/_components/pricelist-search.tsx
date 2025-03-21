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

type SearchType = 'variants' | 'items' | 'brands' | 'categories';

const PriceListSearch = ({
  filteredItems,
  onItemSelect,
}: PriceListSearchProps) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchType, setSearchType] = React.useState<SearchType>('variants');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleItemClick = (result: any) => {
    if (searchType === 'variants') {
      onItemSelect?.(result as Inventory);
    } else {
      const relatedVariants = filteredItems?.filter(item => {
        switch (searchType) {
          case 'items':
            return item.variant.item.name === result.name;
          case 'brands':
            return item.variant.item.brand.name === result.name;
          case 'categories':
            return item.variant.item.category.name === result.name;
          default:
            return false;
        }
      });

      relatedVariants?.forEach(variant => {
        onItemSelect?.(variant);
      });
    }

    setIsFocused(false);
    setSearchTerm("");
    inputRef.current?.blur();
  };

  // Create unique lists for each search type
  const uniqueLists = React.useMemo(() => {
    if (!filteredItems) return { items: [], brands: [], categories: [] };

    const items = new Set(filteredItems.map(item => item.variant.item.name));
    const brands = new Set(filteredItems.map(item => item.variant.item.brand.name));
    const categories = new Set(filteredItems.map(item => item.variant.item.category.name));

    return {
      items: Array.from(items),
      brands: Array.from(brands),
      categories: Array.from(categories),
    };
  }, [filteredItems]);

  const getFilteredResults = () => {
    const searchLower = searchTerm.toLowerCase();

    switch (searchType) {
      case 'variants':
        return filteredItems?.filter(item => {
          const itemName = item.variant.item.name.toLowerCase();
          const brandName = item.variant.item.brand.name.toLowerCase();
          const variantName = item.variant.name?.toLowerCase() || "";
          return itemName.includes(searchLower) ||
            brandName.includes(searchLower) ||
            variantName.includes(searchLower);
        });

      case 'items':
        return uniqueLists.items
          .filter(item => item.toLowerCase().includes(searchLower))
          .map(item => ({ name: item }));

      case 'brands':
        return uniqueLists.brands
          .filter(brand => brand.toLowerCase().includes(searchLower))
          .map(brand => ({ name: brand }));

      case 'categories':
        return uniqueLists.categories
          .filter(category => category.toLowerCase().includes(searchLower))
          .map(category => ({ name: category }));

      default:
        return [];
    }
  };

  const renderSearchResult = (result: any) => {
    if (searchType === 'variants') {
      const item = result as Inventory;
      return (
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
      );
    } else {
      const variantCount = filteredItems?.filter(item => {
        switch (searchType) {
          case 'items':
            return item.variant.item.name === result.name;
          case 'brands':
            return item.variant.item.brand.name === result.name;
          case 'categories':
            return item.variant.item.category.name === result.name;
          default:
            return false;
        }
      }).length ?? 0;

      return (
        <div
          key={result.name}
          className="cursor-pointer rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
          onMouseDown={(e) => {
            e.preventDefault();
            handleItemClick(result);
          }}
        >
          <div className="flex justify-between items-center">
            <span>{result.name}</span>
            <span className="text-xs text-slate-400">
              {variantCount} variant{variantCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="relative">
      <div className="flex w-full items-center rounded-lg bg-slate-100 pl-3 focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
        <Search className="text-slate-700" />
        <Input
          ref={inputRef}
          placeholder={`Search ${searchType}...`}
          className="w-full bg-transparent text-slate-700 shadow-none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select
          defaultValue="variants"
          value={searchType}
          onValueChange={(value: SearchType) => setSearchType(value)}
        >
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
            {(() => {
              const results = getFilteredResults();
              return results && results.length > 0 ? (
                results.map(result => renderSearchResult(result))
              ) : (
                <div className="px-4 py-2 text-center text-sm text-slate-500">
                  No {searchType} found
                </div>
              );
            })()}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default PriceListSearch;
