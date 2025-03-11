"use client";

import { ArrowLeft, Plus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
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


    const { data: nextItemId, isLoading: isLoadingItem, isError: isErrorItem } =
        api.inventory.getItemId.useQuery();


    const { data: data, isLoading, isError } = api.inventory.listAllData.useQuery();
    const { mutateAsync: createItem } = api.inventory.createItem.useMutation();
    // Use mutations outside the handleSave function to avoid invalid hook calls.
    const { mutateAsync: createBrandMutation } = api.inventory.createBrand.useMutation();
    const { mutateAsync: createCategoryMutation } = api.inventory.createCategory.useMutation();
    const { mutateAsync: createItemMutation } = api.inventory.createItem.useMutation();
    const { mutateAsync: createVariantMutation } = api.inventory.createVariant.useMutation();
    const { mutateAsync: createStockLevelMutation } = api.inventory.createStockLevel.useMutation();
    const { mutateAsync: createInventoryMutation } = api.inventory.createInventory.useMutation();
    const { mutateAsync: updateItemMutation } = api.inventory.updateItem.useMutation();

    // const [cards, setCards] = useState([{ id: Date.now() }]);
    // const [cards, setCards] = useState([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0 }]);
    const [cards, setCards] = useState([{
        id: Date.now(),
        variant: "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: false
    }]);

    const [isSaving, setIsSaving] = useState(false);

    const [lowStock, setLowStock] = useState(0);
    const [veryLowStock, setVeryLowStock] = useState(0);


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

    useEffect(() => {
        const currentBrand = selectedBrand?.name ?? brandSearch;
        const currentCategory = selectedCategory?.name ?? categorySearch;

        if (item && currentBrand && currentCategory) {
            const matchingItem = items.find(
                i => i.name === item &&
                    i.brand?.name === currentBrand &&
                    i.category?.name === currentCategory
            );

            if (matchingItem) {
                const variants = matchingItem.variants.map(v => ({
                    id: v.variant_id,
                    variant: v.name,
                    lowStock: v.StockLevel?.low_stock || 0,
                    veryLowStock: v.StockLevel?.very_low_stock || 0, // Add comma here
                    isExisting: true
                }));
                setCards(variants.length > 0 ? variants : [{
                    id: Date.now(),
                    variant: "",
                    lowStock: 0,
                    veryLowStock: 0,
                    isExisting: false
                }]);
            } else {
                setCards([{
                    id: Date.now(),
                    variant: "",
                    lowStock: 0,
                    veryLowStock: 0,
                    isExisting: false
                }]);
            }
        } else {
            setCards([{
                id: Date.now(),
                variant: "",
                lowStock: 0,
                veryLowStock: 0,
                isExisting: false
            }]);
        }
    }, [item, brandSearch, selectedBrand, categorySearch, selectedCategory, items]);
    const handleSelect = (type: string, name: string) => {
        switch (type) {
            case "item":
                if (itemOptions.includes(name)) {
                    setItem(name);
                }
                const selectedItem = items.find(item => item.name === name);
                if (selectedItem) {
                    setSelectedItem({
                        name: selectedItem.name,
                        brand_id: selectedItem.brand_id,
                        category_id: selectedItem.category_id,
                        description: selectedItem.description || undefined,
                        item_id: selectedItem.item_id
                    });
                    setItemDescription(selectedItem.description || '');
                    console.log("Selected Item:", selectedItem);
                }
                break;
            // case "item":
            //     setItem(name);
            //     const selectedItem = items.find(item => item.name === name);
            //     if (selectedItem) {
            //         setSelectedItem(selectedItem);
            //         setItemDescription(selectedItem.description || "");
            //     }
            //     break;
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
                prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
            );
        } else if (e.key === "ArrowUp") {
            setHighlightedIndexFn((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : prevIndex
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
        setCards([...cards, {
            id: Date.now(),
            variant: "",
            lowStock: 0,
            veryLowStock: 0,
            isExisting: false
        }]);
    };

    const handleDeleteCard = (id: number) => {
        setCards(cards.filter(card => card.id !== id));
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
        setCards([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0, isExisting: false }]);
        setIsDialogCancelOpen(false);
    };

    const handleCancelClear = () => {
        setIsDialogCancelOpen(false);
    };

    const { mutateAsync: updateVariantMutation } = api.inventory.updateVariant.useMutation();

    const handleSave = async () => {
        const hasAtLeastOneVariant = cards.some(card => card.variant.trim() !== "");

        if (!hasAtLeastOneVariant) {
            setDialogMessage("Please fill out at least one variant row.");
            setIsDialogSaveOpen(true);
            return;
        }

        // Collect all validation errors
        const errors = [];

        // Check the first variant
        const firstVariant = cards[0];
        if (!firstVariant) {
            errors.push("No variants found.");
            return;
        }
        if (firstVariant.variant.trim() !== "") {
            if (firstVariant.lowStock === null || firstVariant.lowStock <= 0) {
                errors.push("Low Stock value for the first variant must be greater than 0.");
            }
            if (firstVariant.veryLowStock === null || firstVariant.veryLowStock <= 0) {
                errors.push("Very Low Stock value for the first variant must be greater than 0.");
            }
        } else {
            errors.push("The first variant must be filled out.");
        }

        // Check additional variants
        for (let i = 1; i < cards.length; i++) {
            const card = cards[i];
            if (!card) continue;

            if (card.variant.trim() !== "") {
                if (card.lowStock === null || card.lowStock <= 0) {
                    errors.push(`Low Stock value for variant "${card.variant}" must be greater than 0.`);
                }
                if (card.veryLowStock === null || card.veryLowStock <= 0) {
                    errors.push(`Very Low Stock value for variant "${card.variant}" must be greater than 0.`);
                }
            } else if (card.lowStock !== 0 || card.veryLowStock !== 0) {
                errors.push(`Variant row ${i + 1} has Low Stock or Very Low Stock values but no variant name. Please fill out the variant name or clear the stock values.`);
            }
        }

        // If there are errors, show them and stop
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
            // Filter out empty variants and existing ones
            const validCards = cards.filter(card =>
                !card.isExisting && card.variant.trim() !== ""
            );
            // try {
            //     // Filter out empty variants
            //     const validCards = cards.filter(card => card.variant.trim() !== "");


            console.log("Item:", itemSearch || selectedItem);
            console.log("Brand:", brandSearch || selectedBrand);
            console.log("Category:", categorySearch || selectedCategory);
            console.log("Item Description:", itemDescription);
            console.log("Valid Variants:", validCards);

            const brandId = selectedBrand
                ? selectedBrand.brand_id
                : await createBrandMutation({ name: brandSearch }).then((res) => res.brand_id);

            console.log("Brand ID:", brandId);

            const categoryId = selectedCategory
                ? selectedCategory.category_id
                : await createCategoryMutation({ name: categorySearch }).then((res) => res.category_id);

            console.log("Category ID:", categoryId);

            let item;

            if (selectedItem) {
                if (
                    selectedItem.brand_id === brandId &&
                    selectedItem.category_id === categoryId &&
                    selectedItem.item_id
                ) {
                    if (selectedItem.description !== itemDescription) {
                        item = await updateItemMutation({
                            item_id: selectedItem.item_id,
                            description: itemDescription,
                            brand_id: brandId,
                            category_id: categoryId,
                            name: selectedItem.name,
                        });
                        console.log("Updated item description:", item);
                    } else {
                        item = selectedItem;
                        console.log("Using existing item:", item);
                    }
                } else {
                    item = await createItemMutation({
                        name: selectedItem.name,
                        brand_id: brandId,
                        category_id: categoryId,
                        description: itemDescription,
                    });

                    console.log("Created new item:", item);
                }
            } else {
                item = await createItemMutation({
                    name: itemSearch || "",
                    brand_id: brandId,
                    category_id: categoryId,
                    description: itemDescription,
                });

                console.log("Created new item:", item);
            }

            for (const card of validCards) {
                if (!item.item_id) {
                    throw new Error("Item ID is required");
                }
                // Only create new variants (existing ones are filtered out)
                const variant = await createVariantMutation({
                    item_id: item.item_id,
                    name: card.variant,
                });
                console.log("Created Variant:", variant);

                await createStockLevelMutation({
                    variant_id: variant.variant_id,
                    low_stock: card.lowStock,
                    very_low_stock: card.veryLowStock,
                });

                await createInventoryMutation({
                    variant_id: variant.variant_id,
                    quantity: 0,
                    inventory_clerk: session.data?.user.id ?? "",
                    inventory_number: Math.floor(1000000 + Math.random() * 9000000),
                });
            }


            setDialogMessage("New item created successfully!");
            setIsDialogSaveOpen(true);

            utils.inventory.listInventory.invalidate();

            setTimeout(() => {
                router.push("/admin/inventory");
            }, 2000);

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
            setCards([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0, isExisting: false }]);
            setIsDialogCancelOpen(false);
        } catch (error) {
            console.error("Error saving item:", error);
            setDialogMessage("Failed to save item.");
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
                    <span className="font-bold">NEW ITEM</span>
                    <span className="ml-3 text-sm font-light text-textGray">#{nextItemId}</span>
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
                                onFocus={() => setDropdownVisible((prev) => ({ ...prev, item: true }))}
                                onBlur={() => setDropdownVisible((prev) => ({ ...prev, item: false }))}
                                onKeyDown={(e) => handleKeyDown(e, "item")}
                            />

                            {dropdownVisible && filteredItems.length > 0 && (
                                <div
                                    className="absolute top-full left-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                                    style={{ maxHeight: "200px", overflowY: "auto" }}
                                >
                                    {filteredItems.map((itemName, index) => (
                                        <div
                                            key={index}
                                            className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${highlightedIndex === index ? "bg-emerald-200" : ""
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
                                onFocus={() => setDropdownVisible((prev) => ({ ...prev, brand: true }))}
                                onBlur={() => setDropdownVisible((prev) => ({ ...prev, brand: false }))}
                                onKeyDown={(e) => handleKeyDown(e, "brand")}
                            />

                            {dropdownVisible && filteredBrands.length > 0 && (
                                <div
                                    className="absolute top-full left-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                                    style={{ maxHeight: "200px", overflowY: "auto" }}
                                >
                                    {filteredBrands.map((brandName, index) => (
                                        <div
                                            key={index}
                                            className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${highlightedIndex === index ? "bg-emerald-200" : ""
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
                                onFocus={() => setDropdownVisible((prev) => ({ ...prev, category: true }))}
                                onBlur={() => setDropdownVisible((prev) => ({ ...prev, category: false }))}
                                onKeyDown={(e) => handleKeyDown(e, "category")}
                            />


                            {dropdownVisible && filteredCategories.length > 0 && (
                                <div
                                    className="absolute top-full left-0 z-10 mt-1 w-full rounded-md bg-white shadow-lg"
                                    style={{ maxHeight: "200px", overflowY: "auto" }}
                                >
                                    {filteredCategories.map((categoryName, index) => (
                                        <div
                                            key={index}
                                            className={`cursor-pointer px-4 py-2 hover:bg-emerald-100 ${highlightedIndex === index ? "bg-emerald-200" : ""
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
                        <Card key={card.id} className="w-full bg-[#F0F1F4] p-3">
                            <CardContent className="m-0 flex flex-row items-center justify-between gap-3 p-0">
                                <div className="relative flex w-full items-center">
                                    <Input
                                        placeholder="Variant"
                                        value={card.variant}
                                        onChange={(e) => {
                                            if (!card.isExisting) {
                                                const updatedCards = [...cards] as typeof cards;
                                                updatedCards[index]!.variant = e.target.value;
                                                setCards(updatedCards);
                                                console.log(`Variant Updated: ${e.target.value}`);
                                            }
                                        }}
                                        className="bg-white text-black placeholder-slate-500"
                                        disabled={card.isExisting}
                                    />
                                </div>
                                <div className="relative flex w-full items-center">
                                    <div className="absolute ml-2 h-2 w-2 rounded-full bg-orange-400"></div>
                                    <Input
                                        value={card.lowStock || ""}
                                        onChange={(e) => {
                                            if (!card.isExisting) {
                                                const updatedCards = [...cards] as typeof cards;
                                                updatedCards[index]!.lowStock = e.target.value ? Number(e.target.value) : 0;
                                                setCards(updatedCards);
                                                console.log(`Low Stock for Variant '${card.variant}': ${e.target.value}`);
                                            }
                                        }}
                                        className="flex-1 rounded-lg bg-white p-5"
                                        placeholder="Low Stock"
                                        disabled={card.isExisting}
                                    />
                                </div>
                                <div className="relative flex w-full items-center">
                                    <div className="absolute ml-2 h-2 w-2 rounded-full bg-red"></div>
                                    <Input
                                        value={card.veryLowStock || ""}
                                        onChange={(e) => {
                                            if (!card.isExisting) {
                                                const updatedCards = [...cards] as typeof cards;
                                                updatedCards[index]!.veryLowStock = e.target.value ? Number(e.target.value) : 0;
                                                setCards(updatedCards);
                                                console.log(`Very Low Stock for Variant '${card.variant}': ${e.target.value}`);
                                            }
                                        }}
                                        className="flex-1 rounded-lg bg-white p-5"
                                        placeholder="Very Low Stock"
                                        disabled={card.isExisting}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <div className="relative ml-auto flex w-full items-center">
                                        {!card.isExisting && (
                                            <X
                                                size={15}
                                                className="scale-125 transition-all duration-300 hover:scale-150 hover:cursor-pointer"
                                                onClick={() => handleDeleteCard(card.id)}
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

                    <div
                        className="absolute bottom-0 right-0 z-[5] flex w-full items-center justify-end gap-3 bg-white px-10 py-5 pl-36 font-bold drop-shadow-2xl">
                        <Button
                            className="border-2 border-gray-300 bg-gray p-7 text-lg font-bold text-gray-700 hover:bg-red"
                            onClick={clear}
                        >
                            Clear
                        </Button>

                        {/* Confirmation dialog triggered by the "Clear" button */}
                        <Dialog open={isDialogCancelOpen} onOpenChange={(open) => setIsDialogCancelOpen(open)}>
                            <DialogContent
                                className="w-full max-w-lg p-10 flex flex-col gap-6 bg-white rounded-lg shadow-lg">
                                <DialogTitle className="text-center text-xl font-semibold">Clear All
                                    Fields</DialogTitle>
                                <DialogHeader className="text-center text-lg">
                                    Are you sure you want to clear all the fields? This action cannot be undone.
                                </DialogHeader>

                                <div className="flex justify-center gap-4">
                                    <Button
                                        className="border-2 border-gray-300 bg-gray-300 p-4 text-lg font-bold text-black hover:bg-textGray"
                                        onClick={handleCancelClear}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        className="border-2 border-red-500 bg-red-500 p-4 text-lg font-bold text-black hover:bg-red"
                                        onClick={handleConfirmClear}
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

export default NewItem;