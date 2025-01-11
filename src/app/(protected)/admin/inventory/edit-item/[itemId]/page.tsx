"use client";

import React, {useState, useEffect, useMemo} from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog-transparent";
import { Label } from "~/components/ui/label";
import {ArrowLeft, ArrowRight, Plus, X} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import {Card, CardContent} from "~/components/ui/card";
import {useParams, useRouter} from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {LoadingSpinner} from "~/components/loading";  // assuming you're using react-query or your custom API hooks

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
  const { itemId } = useParams();
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

  const itemIdAsNumber = Number(itemId);


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

  const {data: data} = api.inventory.listAllData.useQuery();


  const { data: itemData } = api.inventory.getInventoryItem.useQuery(
      { id: Number(itemId) },
      {
        onSuccess: (data) => {
          console.log("Fetched Item Data:", data);

          if (data && Array.isArray(data) && data.length > 0) {
            // Iterate over the variants array
            data.forEach((variantData) => {
              console.log("Variant ID:", variantData?.variant_id || "No variant ID");
              console.log("Variant Name:", variantData?.name || "No variant name");
              console.log("Low Stock:", variantData?.StockLevel?.low_stock || "No low stock");
              console.log("Very Low Stock:", variantData?.StockLevel?.very_low_stock || "No very low stock");

              const item = variantData?.item;
              console.log("Item ID:", item?.item_id || "No item ID");
              console.log("Item Name:", item?.name || "No item name");
              console.log("Brand ID:", item?.brand?.brand_id || "No brand ID");
              console.log("Brand Name:", item?.brand?.name || "No brand name");
              console.log("Category ID:", item?.category?.category_id || "No category ID");
              console.log("Category Name:", item?.category?.name || "No category name");
              console.log("Item Description:", item?.description || "No description");

              // Set state for item and variants
              setItem(item?.name || "Unknown Item");
              setBrand(item?.brand?.name || "Unknown Brand");
              setCategory(item?.category?.name || "Unknown Category");
              setItemDescription(item?.description || "No Description");

              // Update the cards with variant details
              setCards((prevCards) => [
                ...prevCards,
                {
                  id: variantData.variant_id,
                  variant: variantData?.name || "Unknown Variant",
                  lowStock: variantData?.StockLevel?.low_stock || 0,
                  veryLowStock: variantData?.StockLevel?.very_low_stock || 0,
                },
              ]);
            });
          } else {
            console.log("No variants found for this item.");
          }
        },
        onError: (error) => {
          console.error("Error Fetching Item Data:", error);
        },
      }
  );

  useEffect(() => {
    if (itemData && Array.isArray(itemData) && itemData.length > 0) {
      // Assuming you want to set the first variant's item details
      const firstVariant = itemData[0].item;

      setItem(firstVariant?.name || "Unknown Item");
      setBrand(firstVariant?.brand?.name || "Unknown Brand");
      setCategory(firstVariant?.category?.name || "Unknown Category");
      setItemDescription(firstVariant?.description || "No Description");

      // Update the cards with variant details
      setCards(
          itemData.map((variantData) => ({
            id: variantData.variant_id,
            variant: variantData?.name || "Unknown Variant",
            lowStock: variantData?.StockLevel?.low_stock || 0,
            veryLowStock: variantData?.StockLevel?.very_low_stock || 0,
          }))
      );
    } else {
      console.log("No variants found for this item.");
    }
  }, [itemData]);


  useEffect(() => {
    if (itemData && Array.isArray(itemData)) {
      itemData.forEach((variantData) => {
        console.log("Variant ID:", variantData?.variant_id || "No variant ID");
        console.log("Variant Name:", variantData?.name || "No variant name");
        console.log("Low Stock:", variantData?.StockLevel?.low_stock || "No low stock");
        console.log("Very Low Stock:", variantData?.StockLevel?.very_low_stock || "No very low stock");

        const item = variantData?.item;
        console.log("Item ID:", item?.item_id || "No item ID");
        console.log("Item Name:", item?.name || "No item name");
        console.log("Brand ID:", item?.brand?.brand_id || "No brand ID");
        console.log("Brand Name:", item?.brand?.name || "No brand name");
        console.log("Category ID:", item?.category?.category_id || "No category ID");
        console.log("Category Name:", item?.category?.name || "No category name");
        console.log("Item Description:", item?.description || "No description");

        setItem(item?.name || "Unknown Item");
        setBrand(item?.brand?.name || "Unknown Brand");
        setCategory(item?.category?.name || "Unknown Category");
        setItemDescription(item?.description || "No Description");
      });
    } else {
      console.log("No variants found for this item.");
    }
  }, [itemData]);








  const { mutateAsync: createItem, Loading, Error } = api.inventory.createItem.useMutation();
