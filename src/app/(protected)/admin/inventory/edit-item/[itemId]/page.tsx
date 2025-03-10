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

type Item = {
  variant: {
    item: {
      name: string;
      brand: {
        name: string;
      };
    };
    name?: string;
  };
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

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
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
    Loading,
    Error,
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
  const { mutateAsync: updateItemMutation } =
    api.inventory.updateItem.useMutation();

  // const [cards, setCards] = useState([{ id: Date.now() }]);
  // const [cards, setCards] = useState([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0 }]);
  const [cards, setCards] = useState([
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
        id: v.variant_id,
        variant: v.name || "",
        lowStock: v.StockLevel?.low_stock || 0,
        veryLowStock: v.StockLevel?.very_low_stock || 0,
      }));

      setCards(
        variants.length > 0
          ? variants
          : [
              {
                id: Date.now(),
                variant: "",
                lowStock: 0,
                veryLowStock: 0,
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
          id: v.variant_id,
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
                  id: Date.now(),
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
            id: Date.now(),
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
          id: Date.now(),
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
    let setHighlightedIndexFn = (index: number) => {};

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
      handleSelect(field, filteredOptions[highlightedIndex]);
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

  const handleDeleteCard = (tempId) => {
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
        id: Date.now(),
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
  const {
    mutateAsync: editItemMutation,
    isEditLoading,
    isEditError,
    isEditing,
  } = api.inventory.editItem.useMutation();

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

      if (response.error) {
        throw new Error(response.error.message);
      }

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
            <Label className="text-textGray">Brand *</Label>
            <div className="relative flex flex-col items-start gap-1">
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
                className="bg-white text-black placeholder-slate-500"
                onFocus={() =>
                  setDropdownVisible((prev) => ({ ...prev, brand: true }))
                }
                onBlur={() =>
                  setDropdownVisible((prev) => ({ ...prev, brand: false }))
                }
                onKeyDown={(e) => handleKeyDown(e, "brand")}
              />

              {dropdownVisible && filteredBrands.length > 0 && (
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
            <Label className="text-textGray">Category</Label>
            <div className="relative flex flex-col items-start gap-1">
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
                className="bg-white text-black placeholder-slate-500"
                onFocus={() =>
                  setDropdownVisible((prev) => ({ ...prev, category: true }))
                }
                onBlur={() =>
                  setDropdownVisible((prev) => ({ ...prev, category: false }))
                }
                onKeyDown={(e) => handleKeyDown(e, "category")}
              />

              {dropdownVisible && filteredCategories.length > 0 && (
                <div
                  className="absolute left-0 top-full z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {filteredCategories.map((categoryName, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${
                        highlightedIndex === index ? "bg-emerald-200" : ""
                      }`}
                      onMouseDown={() => handleSelect("category", categoryName)}
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
            className="bg-gray"
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
          <Label>Variants *</Label>
          {cards.map((card, index) => (
            <Card key={card.id || index} className="w-full bg-[#F0F1F4] p-3">
              <CardContent className="m-0 flex flex-row items-center justify-between gap-3 p-0">
                <div className="relative flex w-full items-center">
                  <Input
                    placeholder="Variant"
                    value={card.variant}
                    onChange={(e) => {
                      const updatedCards = [...cards];
                      updatedCards[index].variant = e.target.value;
                      setCards(updatedCards);
                      console.log(`Variant Updated: ${e.target.value}`);
                    }}
                    className="bg-white text-black placeholder-slate-500"
                  />
                </div>
                <div className="relative flex w-full items-center">
                  <div className="absolute ml-2 h-2 w-2 rounded-full bg-orange-400"></div>
                  <Input
                    value={card.lowStock || ""}
                    onChange={(e) => {
                      const updatedCards = [...cards];
                      updatedCards[index].lowStock = e.target.value
                        ? Number(e.target.value)
                        : 0;
                      setCards(updatedCards);
                      console.log(
                        `Low Stock for Variant '${card.variant}': ${e.target.value}`,
                      );
                    }}
                    className="flex-1 rounded-lg bg-white p-5"
                    placeholder="Low Stock"
                  />
                </div>
                <div className="relative flex w-full items-center">
                  <div className="absolute ml-2 h-2 w-2 rounded-full bg-red"></div>
                  <Input
                    value={card.veryLowStock || ""}
                    onChange={(e) => {
                      const updatedCards = [...cards];
                      updatedCards[index].veryLowStock = e.target.value
                        ? Number(e.target.value)
                        : 0;
                      setCards(updatedCards);
                      console.log(
                        `Very Low Stock for Variant '${card.variant}': ${e.target.value}`,
                      );
                    }}
                    className="flex-1 rounded-lg bg-white p-5"
                    placeholder="Very Low Stock"
                  />
                </div>
                <div className="flex items-center">
                  <div className="relative ml-auto flex w-full items-center">
                    {!card.isExisting && (
                      <X
                        size={15}
                        className="scale-125 transition-all duration-300 hover:scale-150 hover:cursor-pointer"
                        onClick={() => handleDeleteCard(card.tempId)}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddCard}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Variant
            </Button>
          </div>

          <div className="absolute bottom-0 right-0 z-[5] flex w-full items-center justify-end gap-3 bg-white px-10 py-5 pl-36 font-bold drop-shadow-2xl">
            <Button
              className="border-gray-300 text-gray-700 border-2 bg-gray p-7 text-lg font-bold hover:bg-red"
              onClick={clear}
            >
              Clear
            </Button>

            {/* Confirmation dialog triggered by the "Clear" button */}
            <Dialog
              open={isDialogCancelOpen}
              onOpenChange={(open) => setIsDialogCancelOpen(open)}
            >
              <DialogContent className="flex w-full max-w-lg flex-col gap-6 rounded-lg bg-white p-10 shadow-lg">
                <DialogTitle className="text-center text-xl font-semibold">
                  Clear All Fields
                </DialogTitle>
                <DialogHeader className="text-center text-lg">
                  Are you sure you want to clear all the fields? This action
                  cannot be undone.
                </DialogHeader>

                <div className="flex justify-center gap-4">
                  <Button
                    className="border-gray-300 bg-gray-300 border-2 p-4 text-lg font-bold text-black hover:bg-textGray"
                    onClick={handleCancelClear}
                  >
                    Cancel
                  </Button>

                  <Button
                    className="border-red-500 bg-red-500 border-2 p-4 text-lg font-bold text-black hover:bg-red"
                    onClick={handleConfirmClear}
                  >
                    Confirm
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              className="border-gray-300 text-gray-700 border-2 bg-gray p-7 text-lg font-bold hover:bg-green"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditItem;
