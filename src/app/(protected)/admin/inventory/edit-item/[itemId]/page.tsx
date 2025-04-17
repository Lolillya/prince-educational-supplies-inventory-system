"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
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
import Variant from "../../_components/variant";
import Conversion from "../../_components/conversion";
import { ScrollArea } from "~/components/ui/scroll-area";
import ConversionCard from "../../_components/conversion-card";
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
  hasInventory: boolean;
  quantity: number;
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

// Type for the item
type ItemType = {
  item_id: number;
  name: string;
  brand: {
    brand_id: number;
    name: string;
  };
  category: {
    category_id: number;
    name: string;
  };
  description: string | null;
  variants: Array<{
    variant_id: number;
    name: string;
    StockLevel?: {
      low_stock: number;
      very_low_stock: number;
    } | null;
  }>;
};

const EditItem = () => {
  const router = useRouter();
  const utils = api.useUtils();
  const session = useSession();
  const { itemId } = useParams();
  const itemIdAsNumber = Number(itemId);

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

  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
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

  // Update variants state with proper type
  const [variants, setVariants] = useState<VariantData[]>([
    {
      id: Date.now(),
      variant: "",
      lowStock: 0,
      veryLowStock: 0,
      isExisting: false,
      hasBatchVariant: false,
      hasInventory: false,
      quantity: 0,
    },
  ]);

  const [conversions, setConversions] = useState([{ id: Date.now() }]);
  const [isSaving, setIsSaving] = useState(false);
  const [lowStock, setLowStock] = useState(0);
  const [veryLowStock, setVeryLowStock] = useState(0);

  // Fetch necessary data
  const { data, isLoading, isError } = api.inventory.listAllData.useQuery();
  const { data: inventoryData } = api.inventory.listInventory.useQuery();

  // Fetch the item to edit
  const { data: existingItemData, isLoading: isLoadingExisting } =
    api.inventory.getInventoryItem.useQuery(
      { id: itemIdAsNumber },
      { enabled: !!itemId },
    );

  // Fetch presets for the selected item if there's an item ID
  const { data: fetchedPresets, isLoading: isLoadingPresets } =
    api.inventory.getPresetsByItemId.useQuery(
      { itemId: selectedItemId! },
      {
        enabled: !!selectedItemId, // Only run the query if we have an itemId
      },
    );

  // Use mutations for CRUD operations
  const { mutateAsync: createItem } = api.inventory.createItem.useMutation();
  const { mutateAsync: createPresetMutation } =
    api.inventory.createPreset.useMutation();
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
  const { mutateAsync: updateVariantMutation } =
    api.inventory.updateVariant.useMutation();
  const { mutateAsync: deleteVariantMutation } =
    api.inventory.deleteVariant.useMutation();
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
  const { mutateAsync: updatePresetMutation } =
    api.inventory.updatePresetChain.useMutation({
      onSuccess: () => {
        utils.inventory.getPresetsByItemId.invalidate();
      },
    });
  const { mutateAsync: updateBrandMutation } =
    api.inventory.updateBrand.useMutation({
      onSuccess: () => {
        utils.inventory.listAllData.invalidate();
      },
    });

  const { mutateAsync: updateCategoryMutation } =
    api.inventory.updateCategory.useMutation({
      onSuccess: () => {
        utils.inventory.listAllData.invalidate();
      },
    });

  // Memoized states
  const brands = useMemo(() => data?.brands ?? [], [data]);
  const categories = useMemo(() => data?.categories ?? [], [data]);
  const units = useMemo(() => data?.units ?? [], [data]);
  const items = useMemo(() => data?.items ?? [], [data]);
  const variantsMemo = useMemo(() => data?.variants ?? [], [data]);

  // Format price input helper
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

  // Load initial data from the existing item
  useEffect(() => {
    if (existingItemData && !isLoadingExisting) {
      const item = existingItemData.variant.item;

      // Set the item data and do not show dropdowns for these values
      setItem(item.name || "");
      setItemSearch(""); // Empty search to avoid dropdown
      setBrand(item.brand?.name || "");
      setBrandSearch(""); // Empty search to avoid dropdown
      setCategory(item.category?.name || "");
      setCategorySearch(""); // Empty search to avoid dropdown
      setItemDescription(item.description || "");

      // Set selected item ID for preset fetching
      setSelectedItemId(item.item_id);

      // Set selected items
      setSelectedItem(item);
      setSelectedBrand(item.brand || null);
      setSelectedCategory(item.category || null);

      // Map the variants - fix StockLevel fetching
      const itemVariants = item.variants || [];
      const mappedVariants = itemVariants.map((v) => {
        // Find the full variant data with StockLevel from the data fetched by listAllData
        const fullVariantData = data?.variants?.find(
          (variant) => variant.variant_id === v.variant_id,
        );

        // Find if this variant has inventory (quantity > 0)
        const inventoryItem = inventoryData?.find(
          (inv) => inv.variant_id === v.variant_id,
        );
        const hasInventory = (inventoryItem?.quantity || 0) > 0;

        return {
          id: v.variant_id,
          variant: v.name || "",
          // Use StockLevel from the full variant data if available
          lowStock: fullVariantData?.StockLevel?.low_stock || 0,
          veryLowStock: fullVariantData?.StockLevel?.very_low_stock || 0,
          isExisting: true,
          hasBatchVariant: false, // This will be set below if needed
          hasInventory: hasInventory, // Add inventory status
          quantity: inventoryItem?.quantity || 0, // Store the actual quantity
        };
      });

      // Check which variants have batch variants
      if (existingItemData.variant.BatchVariant) {
        for (const mappedVariant of mappedVariants) {
          // Check if this variant has any batch variants
          const hasBatch = existingItemData.variant.BatchVariant.some(
            (bv) => bv.variant_id === mappedVariant.id,
          );
          mappedVariant.hasBatchVariant = hasBatch;
        }
      }

      // Set the variants
      setVariants(
        mappedVariants.length > 0
          ? mappedVariants
          : [
              {
                id: Date.now(),
                variant: "",
                lowStock: 0,
                veryLowStock: 0,
                isExisting: false,
                hasBatchVariant: false,
                hasInventory: false,
                quantity: 0,
              },
            ],
      );
    }
  }, [existingItemData, isLoadingExisting, data?.variants, inventoryData]);

  // Handle presets data loading
  useEffect(() => {
    if (fetchedPresets && !isLoadingPresets && fetchedPresets.length > 0) {
      // Map the presets to the format expected by the UI
      const mappedPresets = fetchedPresets.map((preset) => {
        return {
          id: preset.preset_id,
          mainUnit: preset.main_unit,
          mainPrice: preset.main_price.toString(),
          isExisting: true,
          conversions: preset.conversions.map((conv) => ({
            qty: conv.conversion_rate.toString(),
            unit: conv.to_unit,
            price: conv.related_price?.toString() || "",
          })),
        };
      });

      setPresets(mappedPresets);
    } else if (fetchedPresets && fetchedPresets.length === 0) {
      // If there are no presets, set the default empty preset
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
  }, [fetchedPresets, isLoadingPresets]);

  // Populate dropdowns data
  useEffect(() => {
    if (data?.items) setItemOptions(data.items.map((item) => item.name));
    if (data?.categories)
      setCategoryOptions(data.categories.map((category) => category.name));
    if (data?.brands) setBrandOptions(data.brands.map((brand) => brand.name));
  }, [data]);

  // Filter items dropdown based on search
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

  // Filter brands dropdown based on search
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

  // Filter categories dropdown based on search
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

  // Update item data when item selection changes
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

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-area")) {
        setDropdownVisible({
          item: false,
          brand: false,
          category: false,
          variant: false,
        });
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Handle dropdown selection
  const handleSelect = (type: string, name: string) => {
    switch (type) {
      case "item":
        setItem(name);
        setItemSearch("");
        setDropdownVisible((prev) => ({ ...prev, item: false }));

        const selectedItem = items.find((item) => item.name === name);
        if (selectedItem) {
          setSelectedItem(selectedItem);
          setItemDescription(selectedItem.description || "");
          console.log("Selected Item:", selectedItem);
        }
        break;
      case "category":
        setCategory(name);
        setCategorySearch("");
        setDropdownVisible((prev) => ({ ...prev, category: false }));

        const selectedCategory = categories.find((cat) => cat.name === name);
        if (selectedCategory) {
          setSelectedCategory(selectedCategory);
          console.log("Selected Category:", selectedCategory);
        }
        break;
      case "brand":
        setBrand(name);
        setBrandSearch("");
        setDropdownVisible((prev) => ({ ...prev, brand: false }));

        const selectedBrand = brands.find((brand) => brand.name === name);
        if (selectedBrand) {
          setSelectedBrand(selectedBrand);
          setBrandSearch("");
          console.log("Selected Brand:", selectedBrand);
        }
        break;
      default:
        console.log(`Unhandled selection type: ${type}`);
    }
  };

  // Handle search input changes
  const handleSearchItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // When editing an existing item, just update the item name directly
    if (selectedItem?.item_id) {
      setItem(value);
    } else {
      // When creating a new item, use the dropdown search functionality
      setItemSearch(value);
      setItem(value);
    }
  };

  const handleSearchBrand = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrandSearch(e.target.value);
    setBrand(e.target.value);
  };

  const handleSearchCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategorySearch(e.target.value);
    setCategory(e.target.value);
  };

  // Handle keyboard navigation in dropdowns
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: string,
  ) => {
    let filteredOptions: string[] = [];
    let setHighlightedIndexFn = (index: number) => {};

    if (field === "item") {
      filteredOptions = filteredItems;
      setHighlightedIndexFn = setHighlightedIndex;
    } else if (field === "brand") {
      filteredOptions = filteredBrands;
      setHighlightedIndexFn = setHighlightedIndex;
    } else if (field === "category") {
      filteredOptions = filteredCategories;
      setHighlightedIndexFn = setHighlightedIndex;
    }

    if (e.key === "ArrowDown") {
      setHighlightedIndexFn(
        highlightedIndex < filteredOptions.length - 1
          ? highlightedIndex + 1
          : highlightedIndex,
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndexFn(
        highlightedIndex > 0 ? highlightedIndex - 1 : highlightedIndex,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      const selectedOption = filteredOptions[highlightedIndex];
      if (selectedOption) {
        handleSelect(field, selectedOption);
      }
    }
  };

  // Handle adding a new variant card
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: Date.now(),
        variant: "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: false,
        hasBatchVariant: false,
        hasInventory: false,
        quantity: 0,
      },
    ]);
  };

  // Handle removing a variant card
  const handleRemoveVariant = (id: number) => {
    // Find the variant to check if it has inventory
    const variantToRemove = variants.find((v) => v.id === id);

    // Prevent removing variants with existing inventory
    if (variantToRemove?.hasInventory) {
      toast("❌ Cannot remove variant", {
        description:
          "This variant has inventory and cannot be removed. Set the quantity to 0 first.",
        duration: 4000,
      });
      return;
    }

    // Prevent removing variants with batch variants
    if (variantToRemove?.hasBatchVariant) {
      toast("❌ Cannot remove variant", {
        description: "This variant has batch records and cannot be removed.",
        duration: 4000,
      });
      return;
    }

    setVariants(variants.filter((v) => v.id !== id));
  };

  // Handle adding a conversion
  const handleAddConversion = () => {
    setConversions([...conversions, { id: Date.now() }]);
  };

  // Handle removing a conversion
  const handleRemoveConversion = (id: number) => {
    setConversions(conversions.filter((c) => c.id !== id));
  };

  // Handle deleting a card
  const handleDeleteCard = (id: number) => {
    setPresets(presets.filter((preset) => preset.id !== id));
  };

  // Clear the form
  const clear = () => {
    setIsDialogCancelOpen(true);
  };

  // Handle confirming clear
  const handleConfirmClear = () => {
    setIsDialogCancelOpen(false);
    setItemSearch("");
    setItem("");
    setCategorySearch("");
    setCategory("");
    setBrandSearch("");
    setBrand("");
    setItemDescription("");
    setSelectedItem(null);
    setSelectedBrand(null);
    setSelectedCategory(null);
    setVariants([
      {
        id: Date.now(),
        variant: "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: false,
        hasBatchVariant: false,
        hasInventory: false,
        quantity: 0,
      },
    ]);
    setPresets([
      {
        id: Date.now(),
        mainUnit: "",
        mainPrice: "",
        isExisting: false,
        conversions: [],
      },
    ]);
  };

  // Handle canceling clear
  const handleCancelClear = () => {
    setIsDialogCancelOpen(false);
  };

  // Check if two presets are identical
  const arePresetsIdentical = (
    preset1: PresetData,
    preset2: PresetData,
  ): boolean => {
    // Check if main units and prices are the same
    if (
      preset1.mainUnit !== preset2.mainUnit ||
      preset1.mainPrice !== preset2.mainPrice
    ) {
      return false;
    }

    // Check if conversion counts match
    if (preset1.conversions.length !== preset2.conversions.length) {
      return false;
    }

    // Check each conversion
    for (let i = 0; i < preset1.conversions.length; i++) {
      const conv1 = preset1.conversions[i];
      const conv2 = preset2.conversions[i];

      // Skip if either conversion doesn't exist
      if (!conv1 || !conv2) continue;

      // Check if quantities, units, and prices match
      if (
        conv1.qty !== conv2.qty ||
        conv1.unit !== conv2.unit ||
        conv1.price !== conv2.price
      ) {
        return false;
      }
    }

    return true;
  };

  // Format price with two decimal places
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

  // Check for duplicate units in a preset
  const hasDuplicateUnits = (preset: PresetData): boolean => {
    // Get all non-empty units
    const allUnits = [
      preset.mainUnit,
      ...preset.conversions.map((conv) => conv.unit || ""),
    ].filter((unit) => unit !== ""); // Filter out empty strings

    // Check for duplicates by comparing array length with Set size
    return new Set(allUnits).size !== allUnits.length;
  };

  // Handle saving the item
  const handleSave = async () => {
    if (!item || !brand || !category) {
      toast("❌ Missing input", {
        description: "Please fill out the item, brand, and category fields",
        duration: 4000,
      });
      return;
    }

    // Check if user is trying to save with duplicate variants
    const uniqueVariantNames = new Set(
      variants
        .filter((v) => v.variant.trim() !== "")
        .map((v) => v.variant.trim().toLowerCase()),
    );

    if (
      uniqueVariantNames.size !==
      variants.filter((v) => v.variant.trim() !== "").length
    ) {
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

    // Validate preset conversions
    if (presets.length > 0 && presets.some((p) => p.mainUnit)) {
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

      // 3. Check for invalid conversions
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

      // 4. Check for invalid units
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

      // Check for duplicate units in presets
      const hasDuplicates = presets.some((preset) => hasDuplicateUnits(preset));

      if (hasDuplicates) {
        toast("❌ Duplicate units", {
          description: "Each unit in a preset must be unique",
          duration: 4000,
        });
        return;
      }
    }

    setIsSaving(true);

    try {
      // 1. Handle brand - update existing brand or create new
      let brandId;
      if (selectedBrand) {
        // If we have a selected brand, update its name instead of creating a new one
        await updateBrandMutation({
          brand_id: selectedBrand.brand_id,
          name: brand,
        });
        brandId = selectedBrand.brand_id;
      } else {
        // Create new brand if no existing brand is selected
        brandId = await createBrandMutation({ name: brand }).then(
          (res) => res.brand_id,
        );
      }

      // 2. Handle category - update existing category or create new
      let categoryId;
      if (selectedCategory) {
        // If we have a selected category, update its name instead of creating a new one
        await updateCategoryMutation({
          category_id: selectedCategory.category_id,
          name: category,
        });
        categoryId = selectedCategory.category_id;
      } else {
        // Create new category if no existing category is selected
        categoryId = await createCategoryMutation({ name: category }).then(
          (res) => res.category_id,
        );
      }

      // 3. Update the existing item with new data
      let updatedItem;
      if (selectedItem?.item_id) {
        // Update the existing item
        updatedItem = await updateItemMutation({
          item_id: selectedItem.item_id,
          description: itemDescription,
          brand_id: brandId,
          category_id: categoryId,
          name: item,
        });

        console.log("Updated existing item:", updatedItem);

        // Handle deleted variants - if we have an existing item, delete any variants that were removed
        // Get the existing variants for the item
        const existingVariants =
          existingItemData?.variant?.item?.variants || [];

        // Find variants that exist in the database but are not in the current variants list
        const variantsToDelete = existingVariants.filter(
          (existingVariant) =>
            !variants.some((v) => v.id === existingVariant.variant_id),
        );

        // Delete the removed variants
        for (const variantToDelete of variantsToDelete) {
          try {
            if (!variantToDelete.variant_id) continue;

            // Check if this variant has inventory
            const inventoryItem = inventoryData?.find(
              (inv) => inv.variant_id === variantToDelete.variant_id,
            );

            if (inventoryItem && inventoryItem.quantity > 0) {
              toast("❌ Cannot delete variant", {
                description: `Variant "${variantToDelete.name}" has inventory quantity of ${inventoryItem.quantity} and cannot be deleted.`,
                duration: 4000,
              });
              // Stop the save process
              setIsSaving(false);
              return;
            }

            // Check if this variant has batch variants
            const hasBatchVariants =
              existingItemData?.variant?.BatchVariant?.some(
                (bv) => bv.variant_id === variantToDelete.variant_id,
              );

            if (hasBatchVariants) {
              toast("❌ Cannot delete variant", {
                description: `Variant "${variantToDelete.name}" has batch records and cannot be deleted.`,
                duration: 4000,
              });
              // Stop the save process
              setIsSaving(false);
              return;
            }

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
      } else {
        throw new Error("Item ID is required for updating");
      }

      // 4. Process variants - both new and updates to existing ones
      for (const variant of variants) {
        if (!selectedItem?.item_id) {
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
        } else if (variant.variant.trim() !== "") {
          // Create new variant
          const createdVariant = await createVariantMutation({
            item_id: selectedItem.item_id,
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

      // 5. Handle presets - update existing, delete removed, add new
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

          // Update the preset if it has changed
          // Find the original preset data
          if (!originalPreset) continue;

          // Check if any changes were made
          const isMainUnitChanged =
            currentPreset.mainUnit !== originalPreset.main_unit;
          const isMainPriceChanged =
            (typeof currentPreset.mainPrice === "string"
              ? parseFloat(currentPreset.mainPrice)
              : currentPreset.mainPrice) !== originalPreset.main_price;
          const conversionsChanged = currentPreset.conversions.some(
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
            const conversions = currentPreset.conversions.map((conv, index) => {
              const originalConv = originalPreset.conversions[index];

              // Convert the price - if it's undefined or empty, default to 0
              let price = 0;
              if (conv.price !== undefined && conv.price !== "") {
                price =
                  typeof conv.price === "string"
                    ? parseFloat(conv.price)
                    : conv.price;
              }

              return {
                conversionId: originalConv?.preset_conversion_id,
                rate: parseFloat(conv.qty),
                unit: conv.unit,
                price: price,
              };
            });

            // Call the updatePreset mutation
            await updatePresetMutation({
              presetId: currentPreset.id,
              mainUnit: currentPreset.mainUnit,
              mainPrice:
                typeof currentPreset.mainPrice === "string"
                  ? parseFloat(currentPreset.mainPrice)
                  : currentPreset.mainPrice,
              conversions,
            });
          }
        }
      }

      // Handle new presets
      const newPresets = presets.filter(
        (preset) =>
          !preset.isExisting &&
          preset.mainUnit &&
          preset.mainPrice &&
          preset.conversions.length > 0,
      );

      if (newPresets.length > 0 && selectedItem?.item_id) {
        console.log("Creating new presets:", newPresets);

        try {
          const results = await Promise.all(
            newPresets.map((preset) =>
              createPresetMutation({
                itemId: selectedItem.item_id,
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

      // Refresh the data
      utils.inventory.listInventory.invalidate();

      toast("✅ Success", {
        description: "Item updated successfully!",
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

  // This effect will scroll to the top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Loading state
  let content = null;
  if (isLoading || isLoadingExisting) {
    content = <p>Loading...</p>;
  } else if (isError) {
    content = <p>Error loading data</p>;
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
          <span className="font-bold">EDIT ITEM</span>
          <span className="ml-3 text-sm font-light text-textGray">
            #{existingItemData?.inventory_number}
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
                  onBlur={() => {
                    setTimeout(() => {
                      setDropdownVisible((prev) => ({ ...prev, item: false }));
                    }, 200);
                  }}
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
                  onBlur={() => {
                    setTimeout(() => {
                      setDropdownVisible((prev) => ({ ...prev, brand: false }));
                    }, 200);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "brand")}
                  disabled={false}
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
                  onBlur={() => {
                    setTimeout(() => {
                      setDropdownVisible((prev) => ({
                        ...prev,
                        category: false,
                      }));
                    }, 200);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "category")}
                  disabled={false}
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
                      hasInventory: variant.hasInventory,
                      quantity: variant.quantity,
                      ...value,
                    };
                    setVariants(newVariants);
                  }}
                  hasBatchVariant={variant.hasBatchVariant}
                  disableRemove={
                    variant.hasInventory || variant.hasBatchVariant
                  }
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

export default EditItem;