// Use mutations outside the handleSave function to avoid invalid hook calls.
  const { mutateAsync: createBrandMutation } = api.inventory.createBrand.useMutation();
  const { mutateAsync: createCategoryMutation } = api.inventory.createCategory.useMutation();
  const { mutateAsync: createItemMutation } = api.inventory.createItem.useMutation();
  const { mutateAsync: createVariantMutation } = api.inventory.createVariant.useMutation();
  const { mutateAsync: createStockLevelMutation } = api.inventory.createStockLevel.useMutation();
  const { mutateAsync: createInventoryMutation } = api.inventory.createInventory.useMutation();


  const { mutateAsync: updateItemMutation } = api.inventory.updateItem.useMutation();
  // const { mutateAsync: editItemMutation, isLoading: isEditing } = api.inventory.editItem.useMutation();
  // const [cards, setCards] = useState([{ id: Date.now() }]);
  const { mutateAsync: editItemMutation, isLoading, isError, isEditing } = api.inventory.editItem.useMutation();
  // const { mutateAsync: editBrandMutation } = api.inventory.editBrand.useMutation();
  // const { mutateAsync: editCategoryMutation } = api.inventory.editCategory.useMutation();
  const [cards, setCards] = useState([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0 }]);
  const [isSaving, setIsSaving] = useState(false);
  const [lowStock, setLowStock] = useState(0);  // Default 0 value
  const [veryLowStock, setVeryLowStock] = useState(0); // Default 0 value

  // Memoized states
  const brands = useMemo(() => data?.brands ?? [], [data]);
  const categories = useMemo(() => data?.categories ?? [], [data]);
  const units = useMemo(() => data?.units ?? [], [data]);
  const items = useMemo(() => data?.items ?? [], [data]);
  const variants = useMemo(() => data?.variants ?? [], [data]);

  useEffect(() => {
    if (item) {
      const selectedItem = data?.items.find((itemData) => itemData.name === item);
      if (selectedItem) {
        setItemDescription(selectedItem.description ?? "");
      }
    }
  }, [item, data?.items]);

  useEffect(() => {
    if (data?.items) setItemOptions(data.items.map((item) => item.name));
    if (data?.categories) setCategoryOptions(data.categories.map((category) => category.name));
    if (data?.brands) setBrandOptions(data.brands.map((brand) => brand.name));
  }, [data]);

  useEffect(() => {
    if (itemSearch) {
      setFilteredItems(
          itemOptions.filter((itemName) =>
              itemName.toLowerCase().includes(itemSearch.toLowerCase())
          )
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
              brandName.toLowerCase().includes(brandSearch.toLowerCase())
          )
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
              categoryName.toLowerCase().includes(categorySearch.toLowerCase())
          )
      );
      setDropdownVisible((prev) => ({ ...prev, category: true }));
    } else {
      setFilteredCategories([]);
      setDropdownVisible((prev) => ({ ...prev, category: false }));
    }
  }, [categorySearch, categoryOptions]);

  const handleSelect = (type: string, name: string) => {
    switch (type) {
      case "item":
        if (itemOptions.includes(name)) {
          setItem(name);
        }
        const selectedItem = items.find(item => item.name === name);
        if (selectedItem) {
          setSelectedItem(selectedItem);
          setItemDescription(selectedItem.description || '');
          console.log("Selected Item:", selectedItem);
        }
        break;
      case "category":
        if (categoryOptions.includes(name)) {
          setCategory(name);
        }
        const selectedCategory = categories.find(cat => cat.name === name);
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
        const selectedBrand = brands.find(brand => brand.name === name);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
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
          prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndexFn((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      handleSelect(field, filteredOptions[highlightedIndex]);
    }
  };

  const handleAddCard = () => {
    setCards([...cards, { id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0 }]);
  };

  const { mutateAsync: deleteItemMutation } = api.inventory.deleteItem.useMutation();

  // const handleDeleteCard = (id) => {
  //   setCards(cards.filter(card => card.id !== id));
  // };

  const { mutateAsync: deleteVariantMutation } = api.inventory.deleteVariant.useMutation();

  const handleDeleteCard = async (variantId) => {
    try {
      // Call the delete mutation
      const response = await deleteVariantMutation({ variantId });

      console.log("Variant and all related records deleted successfully:", response);

      // Show success message
      setDialogMessage("Variant and all related records deleted successfully.");
      setIsDialogCancelOpen(false);

      // Update the UI by removing the deleted variant from the state
      setCards(cards.filter(card => card.id !== variantId));
    } catch (error) {
      console.error("Error deleting variant:", error);

      // Show error message
      setDialogMessage("Failed to delete variant. Please try again.");
    }
  };


  const handleDelete = () => {
    setIsDialogCancelOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Call the delete mutation with the correct inventoryId
      const response = await deleteItemMutation({ inventoryId: itemIdAsNumber });

      console.log("Item and all related records deleted successfully:", response);

      // Show success message
      setDialogMessage("Item and all related records deleted successfully.");
      setIsDialogCancelOpen(false);

      // Redirect or update UI as needed
      router.push("/inventory"); // Redirect to inventory list or another page
    } catch (error) {
      console.error("Error deleting item:", error);

      // Show error message
      setDialogMessage("Failed to delete item. Please try again.");
    }
  };


  const handleCancelDelete = () => {
    setIsDialogCancelOpen(false);
  };


  const handleSave = async () => {
    const updatedItem = itemSearch || item;
    const updatedBrand = brandSearch || brand;
    const updatedCategory = categorySearch || category;

    // Construct the payload
    const payload = {
      inventoryId: itemIdAsNumber,
      name: updatedItem,
      brand: updatedBrand,
      category: updatedCategory,
      description: itemDescription,
      variants: cards.map((card) => ({
        id: card.id,
        name: card.variant,
        lowStock: card.lowStock,
        veryLowStock: card.veryLowStock,
      })),
    };

    try {
      const response = await editItemMutation(payload);
      console.log("Item updated successfully:", response);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };


  // it return different variant_id value error creating new variant on edit-item
  // const handleSave = async () => {
  //   const updatedItem = itemSearch || item;
  //   const updatedBrand = brandSearch || brand;
  //   const updatedCategory = categorySearch || category;
  //
  //   // Construct the payload for mutation
  //   const payload = {
  //     inventoryId: itemIdAsNumber,
  //     name: updatedItem,
  //     brand: updatedBrand,
  //     category: updatedCategory,
  //     description: itemDescription,
  //     variants: cards.map((card) => ({
  //       id: card.id || undefined, // Ensure id is omitted or undefined for new variants
  //       name: card.variant,
  //       lowStock: card.lowStock,
  //       veryLowStock: card.veryLowStock,
  //     })),
  //   };
  //
  //   console.log("Payload being sent to mutation:", payload); // Log the payload before sending
  //
  //   try {
  //     const response = await editItemMutation(payload);
  //     console.log("Item updated successfully:", response);
  //   } catch (error) {
  //     console.error("Error updating item:", error);
  //   }
  // };

  if (isLoading) {
    return (
        <section className="flex h-screen w-full items-center justify-center">
          <LoadingSpinner />
        </section>
    );
  }

  if (isError) {
    return (
        <section className="flex h-screen w-full items-center justify-center">
          <span>Error fetching data...</span>
        </section>
    );
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
              <DialogContent className="max-h-screen flex w-full max-w-lg flex-col p-6">
                <DialogTitle className="text-center text-lg font-bold">Save Item</DialogTitle>
                <DialogHeader>
                  <div className="flex w-full justify-center text-center text-lg">
                    <span>{dialogMessage}</span>
                  </div>
                </DialogHeader>
                <div className="flex w-full items-center justify-center gap-4 mt-4">
                  <Button
                      size="lg"
                      className="border-2 border-gray-300 bg-white p-3 text-gray-700 hover:bg-green"
                      onClick={() => setIsDialogSaveOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <span className="font-bold">EDIT ITEM</span>
            <span className="ml-3 text-sm font-light text-textGray">#{itemIdAsNumber}</span>
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
                      console.log(`Item Search Updated: ${value}`); // Log item search changes
                    }}
                    className="bg-white text-black placeholder-slate-500"
                    onFocus={() => setDropdownVisible((prev) => ({...prev, item: true}))}
                    onBlur={() => setDropdownVisible((prev) => ({...prev, item: false}))}
                    onKeyDown={(e) => handleKeyDown(e, "item")}
                />

                {dropdownVisible && filteredItems.length > 0 && (
                    <div
                        className="absolute top-full left-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                        style={{maxHeight: "200px", overflowY: "auto"}}
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
                      console.log(`Brand Search Updated: ${value}`); // Log brand search changes
                    }}
                    className="bg-white text-black placeholder-slate-500"
                    onFocus={() => setDropdownVisible((prev) => ({...prev, brand: true}))}
                    onBlur={() => setDropdownVisible((prev) => ({...prev, brand: false}))}
                    onKeyDown={(e) => handleKeyDown(e, "brand")}
                />

                {dropdownVisible && filteredBrands.length > 0 && (
                    <div
                        className="absolute top-full left-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                        style={{maxHeight: "200px", overflowY: "auto"}}
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
                      console.log(`Category Search Updated: ${value}`); // Log category search changes
                    }}
                    className="bg-white text-black placeholder-slate-500"
                    onFocus={() => setDropdownVisible((prev) => ({...prev, category: true}))}
                    onBlur={() => setDropdownVisible((prev) => ({...prev, category: false}))}
                    onKeyDown={(e) => handleKeyDown(e, "category")}
                />


                {dropdownVisible && filteredCategories.length > 0 && (
                    <div
                        className="absolute top-full left-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                        style={{maxHeight: "200px", overflowY: "auto"}}
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
                  console.log(`Item Description Updated: ${e.target.value}`); // Log item description changes
                }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label>Variants *</Label>
            {cards.map((card, index) => (
                <Card key={card.id} className="w-full bg-[#F0F1F4] p-3">
                  <CardContent className="m-0 flex flex-row items-center justify-between gap-3 p-0">
                    <div className="relative flex w-full items-center">
                      <Input
                          placeholder="Variant"
                          value={card.variant}
                          onChange={(e) => {
                            const updatedCards = [...cards];
                            updatedCards[index].variant = e.target.value;
                            setCards(updatedCards);
                            console.log(`Variant Updated: ${e.target.value}`); // Log the variant change
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
                            updatedCards[index].lowStock = e.target.value ? Number(e.target.value) : 0; // Ensure it's a number
                            setCards(updatedCards);
                            console.log(`Low Stock for Variant '${card.variant}': ${e.target.value}`); // Log low stock change
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
                            updatedCards[index].veryLowStock = e.target.value ? Number(e.target.value) : 0; // Ensure it's a number
                            setCards(updatedCards);
                            console.log(`Very Low Stock for Variant '${card.variant}': ${e.target.value}`); // Log very low stock change
                          }}
                          className="flex-1 rounded-lg bg-white p-5"
                          placeholder="Very Low Stock"
                      />
                    </div>
                    <div className="flex items-center">

                      <div className="relative ml-auto flex w-full items-center">
                        <X
                            size={15}
                            className="scale-125 transition-all duration-300 hover:scale-150 hover:cursor-pointer"
                            onClick={() => handleDeleteCard(card.id)}
                        />
                      </div>

                      {/*temporary disable adding new variant card*/}
                      {/*<div className="relative ml-auto flex w-full items-center">*/}
                      {/*  {index === cards.length - 1 ? (*/}
                      {/*      <Plus*/}
                      {/*          size={15}*/}
                      {/*          className="scale-125 transition-all duration-300 hover:scale-150 hover:cursor-pointer"*/}
                      {/*          onClick={handleAddCard}*/}
                      {/*      />*/}
                      {/*  ) :*/}
                      {/*      (*/}
                      {/*      <X*/}
                      {/*          size={15}*/}
                      {/*          className="scale-125 transition-all duration-300 hover:scale-150 hover:cursor-pointer"*/}
                      {/*          onClick={() => handleDeleteCard(card.id)}*/}
                      {/*      />*/}
                      {/*  )}*/}
                      {/*</div>*/}
                    </div>
                  </CardContent>
                </Card>
            ))}
            <div
                className="absolute bottom-0 right-0 z-[5] flex w-full items-center justify-end gap-3 bg-white px-10 py-5 pl-36 font-bold drop-shadow-2xl">
              <Button
                  className="border-2 border-gray-300 bg-gray p-7 text-lg font-bold text-gray-700 hover:bg-red"
                  onClick={handleDelete}
              >
                Delete
              </Button>

              {/* Confirmation dialog triggered by the "Clear" button */}
              <Dialog open={isDialogCancelOpen} onOpenChange={(open) => setIsDialogCancelOpen(open)}>
                <DialogContent className="w-full max-w-lg p-10 flex flex-col gap-6 bg-white rounded-lg shadow-lg">
                  <DialogTitle className="text-center text-xl font-semibold">Delete All Records</DialogTitle>
                  <DialogHeader className="text-center text-lg">
                    Are you sure you want to delete all the records? This action cannot be undone.
                  </DialogHeader>

                  <div className="flex justify-center gap-4">
                    <Button
                        className="border-2 border-gray-300 bg-gray-300 p-4 text-lg font-bold text-black hover:bg-textGray"
                        onClick={handleCancelDelete}
                    >
                      Cancel
                    </Button>

                    <Button
                        className="border-2 border-red-500 bg-red-500 p-4 text-lg font-bold text-black hover:bg-red"
                        onClick={handleConfirmDelete}
                    >
                      Confirm
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                  className="border-2 border-gray-300 bg-gray p-7 text-lg font-bold text-gray-700 hover:bg-green"
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

const AddVariant = ({ onAdd }: { onAdd: () => void }) => {
  return (
      <div className="mt-2 flex items-center">
        <div className="grid grid-cols-5 gap-3 pr-4 hover:cursor-default">
          <div className="flex flex-col items-start gap-1">
            <Input placeholder="Stock" disabled />
          </div>
          <div className="flex flex-col items-start gap-1">
            <Input placeholder="Price" disabled />
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <Input placeholder="Unit" disabled />
              <ArrowRight className="text-gray-400 h-5 w-5" />
            </div>
          </div>
          <div className="col-span-2 flex flex-col items-start gap-1">
            <div className="flex items-center">
              <Input placeholder="to" className="rounded-r-none" disabled />
              <Input placeholder="Units" className="rounded-l-none" disabled />
            </div>
          </div>
        </div>
        <Plus className="h-5 w-5 hover:cursor-pointer" onClick={onAdd} />
      </div>
  );
};

export default EditItem;