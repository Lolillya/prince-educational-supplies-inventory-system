"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog-transparent";
import { Label } from "~/components/ui/label";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ItemType {
  name: string;
  brand: BrandType;
  category: CategoryType;
  description?: string | null;
  variants: any[];
}

interface BrandType {
  name: string;
  brand_id: number;
  created_at: Date;
  updated_at: Date;
}

interface CategoryType {
  name: string;
  category_id: number;
  created_at: Date;
  updated_at: Date;
}

interface CardType {
  id: undefined;
  tempId?: number;
  variant: string;
  lowStock: number;
  veryLowStock: number;
  isExisting: boolean;
}

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

  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<BrandType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState([]);

  const {
    data: nextItemId,
    isLoading: isLoadingItem,
    isError: isErrorItem,
  } = api.inventory.getItemId.useQuery();

  const {
    data: data,
    isLoading,
    isError,
  } = api.inventory.listAllData.useQuery();
  const {
    mutateAsync: createItem,
  } = api.inventory.createItem.useMutation();
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
  const {
    mutateAsync: editItemMutation,
  } = api.inventory.editItem.useMutation();

  // const [cards, setCards] = useState([{ id: Date.now() }]);
  // const [cards, setCards] = useState([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0 }]);
  const [cards, setCards] = useState<CardType[]>([
    {
      id: undefined,
      variant: "",
      lowStock: 0,
      veryLowStock: 0,
      isExisting: false,
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const [lowStock, setLowStock] = useState(0);
  const [veryLowStock, setVeryLowStock] = useState(0);

  // Memoized states
  const brands = useMemo(() => data?.brands ?? [], [data]);
  const categories = useMemo(() => data?.categories ?? [], [data]);
  const units = useMemo(() => data?.units ?? [], [data]);
  const items = useMemo(() => data?.items ?? [], [data]);
  const variants = useMemo(() => data?.variants ?? [], [data]);

  // In EditItem component
  const { data: existingItemData, isLoading: isLoadingExisting } =
    api.inventory.getInventoryItem.useQuery(
      { id: itemIdAsNumber },
      { enabled: !!itemId },
    );

  useEffect(() => {
    if (existingItemData?.variant?.item) {
      const item = existingItemData.variant.item;

      // Use optional chaining and null coalescing
      setItem(item.name ?? "");
      setBrand(item.brand?.name ?? "");
      setCategory(item.category?.name ?? "");
      setItemDescription(item.description ?? "");

      // Set selected items
      setSelectedItem(item);
      setSelectedBrand(item.brand ?? null);
      setSelectedCategory(item.category ?? null);

      // Set variants
      const variants = (item.variants || []).map((v) => ({
        id: undefined,
        variant: v.name || "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: true
      }));

      setCards(
        variants.length > 0
          ? variants
          : [
            {
              id: undefined,
              variant: "",
              lowStock: 0,
              veryLowStock: 0,
              isExisting: false
            },
          ],
      );
    }
  }, [existingItemData]);

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
    if (data?.items) setItemOptions(data.items.map((item) => item.name));
    if (data?.categories)
      setCategoryOptions(data.categories.map((category) => category.name));
    if (data?.brands) setBrandOptions(data.brands.map((brand) => brand.name));
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
        const variants = matchingItem.variants.map((v) => ({
          id: undefined,
          variant: v.name,
          lowStock: v.StockLevel?.low_stock || 0,
          veryLowStock: v.StockLevel?.very_low_stock || 0,
          isExisting: true,
        }));
        setCards(
          variants.length > 0
            ? variants
            : [
              {
                id: undefined,
                variant: "",
                lowStock: 0,
                veryLowStock: 0,
                isExisting: false,
              },
            ],
        );
      } else {
        setCards([
          {
            id: undefined,
            variant: "",
            lowStock: 0,
            veryLowStock: 0,
            isExisting: false,
          },
        ]);
      }
    } else {
      setCards([
        {
          id: undefined,
          variant: "",
          lowStock: 0,
          veryLowStock: 0,
          isExisting: false,
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
  ]);
  const handleSelect = (type: string, name: string) => {
    switch (type) {
      case "item":
        if (itemOptions.includes(name)) {
          setItem(name);
        }
        const selectedItem = items.find((item) => item.name === name);
        if (selectedItem) {
          setSelectedItem(selectedItem); // Set the full object
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

    if (value === "" && !itemOptions.includes(value)) {
      setItem(value);
    }
  };

  const handleSearchBrand = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBrandSearch(value);

    if (value === "" && !brandOptions.includes(value)) {
      setBrand(value);
    }
  };

  const handleSearchCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategorySearch(value);

    if (value === "" && !categoryOptions.includes(value)) {
      setCategory(value);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: string,
  ) => {
    let filteredOptions = [];
    let setHighlightedIndexFn = (index: number | ((prev: number) => number)) => { };

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

  // const handleAddCard = () => {
  //     setCards([...cards, { id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0 }]);
  // }
  const handleAddCard = () => {
    setCards([
      ...cards,
      {
        tempId: Date.now(),
        id: undefined,
        variant: "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: false,
      },
    ]);
  };

  const handleDeleteCard = (tempId: number) => {
    setCards(cards.filter((card) => card.tempId !== tempId));
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
    setCards([
      {
        id: undefined,
        variant: "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: false,
      },
    ]);
    setIsDialogCancelOpen(false);
  };

  const handleCancelClear = () => {
    setIsDialogCancelOpen(false);
  };

  const { mutateAsync: updateVariantMutation } =
    api.inventory.updateVariant.useMutation();

  const handleSave = async () => {
    const hasAtLeastOneVariant = cards.some(
      (card) => card.variant.trim() !== "",
    );

    if (!hasAtLeastOneVariant) {
      setDialogMessage("Please fill out at least one variant row.");
      setIsDialogSaveOpen(true);
      return;
    }

    // Collect all validation errors
    const errors = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card) continue;

      if (card.variant.trim() !== "") {
        if (!card.lowStock || card.lowStock <= 0) {
          errors.push(
            `Low Stock value for variant "${card.variant}" must be greater than 0.`,
          );
        }
        if (!card.veryLowStock || card.veryLowStock <= 0) {
          errors.push(
            `Very Low Stock value for variant "${card.variant}" must be greater than 0.`,
          );
        }
      } else if (card.lowStock !== 0 || card.veryLowStock !== 0) {
        errors.push(
          `Variant row ${i + 1} has stock values but no variant name. Fill out the variant name or clear the stock values.`,
        );
      }
    }

    if (errors.length > 0) {
      setDialogMessage(errors.join("\n"));
      setIsDialogSaveOpen(true);
      return;
    }

    if (
      (!itemSearch && !selectedItem) ||
      (!brandSearch && !selectedBrand) ||
      (!categorySearch && !selectedCategory) ||
      !itemDescription
    ) {
      setDialogMessage("Please fill out all required fields.");
      setIsDialogSaveOpen(true);
      return;
    }

    setIsSaving(true);

    try {
      // Include ALL variants in the payload, not just new ones
      const validCards = cards.map(({ tempId, ...rest }) => rest);

      const payload = {
        inventoryId: itemIdAsNumber,
        name: itemSearch || item,
        brand: brandSearch || brand,
        category: categorySearch || category,
        description: itemDescription,
        inventoryClerk: session.data?.user.id ?? "",
        variants: validCards.map((card) => ({
          id: card.id || undefined, // Undefined for new variants
          name: card.variant,
          lowStock: card.lowStock,
          veryLowStock: card.veryLowStock,
        })),
      };

      const response = await editItemMutation(payload);

      setDialogMessage("Item updated successfully!");
      setIsDialogSaveOpen(true);

      utils.inventory.listInventory.invalidate();
      setTimeout(() => {
        router.push("/admin/inventory");
      }, 2000);
    } catch (error) {
      console.error("Error saving item:", error);
      setDialogMessage("Failed to update item.");
      setIsDialogSaveOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  let content = null;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isError) {
    content = <p>Error loading units</p>;
  }

  return (
    <section className="flex w-full flex-col gap-3 p-10">
      <div className="border-b-100 relative flex items-center justify-between border-b p-3">
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
            #{itemId}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-10 p-10">
        <div className="flex justify-between gap-3">
          <div className="w-full">
            <Label className="text-textGray">Item *</Label>
            <div className="relative flex flex-col items-start gap-1">
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
                className="bg-white text-black placeholder-slate-500"
                onFocus={() =>
                  setDropdownVisible((prev) => ({ ...prev, item: true }))
                }
                onBlur={() =>
                  setDropdownVisible((prev) => ({ ...prev, item: false }))
                }
                onKeyDown={(e) => handleKeyDown(e, "item")}
              />
              {dropdownVisible && filteredItems.length > 0 && (
                <div
                  className="absolute left-0 top-full z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {filteredItems.map((itemName, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${highlightedIndex === index ? "bg-emerald-200" : ""}`}
                      onMouseDown={() => handleSelect("item", itemName)}
                    >
                      {itemName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditItem;