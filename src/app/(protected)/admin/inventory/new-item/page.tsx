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


    const { data, isLoading, isError } = api.inventory.listAllData.useQuery();
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
    const [variants, setVariants] = useState([{
        id: Date.now(),
        variant: "",
        lowStock: 0,
        veryLowStock: 0,
        isExisting: false
    }]);
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
                setVariants(variants.length > 0 ? variants : [{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0, isExisting: false }]);
            } else {
                setVariants([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0, isExisting: false }]);
            }
        } else {
            setVariants([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0, isExisting: false }]);
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
    const handleAddVariant = () => {
        setVariants(prev => [...prev, { id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0, isExisting: false }]);
    };

    const handleRemoveVariant = (id: number) => {
        setVariants(prev => prev.filter(variant => variant.id !== id));
    };

    const handleAddConversion = () => {
        setConversions(prev => [...prev, { id: Date.now() }]);
    };

    const handleRemoveConversion = (id: number) => {
        setConversions(prev => prev.filter(conv => conv.id !== id));
    };

    const handleDeleteCard = (id: number) => {
        setVariants(variants.filter(variant => variant.id !== id));
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
        setVariants([{ id: Date.now(), variant: "", lowStock: 0, veryLowStock: 0, isExisting: false }]);
        setIsDialogCancelOpen(false);
    };

    const handleCancelClear = () => {
        setIsDialogCancelOpen(false);
    };

    const { mutateAsync: updateVariantMutation } = api.inventory.updateVariant.useMutation();

    const handleSave = async () => {
        // Check main inputs first
        if (!itemSearch && !selectedItem) {
            toast('❌ Missing input', {
                description: 'Please fill in the Item name field',
                duration: 4000,
            });
            return;
        }

        if (!brandSearch && !selectedBrand) {
            toast('❌ Missing input', {
                description: 'Please fill in the Brand field',
                duration: 4000,
            });
            return;
        }

        if (!categorySearch && !selectedCategory) {
            toast('❌ Missing input', {
                description: 'Please fill in the Category field',
                duration: 4000,
            });
            return;
        }

        setIsSaving(true);

        try {
            // Filter out empty variants and existing ones
            const validVariants = variants.filter(variant =>
                !variant.isExisting &&
                variant.variant?.trim() !== "" &&
                variant.lowStock > 0 &&
                variant.veryLowStock > 0
            );

            if (validVariants.length === 0) {
                toast('❌ Missing input', {
                    description: 'Please fill out at least one variant with all required fields',
                    duration: 4000,
                });
                setIsSaving(false);
                return;
            }

            const brandId = selectedBrand
                ? selectedBrand.brand_id
                : await createBrandMutation({ name: brandSearch }).then((res) => res.brand_id);

            const categoryId = selectedCategory
                ? selectedCategory.category_id
                : await createCategoryMutation({ name: categorySearch }).then((res) => res.category_id);

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
                    } else {
                        item = selectedItem;
                    }
                } else {
                    item = await createItemMutation({
                        name: selectedItem.name,
                        brand_id: brandId,
                        category_id: categoryId,
                        description: itemDescription,
                    });
                }
            } else {
                item = await createItemMutation({
                    name: itemSearch,
                    brand_id: brandId,
                    category_id: categoryId,
                    description: itemDescription,
                });
            }

            // Create variants and their associated data
            for (const variant of validVariants) {
                if (!item.item_id) {
                    throw new Error("Item ID is required");
                }

                const createdVariant = await createVariantMutation({
                    item_id: item.item_id,
                    name: variant.variant,
                });

                await createStockLevelMutation({
                    variant_id: createdVariant.variant_id,
                    low_stock: variant.lowStock,
                    very_low_stock: variant.veryLowStock,
                });

                await createInventoryMutation({
                    variant_id: createdVariant.variant_id,
                    quantity: 0,
                    inventory_clerk: session.data?.user.id ?? "",
                    inventory_number: Math.floor(1000000 + Math.random() * 9000000),
                });
            }

            utils.inventory.listInventory.invalidate();

            toast('✅ Success', {
                description: 'New item created successfully!',
                duration: 4000,
            });

            setTimeout(() => {
                router.push("/admin/inventory");
            }, 2000);

        } catch (error) {
            console.error("Error saving item:", error);
            toast('❌ Error', {
                description: 'Failed to save item',
                duration: 4000,
            });
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

            <ScrollArea className="flex-1">
                <div className="flex flex-col gap-10 p-10">
                    <div className="flex justify-between gap-3">
                        <div className="w-full">
                            <Label className="text-slate-500">Item <span className="text-rose-500">*</span></Label>
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
                                    className="bg-slate-100 text-slate-700 placeholder-slate-300 shadow-none"
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
                            <Label className="text-slate-500">Brand <span className="text-rose-500">*</span></Label>
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
                                    className="bg-slate-100 text-slate-700 placeholder-slate-300 shadow-none"
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
                            <Label className="text-slate-500">Category <span className="text-rose-500">*</span></Label>
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
                                    className="bg-slate-100 text-slate-700 placeholder-slate-300 shadow-none"
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
                                                key={categoryName}
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
                        <Label className="text-slate-500">Variants <span className="text-rose-500">*</span></Label>

                        <div className="grid grid-cols-3 gap-4">
                            {variants.map((variant, index) => (
                                <Variant
                                    key={variant.id}
                                    onRemove={() => handleRemoveVariant(variant.id)}
                                    isOnlyVariant={variants.length === 1}
                                    value={{
                                        variant: variant.variant,
                                        lowStock: variant.lowStock,
                                        veryLowStock: variant.veryLowStock
                                    }}
                                    onChange={(value) => {
                                        const newVariants = [...variants];
                                        newVariants[index] = {
                                            ...newVariants[index],
                                            ...value
                                        };
                                        setVariants(newVariants);
                                    }}
                                />
                            ))}
                            {variants.length < 9 && (
                                <Button
                                    className="bg-slate-100/50 rounded-lg p-3 h-48 text-slate-400 hover:bg-slate-100 border-4 border-dashed"
                                    onClick={handleAddVariant}
                                >
                                    + Add a Variant
                                </Button>
                            )}
                        </div>

                        <div className="mt-8">
                            <Label className="text-slate-500">Preset Conversions</Label>

                            <div className="grid grid-cols-3 gap-4 mt-2">
                                {conversions.map((conversion) => (
                                    <ConversionCard
                                        key={conversion.id}
                                        onRemove={() => handleRemoveConversion(conversion.id)}
                                    />
                                ))}
                                {conversions.length < 9 && (
                                    <Button
                                        className="bg-slate-100/50 rounded-lg p-3 h-96 text-slate-400 hover:bg-slate-100 border-4 border-dashed"
                                        onClick={handleAddConversion}
                                    >
                                        + Add a Preset
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            </ScrollArea>

            <Separator className="h-px" />
            <div className="flex w-full items-center justify-end bg-white pt-4 gap-4">
                    <Button
                        size={"lg"}
                        className="hover:bg-green/80 bg-slate-200 text-slate-500 hover:bg-slate-200/70"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        Clear
                    </Button>

                    <Button
                        size={"lg"}
                        className="hover:bg-green/80 bg-green text-white"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Item"}
                    </Button>
            </div>

            <Toaster
                toastOptions={{
                    style: {
                        width: '500px',
                        padding: '12px',
                        color: '#475569',
                        fontSize: '16px',
                        bottom: '80px',
                        right: '12px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        boxShadow: 'none'
                    },
                }}
            />
        </section>
    );
};

export default NewItem;