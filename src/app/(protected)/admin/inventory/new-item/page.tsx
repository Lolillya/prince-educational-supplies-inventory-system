"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog-transparent";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import Variant from "../_components/variant";
import Conversion from "../_components/conversion";
import { ScrollArea } from "~/components/ui/scroll-area";
import ConversionCard from "../_components/conversion-card";
import { Toaster } from "~/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";

// Define a type for a variant
type VariantData = {
  id: number;
  variant: string;
  lowStock: number;
  veryLowStock: number;
  isExisting: boolean;
  hasBatchVariant: boolean;
};

// Update the PresetData type to ensure conversions are consistent
type PresetData = {
  id: number;
  mainUnit: string;
  mainPrice: string | number;
  isExisting?: boolean;
  conversions: Array<{
    qty: string;
    unit: string;
    price?: string | number;
    quantity?: number; // For backward compatibility
  }>;
};

const NewItem = () => {
  const router = useRouter();
  const utils = api.useUtils();
  const session = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [isDialogCancelOpen, setIsDialogCancelOpen] = useState(false);
  const [isDialogSaveOpen, setIsDialogSaveOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const [dropdownVisible, setDropdownVisible] = useState({
    item: false,
    brand: false,
    category: false,
    variant: false,
  });

  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [itemSearch, setItemSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [item, setItem] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [variant, setVariant] = useState("");

  const [itemOptions, setItemOptions] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

  const [filteredItems, setFilteredItems] = useState<string[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<string[]>([]);

  const [presets, setPresets] = useState<PresetData[]>([
    {
      id: Date.now(),
      mainUnit: "",
      mainPrice: "",
      conversions: [],
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<{
    name: string;
    brand_id?: number;
    category_id?: number;
    description?: string;
    item_id?: number;
  } | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<{
    name: string;
    brand_id: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string;
    category_id: number;
  } | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const {
    data: nextItemId,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = api.inventory.getItemId.useQuery();

  const { data, isLoading, isError } = api.inventory.listAllData.useQuery();

  const { data: inventoryData } = api.inventory.listInventory.useQuery();

  // Fetch presets for the selected item if there's an item ID
  const { data: fetchedPresets, isLoading: isLoadingPresets } =
    api.inventory.getPresetsByItemId.useQuery(
      { itemId: selectedItemId! },
      {
        enabled: !!selectedItemId, // Only run the query if we have an itemId
      },
    );

  const { mutateAsync: createItem } = api.inventory.createItem.useMutation();
  const { mutateAsync: createPresetMutation } =
    api.inventory.createPreset.useMutation();

  // Use mutations outside the handleSave function to avoid invalid hook calls.
  const { mutateAsync: createBrandMutation } =
    api.inventory.createBrand.useMutation();
  const { mutateAsync: createCategoryMutation } =
    api.inventory.createCategory.useMutation();
  const { mutateAsync: createItemMutation } =
    api.inventory.createItem.useMutation();
  const { mutateAsync: createVariantMutation } =
    api.inventory.createVariant.useMutation();
  const { mutateAsync: createStockLevelMutation } =
    api.inventory.createStockLevel.useMutation();
  const { mutateAsync: createInventoryMutation } =
    api.inventory.createInventory.useMutation();
  const { mutateAsync: updateItemMutation } =
    api.inventory.updateItem.useMutation();

  const { mutateAsync: deletePresetMutation } =
    api.inventory.deletePreset.useMutation({
      onSuccess: () => {
        // Invalidate the inventory list query to refresh the data
        utils.inventory.listInventory.invalidate();
        utils.inventory.listAllData.invalidate();
      },
    });

  const { mutateAsync: addConversionToPresetMutation } =
    api.inventory.addConversionToPreset.useMutation({
      onSuccess: () => {
        // Invalidate the queries to refresh the data
        utils.inventory.listInventory.invalidate();
        utils.inventory.listAllData.invalidate();
        utils.inventory.getPresetsByItemId.invalidate();
      },
    });

  const { mutateAsync: removeConversionFromPresetMutation } =
    api.inventory.removeConversionFromPreset.useMutation({
      onSuccess: () => {
        // Invalidate the queries to refresh the data
        utils.inventory.listInventory.invalidate();
        utils.inventory.listAllData.invalidate();
        utils.inventory.getPresetsByItemId.invalidate();
      },
    });

  // Update variants state definition with proper type
  const [variants, setVariants] = useState<VariantData[]>([
    {
      id: Date.now(),
      variant: "",
      lowStock: 0,
      veryLowStock: 0,
      isExisting: false,
      hasBatchVariant: false,
    },
  ]);

  const [conversions, setConversions] = useState([{ id: Date.now() }]);

  const [isSaving, setIsSaving] = useState(false);

  const [lowStock, setLowStock] = useState(0);
  const [veryLowStock, setVeryLowStock] = useState(0);

  // Memoized states
  const brands = useMemo(() => data?.brands ?? [], [data]);
  const categories = useMemo(() => data?.categories ?? [], [data]);
  const units = useMemo(() => data?.units ?? [], [data]);
  const items = useMemo(() => data?.items ?? [], [data]);
  const variantsMemo = useMemo(() => data?.variants ?? [], [data]);
  const formatPriceInput = (value: string | number): string => {
    // Ensure we're working with a string
    if (value === null || value === undefined) return "";

    // Convert to string first
    const valueStr = value.toString();

    // Remove any non-digit or non-dot characters
    let formatted = valueStr.replace(/[^\d.]/g, "");

    // Ensure only one decimal point
    const parts = formatted.split(".");
    if (parts.length > 2) {
      formatted = parts[0] + "." + parts.slice(1).join("");
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      // Safely access parts[1] with a fallback to empty string
      const decimal = parts[1] || "";
      formatted = parts[0] + "." + decimal.slice(0, 2);
    }

    return formatted;
  };

  useEffect(() => {
    if (item) {
      const selectedItem = data?.items.find(
        (itemData) => itemData.name === item,
      );
      if (selectedItem) {
        setItemDescription(selectedItem.description ?? "");
      }
    }
  }, [item, data?.items]);

  useEffect(() => {
    if (data?.items) {
      // Create a Set of unique item names and convert back to array
      const uniqueItemNames = [...new Set(data.items.map((item) => item.name))];
      setItemOptions(uniqueItemNames);
    }

    if (data?.categories) {
      // Create a Set of unique category names and convert back to array
      const uniqueCategoryNames = [
        ...new Set(data.categories.map((category) => category.name)),
      ];
      setCategoryOptions(uniqueCategoryNames);
    }

    if (data?.brands) {
      // Create a Set of unique brand names and convert back to array
      const uniqueBrandNames = [
        ...new Set(data.brands.map((brand) => brand.name)),
      ];
      setBrandOptions(uniqueBrandNames);
    }
  }, [data]);

  useEffect(() => {
    if (itemSearch) {
      setFilteredItems(
        itemOptions.filter((itemName) =>
          itemName.toLowerCase().includes(itemSearch.toLowerCase()),
        ),
      );
      setDropdownVisible((prev) => ({ ...prev, item: true }));
    } else {
      setFilteredItems([]);
      setDropdownVisible((prev) => ({ ...prev, item: false }));
    }
  }, [itemSearch, itemOptions]);

  useEffect(() => {
    if (brandSearch) {
      setFilteredBrands(
        brandOptions.filter((brandName) =>
          brandName.toLowerCase().includes(brandSearch.toLowerCase()),
        ),
      );
      setDropdownVisible((prev) => ({ ...prev, brand: true }));
    } else {
      setFilteredBrands([]);
      setDropdownVisible((prev) => ({ ...prev, brand: false }));
    }
  }, [brandSearch, brandOptions]);

  useEffect(() => {
    if (categorySearch) {
      setFilteredCategories(
        categoryOptions.filter((categoryName) =>
          categoryName.toLowerCase().includes(categorySearch.toLowerCase()),
        ),
      );
      setDropdownVisible((prev) => ({ ...prev, category: true }));
    } else {
      setFilteredCategories([]);
      setDropdownVisible((prev) => ({ ...prev, category: false }));
    }
  }, [categorySearch, categoryOptions]);

  useEffect(() => {
    const currentBrand = selectedBrand?.name ?? brandSearch;
    const currentCategory = selectedCategory?.name ?? categorySearch;

    if (item && currentBrand && currentCategory) {
      const matchingItem = items.find(
        (i) =>
          i.name === item &&
          i.brand?.name === currentBrand &&
          i.category?.name === currentCategory,
      );

      if (matchingItem) {
        // Check for batch variants for each variant
        const variantsWithBatchCheck = matchingItem.variants.map((v) => {
          const hasBatchVariant = inventoryData?.some(
            (inv) =>
              inv.variant?.variant_id === v.variant_id &&
              inv.variant?.BatchVariant?.length > 0,
          );

          return {
            id: v.variant_id,
            variant: v.name,
            lowStock: v.StockLevel?.low_stock || 0,
            veryLowStock: v.StockLevel?.very_low_stock || 0,
            isExisting: true,
            hasBatchVariant: !!hasBatchVariant,
          };
        });

        setVariants(
          variantsWithBatchCheck.length > 0
            ? variantsWithBatchCheck
            : [
                {
                  id: Date.now(),
                  variant: "",
                  lowStock: 0,
                  veryLowStock: 0,
                  isExisting: false,
                  hasBatchVariant: false,
                },
              ],
        );

        // Set the selected item ID to trigger the preset fetch
        if (matchingItem.item_id) {
          setSelectedItemId(matchingItem.item_id);
        }
      } else {
        setVariants([
          {
            id: Date.now(),
            variant: "",
            lowStock: 0,
            veryLowStock: 0,
            isExisting: false,
            hasBatchVariant: false,
          },
        ]);
        setSelectedItemId(null);
        setPresets([
          {
            id: Date.now(),
            mainUnit: "",
            mainPrice: "",
            conversions: [],
          },
        ]);
      }
    } else {
      // Clear everything when any field is empty
      setVariants([
        {
          id: Date.now(),
          variant: "",
          lowStock: 0,
          veryLowStock: 0,
          isExisting: false,
          hasBatchVariant: false,
        },
      ]);
      setSelectedItemId(null);
      setPresets([
        {
          id: Date.now(),
          mainUnit: "",
          mainPrice: "",
          isExisting: false,
          conversions: [],
        },
      ]);
    }
  }, [
    item,
    brandSearch,
    selectedBrand,
    categorySearch,
    selectedCategory,
    items,
    inventoryData,
  ]);

  // Process fetched presets when they arrive
  useEffect(() => {
    if (fetchedPresets && fetchedPresets.length > 0) {
      console.log("Raw presets from API:", fetchedPresets);

      // Map DB presets to component format
      const formattedPresets: PresetData[] = fetchedPresets.map((preset) => {
        // Debug the preset structure to understand what's coming from the DB
        console.log("Processing preset:", preset);

        // Add additional safeguards to handle potential missing properties
        const mainPrice =
          preset.main_price !== undefined && preset.main_price !== null
            ? formatPriceInput(preset.main_price)
            : "0.00";

        return {
          id: preset.preset_id,
          mainUnit: preset.main_unit || "",
          mainPrice: mainPrice,
          isExisting: true,
          conversions: (preset.conversions || []).map((conv) => {
            // Debug individual conversion
            console.log("Processing conversion:", conv);

            return {
              qty: conv.conversion_rate ? conv.conversion_rate.toString() : "0",
              unit: conv.to_unit || "",
              price: conv.related_price
                ? formatPriceInput(conv.related_price)
                : "",
            };
          }),
        };
      });

      console.log("Formatted presets for UI:", formattedPresets);

      // If we have formatted presets, use them; otherwise use the default
      if (formattedPresets.length > 0) {
        setPresets(formattedPresets);
      } else {
        setPresets([
          {
            id: Date.now(),
            mainUnit: "",
            mainPrice: "",
            isExisting: false,
            conversions: [],
          },
        ]);
      }
    } else {
      // If no presets found, reset to default
      setPresets([
        {
          id: Date.now(),
          mainUnit: "",
          mainPrice: "",
          isExisting: false,
          conversions: [],
        },
      ]);
    }
  }, [fetchedPresets]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // Close all dropdowns if clicking outside their area
      const dropdownElements = document.querySelectorAll(".dropdown-area");
      let clickedInsideDropdown = false;

      dropdownElements.forEach((element) => {
        if (element.contains(e.target as Node)) {
          clickedInsideDropdown = true;
        }
      });

      if (!clickedInsideDropdown) {
        setDropdownVisible({
          item: false,
          brand: false,
          category: false,
          variant: false,
        });
      }
    };

    // Add event listener for mousedown to handle clicks outside
    document.addEventListener("mousedown", handleOutsideClick);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelect = (type: string, name: string) => {
    switch (type) {
      case "item":
        if (itemOptions.includes(name)) {
          setItem(name);
        }
        const selectedItem = items.find((item) => item.name === name);
        if (selectedItem) {
          setSelectedItem({
            name: selectedItem.name,
            brand_id: selectedItem.brand_id,
            category_id: selectedItem.category_id,
            description: selectedItem.description || undefined,
            item_id: selectedItem.item_id,
          });
          setItemDescription(selectedItem.description || "");
          console.log("Selected Item:", selectedItem);
        }
        break;
      case "category":
        if (categoryOptions.includes(name)) {
          setCategory(name);
        }
        const selectedCategory = categories.find((cat) => cat.name === name);
        if (selectedCategory) {
          setSelectedCategory(selectedCategory);
          console.log("Selected Category:", selectedCategory);
        }
        break;
      case "brand":
        if (brandOptions.includes(name)) {
          setBrand(name);
          setBrandSearch("");
        }
        const selectedBrand = brands.find((brand) => brand.name === name);
        if (selectedBrand) {
          setSelectedBrand(selectedBrand);
          setBrandSearch("");
          console.log("Selected Brand:", selectedBrand);
        }
        break;
      default:
        break;
    }
    if (type === "item") setItemSearch("");
    else if (type === "category") setCategorySearch("");
    else if (type === "brand") setBrandSearch("");

    setDropdownVisible((prev) => ({ ...prev, [type]: false }));
  };

  const handleSearchItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemSearch(value);

    // If field is cleared, also clear the item state
    if (value === "") {
      setItem("");
      setSelectedItem(null);
    }

    // Check if the current value exactly matches an option
    const exactMatch = itemOptions.find(
      (option) => option.toLowerCase() === value.toLowerCase(),
    );
    if (exactMatch) {
      handleSelect("item", exactMatch);
    }
  };

  const handleSearchBrand = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBrandSearch(value);

    // If field is cleared, also clear the brand state
    if (value === "") {
      setBrand("");
      setSelectedBrand(null);
    }

    // Check if the current value exactly matches an option
    const exactMatch = brandOptions.find(
      (option) => option.toLowerCase() === value.toLowerCase(),
    );
    if (exactMatch) {
      handleSelect("brand", exactMatch);
    }
  };

  const handleSearchCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategorySearch(value);

    // If field is cleared, also clear the category state
    if (value === "") {
      setCategory("");
      setSelectedCategory(null);
    }

    // Check if the current value exactly matches an option
    const exactMatch = categoryOptions.find(
      (option) => option.toLowerCase() === value.toLowerCase(),
    );
    if (exactMatch) {
      handleSelect("category", exactMatch);
    }
  };

  // Find best match for input value in options
  const findBestMatch = (inputValue: string, options: string[]) => {
    if (!inputValue.trim()) return null;

    // Only look for exact match (case insensitive)
    const exactMatch = options.find(
      (option) => option.toLowerCase() === inputValue.toLowerCase(),
    );

    // Only return exact matches now to prevent unwanted auto-selection
    return exactMatch || null;
  };

  // Handle blur for item input
  const handleItemBlur = () => {
    // Immediately hide the dropdown
    setDropdownVisible((prev) => ({ ...prev, item: false }));

    // Then run the matching logic with a small delay
    setTimeout(() => {
      // Only auto-select if it's an exact match, otherwise keep the user's input
      if (itemSearch) {
        const bestMatch = findBestMatch(itemSearch, itemOptions);
        if (bestMatch) {
          handleSelect("item", bestMatch);
        }
      }
    }, 200); // Small delay to allow dropdown click to register if user is clicking an option
  };

  // Handle blur for brand input
  const handleBrandBlur = () => {
    // Immediately hide the dropdown
    setDropdownVisible((prev) => ({ ...prev, brand: false }));

    setTimeout(() => {
      // Only auto-select if it's an exact match, otherwise keep the user's input
      if (brandSearch) {
        const bestMatch = findBestMatch(brandSearch, brandOptions);
        if (bestMatch) {
          handleSelect("brand", bestMatch);
        }
      }
    }, 200);
  };

  // Handle blur for category input
  const handleCategoryBlur = () => {
    // Immediately hide the dropdown
    setDropdownVisible((prev) => ({ ...prev, category: false }));

    setTimeout(() => {
      // Only auto-select if it's an exact match, otherwise keep the user's input
      if (categorySearch) {
        const bestMatch = findBestMatch(categorySearch, categoryOptions);
        if (bestMatch) {
          handleSelect("category", bestMatch);
        }
      }
    }, 200);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: string,
  ) => {
    let filteredOptions = [];
    let setHighlightedIndexFn = (
      index: number | ((prev: number) => number),
    ) => {};

    switch (field) {
      case "item":
        filteredOptions = filteredItems;
        setHighlightedIndexFn = setHighlightedIndex;
        break;
      case "brand":
        filteredOptions = filteredBrands;
        setHighlightedIndexFn = setHighlightedIndex;
        break;
      case "category":
        filteredOptions = filteredCategories;
        setHighlightedIndexFn = setHighlightedIndex;
        break;
      case "variant":
        filteredOptions = filteredVariants;
        setHighlightedIndexFn = setHighlightedIndex;
        break;
      default:
        return;
    }

    if (e.key === "ArrowDown") {
      setHighlightedIndexFn((prevIndex) =>
        prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex,
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndexFn((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      const selectedOption = filteredOptions[highlightedIndex];
      if (selectedOption) {
        handleSelect(field, selectedOption);
      }
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: Date.now(),
        variant: "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: false,
        hasBatchVariant: false,
      },
    ]);
  };

  const handleRemoveVariant = (id: number) => {
    setVariants((prev) => prev.filter((variant) => variant.id !== id));
  };

  const handleAddConversion = () => {
    setConversions((prev) => [...prev, { id: Date.now() }]);
  };

  const handleRemoveConversion = (id: number) => {
    setConversions((prev) => prev.filter((conv) => conv.id !== id));
  };

  const handleDeleteCard = (id: number) => {
    setVariants(variants.filter((variant) => variant.id !== id));
  };

  const clear = () => {
    setIsDialogCancelOpen(true);
  };

  const handleConfirmClear = () => {
    setItem("");
    setBrand("");
    setCategory("");
    setVariant("");
    setItemDescription("");
    setItemSearch("");
    setBrandSearch("");
    setCategorySearch("");
    setDropdownVisible({
      item: false,
      brand: false,
      category: false,
      variant: false,
    });
    setVariants([
      {
        id: Date.now(),
        variant: "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: false,
        hasBatchVariant: false,
      },
    ]);
    setIsDialogCancelOpen(false);
  };

  const handleCancelClear = () => {
    setIsDialogCancelOpen(false);
  };

  const { mutateAsync: updateVariantMutation } =
    api.inventory.updateVariant.useMutation();

  // Helper function to check if two preset cards are duplicates
  const arePresetsIdentical = (
    preset1: PresetData,
    preset2: PresetData,
  ): boolean => {
    // Check if main unit and price are the same
    if (preset1.mainUnit !== preset2.mainUnit) return false;

    // Compare main prices - handle both string and number formats
    const price1 =
      typeof preset1.mainPrice === "string"
        ? parseFloat(preset1.mainPrice)
        : preset1.mainPrice;
    const price2 =
      typeof preset2.mainPrice === "string"
        ? parseFloat(preset2.mainPrice)
        : preset2.mainPrice;

    // If prices are not equal (accounting for floating point errors)
    if (Math.abs(price1 - price2) > 0.001) return false;

    // Check if they have the same number of conversions
    if (preset1.conversions.length !== preset2.conversions.length) return false;

    // Create a copy of preset2 conversions for tracking matches
    const remainingConv2 = [...preset2.conversions];

    // For each conversion in preset1, find a match in preset2
    for (const conv1 of preset1.conversions) {
      // Find the index of a matching conversion in the remaining preset2 conversions
      const matchIdx = remainingConv2.findIndex((conv2) => {
        // Match unit and quantity
        if (conv1.unit !== conv2.unit || conv1.qty !== conv2.qty) {
          return false;
        }

        // Match price (handle undefined/string/number cases)
        const price1Str = conv1.price?.toString() || "";
        const price2Str = conv2.price?.toString() || "";

        if (!price1Str && !price2Str) return true; // Both empty
        if (!price1Str || !price2Str) return false; // One empty, one not

        // Compare numeric values with small tolerance for floating point
        const price1Num = parseFloat(price1Str);
        const price2Num = parseFloat(price2Str);

        return (
          !isNaN(price1Num) &&
          !isNaN(price2Num) &&
          Math.abs(price1Num - price2Num) <= 0.001
        );
      });

      // If no match found for this conversion
      if (matchIdx === -1) return false;

      // Remove the matched conversion so it can't be matched again
      remainingConv2.splice(matchIdx, 1);
    }

    // If we get here, all conversions matched exactly once
    return true;
  };

  const { mutateAsync: deleteVariantMutation } =
    api.inventory.deleteVariant.useMutation({
      onSuccess: () => {
        // Invalidate the inventory list query to refresh the data
        utils.inventory.listInventory.invalidate();
        utils.inventory.listAllData.invalidate();
      },
    });

  const { mutateAsync: updatePresetMutation } =
    api.inventory.updatePresetChain.useMutation({
      onSuccess: () => {
        utils.inventory.listInventory.invalidate();
        utils.inventory.listAllData.invalidate();
        utils.inventory.getPresetsByItemId.invalidate();
      },
    });

  const handleSave = async () => {
    // Check main inputs first
    if (!itemSearch && !selectedItem) {
      toast("❌ Missing input", {
        description: "Please fill in the Item name field",
        duration: 4000,
      });
      return;
    }

    if (!brandSearch && !selectedBrand) {
      toast("❌ Missing input", {
        description: "Please fill in the Brand field",
        duration: 4000,
      });
      return;
    }

    if (!categorySearch && !selectedCategory) {
      toast("❌ Missing input", {
        description: "Please fill in the Category field",
        duration: 4000,
      });
      return;
    }

    // Check for variants with missing stock levels
    const variantsWithName = variants.filter((v) => v.variant.trim() !== "");
    const missingStockLevels = variantsWithName.filter(
      (variant) => !variant.lowStock || !variant.veryLowStock,
    );

    if (missingStockLevels.length > 0) {
      toast("❌ Missing stock levels", {
        description:
          "Each variant must have both low stock and very low stock levels set",
        duration: 4000,
      });
      return;
    }

    // Check for duplicate variant names
    const variantNames = variantsWithName.map((v) =>
      v.variant.trim().toLowerCase(),
    );
    const duplicateVariants = variantNames.filter(
      (name, index) => variantNames.indexOf(name) !== index,
    );

    if (duplicateVariants.length > 0) {
      toast("❌ Duplicate variants", {
        description: "Each variant must have a unique name",
        duration: 4000,
      });
      return;
    }

    // Check for stock level errors
    const stockLevelErrors = variants.filter(
      (variant) =>
        variant.lowStock > 0 &&
        variant.veryLowStock > 0 &&
        variant.lowStock <= variant.veryLowStock,
    );

    if (stockLevelErrors.length > 0) {
      toast("❌ Invalid stock levels", {
        description:
          "Very low stock must be less than low stock for all variants",
        duration: 4000,
      });
      return;
    }

    // Filter out empty variants and existing ones
    const validVariants = variants.filter(
      (variant) =>
        !variant.isExisting &&
        variant.variant?.trim() !== "" &&
        variant.lowStock > 0 &&
        variant.veryLowStock > 0,
    );

    // Check if there are any existing variants
    const hasExistingVariants = variants.some((variant) => variant.isExisting);

    // Only require new variants if there are no existing ones
    if (validVariants.length === 0 && !hasExistingVariants) {
      toast("❌ Missing input", {
        description:
          "Please fill out at least one variant with all required fields",
        duration: 4000,
      });
      return;
    }

    // Check for duplicate preset cards (completely identical presets)
    const hasDuplicatePresets = presets.some((preset, index) => {
      // Look for any identical preset with a different index
      return presets.some(
        (otherPreset, otherIndex) =>
          index !== otherIndex && arePresetsIdentical(preset, otherPreset),
      );
    });

    if (hasDuplicatePresets) {
      toast("❌ Duplicate preset cards", {
        description:
          "You have multiple identical preset cards. Please keep only one of each.",
        duration: 4000,
      });
      return;
    }

    // Now check preset validations
    // 1. First check - Main Unit
    const hasEmptyMainUnit = presets.some((preset) => !preset.mainUnit);
    if (hasEmptyMainUnit) {
      toast("❌ Missing main unit", {
        description: "Please fill in the Main Unit field for all presets",
        duration: 4000,
      });
      return;
    }

    // 2. Second check - Main Price
    const invalidMainPrices = presets.filter((preset) => {
      // Handle the string | number conversion before using parseFloat
      const price =
        typeof preset.mainPrice === "string"
          ? parseFloat(preset.mainPrice)
          : preset.mainPrice;

      return (
        !preset.mainPrice ||
        preset.mainPrice === "" ||
        preset.mainPrice === "0.00" ||
        preset.mainPrice === "0" ||
        price <= 0
      );
    });

    if (invalidMainPrices.length > 0) {
      toast("❌ Invalid price", {
        description: "Main Price cannot be empty, zero, or negative",
        duration: 4000,
      });
      return;
    }

    // 3. Third check - Conversion Row Quantity and Price
    const invalidConversions = presets.some((preset) =>
      preset.conversions.some((conv) => {
        const qty = parseFloat(conv.qty);
        // Check if qty is invalid
        if (isNaN(qty) || qty <= 0) {
          return true;
        }

        // If price exists, check if it's invalid
        if (conv.price !== undefined && conv.price !== "") {
          // Handle the string | number conversion
          const price =
            typeof conv.price === "string"
              ? parseFloat(conv.price)
              : conv.price;

          if (isNaN(price) || price <= 0) {
            return true;
          }
        }

        return false;
      }),
    );

    if (invalidConversions) {
      toast("❌ Invalid conversion values", {
        description:
          "Quantity and Price in conversions cannot be zero or negative",
        duration: 4000,
      });
      return;
    }

    // 4. Fourth check - Conversion Row Unit
    const invalidUnits = presets.some((preset) => {
      // Only check conversion units here since main unit was checked first
      const conversionUnitsInvalid = preset.conversions.some(
        (conv) => !units.some((unit) => unit.name === conv.unit),
      );

      return conversionUnitsInvalid;
    });

    if (invalidUnits) {
      toast("❌ Invalid unit selection", {
        description: "Please select conversion units from the dropdown list",
        duration: 4000,
      });
      return;
    }

    // Additional validation checks
    // Check for empty conversion rows
    const hasEmptyConversions = presets.some((preset) =>
      preset.conversions.some((conv) => !conv.qty && !conv.unit && !conv.price),
    );

    if (hasEmptyConversions) {
      toast("❌ Empty conversion rows", {
        description: "Please fill in or remove empty conversion rows",
        duration: 4000,
      });
      return;
    }

    // Check for incomplete conversion rows (some fields filled, others empty)
    const hasIncompleteConversions = presets.some((preset) =>
      preset.conversions.some(
        (conv) =>
          // At least one field is empty AND at least one field has a value
          (!conv.qty || !conv.unit || !conv.price) &&
          (conv.qty || conv.unit || conv.price),
      ),
    );

    if (hasIncompleteConversions) {
      toast("❌ Incomplete conversions", {
        description:
          "Please complete all fields in each conversion row (Qty, Unit, and Price)",
        duration: 4000,
      });
      return;
    }

    // Check for duplicate units in presets
    const hasDuplicates = presets.some((preset) => hasDuplicateUnits(preset));

    if (hasDuplicates) {
      toast("❌ Duplicate units", {
        description: "Each unit in a preset must be unique",
        duration: 4000,
      });
      return;
    }

    // Check for "pieces" unit positioning
    const hasInvalidPiecesPosition = presets.some((preset) => {
      // Check if "pieces" is used as main unit
      if (preset.mainUnit && preset.mainUnit.toLowerCase() === "pieces") {
        return true;
      }

      // Check if "pieces" is used in any conversion row except the last one
      const conversionsWithUnits = preset.conversions.filter(
        (conv) => conv.unit && conv.unit.trim() !== "",
      );
      const lastIndex = conversionsWithUnits.length - 1;

      return conversionsWithUnits.some((conv, index) => {
        return (
          conv.unit &&
          conv.unit.toLowerCase() === "pieces" &&
          index !== lastIndex
        );
      });
    });

    if (hasInvalidPiecesPosition) {
      toast("❌ Invalid 'pieces' unit position", {
        description:
          "'Pieces' can only be used in the last conversion row, not as main unit or in the middle",
        duration: 4000,
      });
      return;
    }

    // Check for at least one valid conversion
    const hasNoValidConversions = presets.every(
      (preset) =>
        preset.conversions.length === 0 ||
        preset.conversions.every((conv) => !conv.qty || !conv.unit),
    );

    if (hasNoValidConversions) {
      toast("❌ Missing preset conversions", {
        description:
          "Please add at least one preset conversion with at least one complete conversion row",
        duration: 4000,
      });
      return;
    }

    setIsSaving(true);

    try {
      const brandId = selectedBrand
        ? selectedBrand.brand_id
        : await createBrandMutation({ name: brandSearch }).then(
            (res) => res.brand_id,
          );

      const categoryId = selectedCategory
        ? selectedCategory.category_id
        : await createCategoryMutation({ name: categorySearch }).then(
            (res) => res.category_id,
          );

      let item;

      if (selectedItem) {
        // Always update the selected item instead of creating a new one
        if (selectedItem.item_id) {
          // Update existing item
          item = await updateItemMutation({
            item_id: selectedItem.item_id,
            description: itemDescription,
            brand_id: brandId,
            category_id: categoryId,
            name: selectedItem.name,
          });

          console.log("Updated existing item:", item);

          // Handle deleted variants - if we have an existing item, delete any variants that were removed
          if (selectedItem.item_id) {
            // Get the existing variants for the item
            const existingVariants =
              items.find((i) => i.item_id === selectedItem.item_id)?.variants ||
              [];

            // Find variants that exist in the database but are not in the current variants list
            const variantsToDelete = existingVariants.filter(
              (existingVariant) =>
                !variants.some((v) => v.id === existingVariant.variant_id),
            );

            // Delete the removed variants
            for (const variantToDelete of variantsToDelete) {
              try {
                console.log("Attempting to delete variant:", variantToDelete);
                await deleteVariantMutation({
                  variantId: variantToDelete.variant_id,
                });
                console.log(
                  "Successfully deleted variant:",
                  variantToDelete.variant_id,
                );
              } catch (error) {
                console.error("Error deleting variant:", error);
                if (error instanceof Error) {
                  toast("❌ Cannot delete variant", {
                    description: error.message,
                    duration: 4000,
                  });
                  // Stop the save process if we can't delete a variant
                  setIsSaving(false);
                  return;
                }
              }
            }
          }
        } else {
          // Create new item if no item_id exists
          item = await createItemMutation({
            name: selectedItem.name,
            brand_id: brandId,
            category_id: categoryId,
            description: itemDescription,
          });
        }
      } else {
        // Create new item if no item was selected
        item = await createItemMutation({
          name: itemSearch,
          brand_id: brandId,
          category_id: categoryId,
          description: itemDescription,
        });
      }

      // Process variants - both new and updates to existing ones
      for (const variant of variants) {
        if (!item.item_id) {
          throw new Error("Item ID is required");
        }

        if (variant.isExisting && variant.id) {
          // Update existing variant
          await updateVariantMutation({
            variantId: variant.id,
            name: variant.variant,
            lowStock: variant.lowStock,
            veryLowStock: variant.veryLowStock,
          });
        } else {
          // Create new variant
          const createdVariant = await createVariantMutation({
            item_id: item.item_id,
            name: variant.variant,
          });

          // Create stock level for the new variant
          await createStockLevelMutation({
            variant_id: createdVariant.variant_id,
            low_stock: variant.lowStock,
            very_low_stock: variant.veryLowStock,
          });

          // Create inventory record for the new variant
          await createInventoryMutation({
            variant_id: createdVariant.variant_id,
            quantity: 0,
            inventory_clerk: session.data?.user.id ?? "",
            inventory_number: Math.floor(1000000 + Math.random() * 9000000),
          });
        }
      }

      // Handle presets - both existing ones with new conversions and completely new ones
      // First handle deleted presets
      if (selectedItem?.item_id) {
        // Get the existing presets for the item
        const existingPresets = fetchedPresets || [];

        // Find presets that exist in the database but are not in the current presets list
        const presetsToDelete = existingPresets.filter(
          (existingPreset) =>
            !presets.some((p) => p.id === existingPreset.preset_id),
        );

        // Delete the removed presets
        for (const presetToDelete of presetsToDelete) {
          try {
            console.log("Attempting to delete preset:", presetToDelete);
            await deletePresetMutation({
              presetId: presetToDelete.preset_id,
              shouldMarkOnly: false,
            });
            console.log(
              "Successfully deleted preset:",
              presetToDelete.preset_id,
            );
          } catch (error) {
            console.error("Error deleting preset:", error);
            if (error instanceof Error) {
              toast("❌ Cannot delete preset", {
                description: error.message,
                duration: 4000,
              });
              // Stop the save process if we can't delete a preset
              setIsSaving(false);
              return;
            }
          }
        }

        // Handle modified presets (where conversions have been removed)
        for (const currentPreset of presets) {
          // Only process existing presets
          if (!currentPreset.isExisting) continue;

          // Find matching preset from fetched data
          const originalPreset = existingPresets.find(
            (p) => p.preset_id === currentPreset.id,
          );
          if (!originalPreset) continue;

          // Check for removed conversions
          const originalConversions = originalPreset.conversions || [];
          const currentConversions = currentPreset.conversions || [];

          // If the preset has fewer conversions now, some were removed
          if (originalConversions.length > currentConversions.length) {
            console.log(`Preset ${currentPreset.id} has removed conversions:`, {
              original: originalConversions.length,
              current: currentConversions.length,
            });

            // Build a map of current conversions by unit name for easier comparison
            const currentUnitMap = new Map();
            currentConversions.forEach((conv) => {
              if (conv.unit) currentUnitMap.set(conv.unit, true);
            });

            // Find removed conversions by checking which original units are missing
            for (const originalConv of originalConversions) {
              if (!originalConv.to_unit) continue;

              // If this unit is no longer in the current conversions, it was removed
              if (!currentUnitMap.has(originalConv.to_unit)) {
                console.log(
                  `Found removed conversion to unit: ${originalConv.to_unit}`,
                );

                try {
                  // Find the unit ID for the removed conversion
                  const unitToRemove = units.find(
                    (u) => u.name === originalConv.to_unit,
                  );
                  if (!unitToRemove) {
                    console.warn(
                      `Could not find unit ID for ${originalConv.to_unit}`,
                    );
                    continue;
                  }

                  // Call the removeConversionFromPreset mutation
                  await removeConversionFromPresetMutation({
                    presetId: currentPreset.id,
                    toUnitId: unitToRemove.unit_id,
                    itemId: selectedItem.item_id,
                  });

                  console.log(
                    `Successfully removed conversion to ${originalConv.to_unit}`,
                  );
                } catch (error) {
                  console.error(
                    `Error removing conversion to ${originalConv.to_unit}:`,
                    error,
                  );
                  if (error instanceof Error) {
                    toast("❌ Error removing conversion", {
                      description: error.message,
                      duration: 4000,
                    });
                    setIsSaving(false);
                    return;
                  }
                }
              }
            }
          }
        }

        // Process existing presets with updates
        for (const preset of presets) {
          if (preset.isExisting) {
            // Find the original preset data
            const originalPreset = fetchedPresets?.find(
              (p) => p.preset_id === preset.id,
            );
            if (!originalPreset) continue;

            // Check if any changes were made
            const isMainUnitChanged =
              preset.mainUnit !== originalPreset.main_unit;
            const isMainPriceChanged =
              (typeof preset.mainPrice === "string"
                ? parseFloat(preset.mainPrice)
                : preset.mainPrice) !== originalPreset.main_price;
            const conversionsChanged = preset.conversions.some(
              (conv, index) => {
                const originalConv = originalPreset.conversions[index];
                if (!originalConv) return true;
                return (
                  parseFloat(conv.qty) !== originalConv.conversion_rate ||
                  conv.unit !== originalConv.to_unit ||
                  (typeof conv.price === "string"
                    ? parseFloat(conv.price)
                    : conv.price) !== originalConv.related_price
                );
              },
            );

            if (isMainUnitChanged || isMainPriceChanged || conversionsChanged) {
              // Prepare conversions data
              const conversions = preset.conversions.map((conv, index) => {
                const originalConv = originalPreset.conversions[index];
                return {
                  conversionId: originalConv?.preset_conversion_id,
                  rate: parseFloat(conv.qty),
                  unit: conv.unit,
                  price:
                    typeof conv.price === "string"
                      ? parseFloat(conv.price)
                      : conv.price,
                };
              });

              // Call the updatePreset mutation
              await updatePresetMutation({
                presetId: preset.id,
                mainUnit: preset.mainUnit,
                mainPrice:
                  typeof preset.mainPrice === "string"
                    ? parseFloat(preset.mainPrice)
                    : preset.mainPrice,
                conversions,
              });
            }
          }
        }
      }

      // Handle new presets only - no updates
      const newPresets = presets.filter(
        (preset) =>
          !preset.isExisting &&
          preset.mainUnit &&
          preset.mainPrice &&
          preset.conversions.length > 0,
      );

      if (newPresets.length > 0) {
        console.log("Creating new presets:", newPresets);

        try {
          const results = await Promise.all(
            newPresets.map((preset) =>
              createPresetMutation({
                itemId: item.item_id,
                mainUnit: preset.mainUnit,
                mainPrice:
                  typeof preset.mainPrice === "string"
                    ? parseFloat(preset.mainPrice)
                    : preset.mainPrice,
                conversions: preset.conversions.map((conv) => ({
                  qty: parseFloat(conv.qty),
                  unit: conv.unit,
                  price: conv.price
                    ? typeof conv.price === "string"
                      ? parseFloat(conv.price)
                      : conv.price
                    : 0,
                })),
              }),
            ),
          );

          console.log("Created presets:", results);
        } catch (error) {
          console.error("Preset creation error:", error);
        }
      }

      utils.inventory.listInventory.invalidate();

      toast("✅ Success", {
        description: selectedItem?.item_id
          ? "Item updated successfully!"
          : "New item created successfully!",
        duration: 4000,
      });

      setTimeout(() => {
        router.push("/admin/inventory");
      }, 2000);
    } catch (error) {
      console.error("Error saving item:", error);
      toast("❌ Error", {
        description:
          error instanceof Error ? error.message : "Failed to save item",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add this utility function to the component to ensure consistent price formatting
  const formatPriceWithTwoDecimals = (
    price: number | string | null | undefined,
  ): string => {
    if (price === null || price === undefined || price === "") return "";

    // Convert to string first
    const priceStr = price.toString();

    // If it's already in decimal format
    if (priceStr.includes(".")) {
      const [whole, decimal = ""] = priceStr.split(".");
      return `${whole}.${decimal.padEnd(2, "0").slice(0, 2)}`;
    }

    // If it's just a whole number
    return `${priceStr}.00`;
  };

  // Fix hasDuplicateUnits function to handle undefined units properly
  const hasDuplicateUnits = (preset: PresetData): boolean => {
    // Get all non-empty units
    const allUnits = [
      preset.mainUnit,
      ...preset.conversions.map((conv) => conv.unit || ""),
    ].filter((unit) => unit !== ""); // Filter out empty strings

    // Check for duplicates by comparing array length with Set size
    return new Set(allUnits).size !== allUnits.length;
  };

  // This effect will scroll to the top when the page loads, preventing auto-scroll to the bottom
  useEffect(() => {
    // Scroll to top of the page on load
    window.scrollTo(0, 0);
  }, []);

  let content = null;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isError) {
    content = <p>Error loading units</p>;
  }

  return (
    <section className="flex min-h-screen w-full flex-col p-10">
      <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-2">
          <Dialog onOpenChange={setIsOpen} open={isOpen}>
            <DialogTrigger asChild>
              <ArrowLeft
                size={25}
                color="#FF7B7B"
                className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="max-h- flex w-full max-w-lg flex-col p-10">
              <DialogTitle className="text-center">Confirm</DialogTitle>
              <DialogHeader>
                <div className="flex w-full justify-center text-center text-xl">
                  <span>
                    You have unsaved changes. Are you sure you want to leave
                    this page?
                  </span>
                </div>
              </DialogHeader>

              <div className="flex w-full items-center justify-center gap-3">
                <Button
                  className="border-2 border-green bg-white p-6 text-lg font-bold text-green"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green p-6 text-lg font-bold text-white"
                  onClick={() => router.push("/admin/inventory")}
                >
                  Leave
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog onOpenChange={setIsDialogSaveOpen} open={isDialogSaveOpen}>
            <DialogContent className="flex max-h-screen w-full max-w-lg flex-col p-6">
              <DialogTitle className="text-center text-lg font-bold">
                Save Item
              </DialogTitle>
              <DialogHeader>
                <div className="flex w-full justify-center text-center text-lg">
                  <span>{dialogMessage}</span>
                </div>
              </DialogHeader>
              <div className="mt-4 flex w-full items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="border-gray-300 text-gray-700 border-2 bg-white p-3 hover:bg-green"
                  onClick={() => setIsDialogSaveOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <span className="font-bold">NEW ITEM</span>
          <span className="ml-3 text-sm font-light text-textGray">
            #{nextItemId}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-10 p-10">
          <div className="flex justify-between gap-3">
            <div className="w-full">
              <Label className="text-slate-500">
                Item <span className="text-rose-500">*</span>
              </Label>
              <div className="dropdown-area relative flex flex-col items-start gap-1">
                <Input
                  placeholder="Item"
                  value={itemSearch || item}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z ]*$/.test(value)) {
                      handleSearchItem(e);
                    }
                    console.log(`Item Search Updated: ${value}`);
                  }}
                  className="bg-slate-100 text-slate-700 placeholder-slate-300 shadow-none"
                  onFocus={() =>
                    setDropdownVisible((prev) => ({ ...prev, item: true }))
                  }
                  onBlur={handleItemBlur}
                  onKeyDown={(e) => handleKeyDown(e, "item")}
                />

                {dropdownVisible.item && filteredItems.length > 0 && (
                  <div
                    className="absolute left-0 top-full z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {filteredItems.map((itemName, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${
                          highlightedIndex === index ? "bg-emerald-200" : ""
                        }`}
                        onMouseDown={() => handleSelect("item", itemName)}
                      >
                        {itemName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full">
              <Label className="text-slate-500">
                Brand <span className="text-rose-500">*</span>
              </Label>
              <div className="dropdown-area relative flex flex-col items-start gap-1">
                <Input
                  placeholder="Brand"
                  value={brandSearch || brand}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z ]*$/.test(value)) {
                      handleSearchBrand(e);
                    }
                    console.log(`Brand Search Updated: ${value}`);
                  }}
                  className="bg-slate-100 text-slate-700 placeholder-slate-300 shadow-none"
                  onFocus={() =>
                    setDropdownVisible((prev) => ({ ...prev, brand: true }))
                  }
                  onBlur={handleBrandBlur}
                  onKeyDown={(e) => handleKeyDown(e, "brand")}
                />

                {dropdownVisible.brand && filteredBrands.length > 0 && (
                  <div
                    className="absolute left-0 top-full z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {filteredBrands.map((brandName, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${
                          highlightedIndex === index ? "bg-emerald-200" : ""
                        }`}
                        onMouseDown={() => handleSelect("brand", brandName)}
                      >
                        {brandName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full">
              <Label className="text-slate-500">
                Category <span className="text-rose-500">*</span>
              </Label>
              <div className="dropdown-area relative flex flex-col items-start gap-1">
                <Input
                  placeholder="Category"
                  value={categorySearch || category}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z ]*$/.test(value)) {
                      handleSearchCategory(e);
                    }
                    console.log(`Category Search Updated: ${value}`);
                  }}
                  className="bg-slate-100 text-slate-700 placeholder-slate-300 shadow-none"
                  onFocus={() =>
                    setDropdownVisible((prev) => ({ ...prev, category: true }))
                  }
                  onBlur={handleCategoryBlur}
                  onKeyDown={(e) => handleKeyDown(e, "category")}
                />

                {dropdownVisible.category && filteredCategories.length > 0 && (
                  <div
                    className="absolute left-0 top-full z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {filteredCategories.map((categoryName, index) => (
                      <div
                        key={categoryName}
                        className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${
                          highlightedIndex === index ? "bg-emerald-200" : ""
                        }`}
                        onMouseDown={() =>
                          handleSelect("category", categoryName)
                        }
                      >
                        {categoryName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <Textarea
              className="bg-slate-100 text-slate-700 placeholder-slate-300 shadow-none"
              placeholder="Item Description"
              rows={5}
              value={itemDescription}
              onChange={(e) => {
                setItemDescription(e.target.value);
                console.log(`Item Description Updated: ${e.target.value}`);
              }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-slate-500">
              Variants <span className="text-rose-500">*</span>
            </Label>

            <div className="grid grid-cols-3 gap-4">
              {variants.map((variant, index) => (
                <Variant
                  key={variant.id}
                  onRemove={() => handleRemoveVariant(variant.id)}
                  isOnlyVariant={variants.length === 1}
                  value={{
                    variant: variant.variant,
                    lowStock: variant.lowStock,
                    veryLowStock: variant.veryLowStock,
                  }}
                  onChange={(value) => {
                    const newVariants = [...variants];
                    newVariants[index] = {
                      id: variant.id,
                      isExisting: variant.isExisting,
                      hasBatchVariant: variant.hasBatchVariant,
                      ...value,
                    };
                    setVariants(newVariants);
                  }}
                  hasBatchVariant={variant.hasBatchVariant}
                />
              ))}
              <Button
                className="h-full min-h-48 rounded-lg border-4 border-dashed bg-slate-100/50 p-3 text-slate-400 hover:bg-slate-100"
                onClick={handleAddVariant}
              >
                + Add a Variant
              </Button>
            </div>

            <div className="mt-8">
              <Label className="text-slate-500">
                Preset Conversions <span className="text-rose-500">*</span>
              </Label>

              <div className="mt-2 grid grid-cols-3 gap-4">
                {presets.map((preset) => (
                  <ConversionCard
                    key={preset.id}
                    preset={preset}
                    onUpdate={(updatedPreset) => {
                      // Force cast to ensure TypeScript understands both types are compatible
                      setPresets(
                        presets.map((p) =>
                          p.id === preset.id
                            ? (updatedPreset as unknown as PresetData)
                            : p,
                        ),
                      );
                    }}
                    onRemove={
                      presets.length > 1
                        ? () =>
                            setPresets(
                              presets.filter((p) => p.id !== preset.id),
                            )
                        : undefined
                    }
                  />
                ))}
                {conversions.length < 9 && (
                  <Button
                    className="h-96 rounded-lg border-4 border-dashed bg-slate-100/50 p-3 text-slate-400 hover:bg-slate-100"
                    onClick={() =>
                      setPresets([
                        ...presets,
                        {
                          id: Date.now(),
                          mainUnit: "",
                          mainPrice: "",
                          isExisting: false,
                          conversions: [],
                        },
                      ])
                    }
                  >
                    + Add a Preset
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <Separator className="h-px" />
      <div className="flex w-full items-center justify-end gap-4 bg-white pt-4">
        <Button
          size={"lg"}
          className="bg-green text-white hover:bg-green/80"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Item"}
        </Button>
      </div>

      <Toaster
        toastOptions={{
          style: {
            width: "500px",
            padding: "12px",
            color: "#475569",
            fontSize: "16px",
            bottom: "80px",
            right: "12px",
            background: "white",
            border: "1px solid #E5E7EB",
            boxShadow: "none",
          },
        }}
      />
    </section>
  );
};

export default NewItem;
