"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Dialog } from "~/components/ui/dialog-transparent";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import InventoryCard, { type InventoryCardRef } from "../../_components/inventory-card";

interface StockUnitData {
    stock: string;
    price: string;
    unit: string;
    conversionQty: string;
    conversionUnit: string;
    supplierUnitId?: number;
    supplierId?: string;
}

interface InventoryItemInfoProps {
    inventoryItems: InventoryItem[];
}

// Interfaces for data structures
interface Unit {
    unit_id: number;
    name: string;
    conversion_rate?: string;
}

interface Brand {
    brand_id: number;
    name: string;
}

interface Category {
    category_id: number;
    name: string;
}

interface SupplierDetails {
    first_name: string;
    last_name: string;
}

interface Supplier {
    supplier_id: number;
    Personal_Details: SupplierDetails;
}

interface ConversionRate {
    conversion_rate: string;
    fromUnit: { name: string };
    toUnit: { name: string };
}

interface SupplierUnit {
    supplier_unit_id: number;
    quantity_per_unit: number;
    price: number;
    unit: Unit;
    ConversionRate: ConversionRate[];
    supplier: Supplier;
}

interface BatchVariant {
    batch_variant_id: string;
    batch_id: string;
    supplierUnits: SupplierUnit[];
}

interface Variant {
    variant_id: number;
    item_id: number;
    name: string;
    description?: string;
    BatchVariant: BatchVariant[];
    item: {
        item_id: number;
        name: string;
        brand: Brand;
        category: Category;
    };
}

interface InventoryItem {
    inventory_id: number;
    variant_id: number;
    quantity: number;
    variant: Variant;
}

const EditBatch = () => {
    const router = useRouter();
    const { batchId } = useParams();
    const [isSaving, setIsSaving] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [dialogType, setDialogType] = useState("success");
    const [isDialogOpen, setIsDialogOpen] = useState(false);


    const inventoryCardRefs = useRef<Record<number, InventoryCardRef>>({});
    const [cardsData, setCardsData] = useState<Record<number, StockUnitData[]>>({});

    const [itemData, setItemData] = useState<InventoryItem | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);

    const inventoryIdAsNumber = Number(batchId);

    const {
        data: inventoryDataResponse,
        isLoading: inventoryLoading,
        isError: inventoryError,
    } = api.inventory.getInventoryItem.useQuery(
        { id: inventoryIdAsNumber },
        { enabled: !isNaN(inventoryIdAsNumber) },
    );

    const {
        data: allData,
        isLoading: allLoading,
        isError: allError,
    } = api.inventory.listAllData.useQuery();

    useEffect(() => {
        if (inventoryDataResponse && inventoryIdAsNumber) {
            console.log("inventoryDataResponse:", inventoryDataResponse); // Log the full response

            // Step 1: Get the variant_id from the inventory record
            const variantId = inventoryDataResponse.variant_id;

            // Step 2: Use the variant_id to find the matching variant in the response
            const matchedVariant = inventoryDataResponse.variant;

            if (matchedVariant) {
                console.log("Matched Variant:", matchedVariant);

                // Step 3: Check if this variant_id exists in the BatchVariant table
                const matchedBatchVariant = matchedVariant.BatchVariant.find((batchVariant) => {
                    console.log("Checking batch variant:", batchVariant);
                    console.log("Batch ID in BatchVariant:", batchVariant.batch_id);

                    // If we find the matching batch_id, return the variant
                    if (batchVariant.variant_id === matchedVariant.variant_id) {
                        console.log("Found matching batch variant for variant_id:", batchVariant);
                        return true;
                    }
                    return false;
                });

                // Step 4: Handle the result
                if (matchedBatchVariant) {
                    console.log("Full inventory response:", JSON.stringify(inventoryDataResponse, null, 2));
                    console.log("Matched BatchVariant:", JSON.stringify(matchedBatchVariant, null, 2));
                    const variant: Variant = {
                        variant_id: matchedVariant.variant_id,
                        item_id: matchedVariant.item_id,
                        name: matchedVariant.name,
                        description: matchedVariant.description || undefined,
                        BatchVariant: [{
                            batch_variant_id: String(matchedBatchVariant.batch_variant_id),
                            batch_id: String(matchedBatchVariant.batch_id),
                            supplierUnits: (matchedBatchVariant.batch.batchVariants?.[0]?.SupplierUnit || []).map(su => ({
                                supplier_unit_id: Number(su.supplier_unit_id),
                                quantity_per_unit: su.quantity_per_unit,
                                price: su.price,
                                unit: su.unit || { unit_id: 0, name: '' },
                                ConversionRate: (su.ConversionRate || []).map(cr => ({
                                    conversion_rate: String(cr.conversion_rate),
                                    fromUnit: cr.fromUnit || { name: '' },
                                    toUnit: cr.toUnit || { name: '' }
                                })),
                                supplier: {
                                    supplier_id: 0,
                                    Personal_Details: {
                                        first_name: '',
                                        last_name: ''
                                    }
                                }
                            }))
                        }],
                        item: matchedVariant.item
                    };
                    setItemData({
                        inventory_id: inventoryIdAsNumber,
                        variant_id: variant.variant_id,
                        quantity: 0,
                        variant
                    });
                } else {
                    console.log("No matching batch variant found.");
                    setItemData(null); // Handle case when no batch variant is found
                }
            } else {
                console.log("No matching variant found for the given inventory_id.");
                setItemData(null); // Handle case when no matching variant is found
            }
        }
    }, [inventoryDataResponse, inventoryIdAsNumber]); // Dependency on inventoryIdAsNumber to trigger effect when it changes

    useEffect(() => {
        if (allData) {
            // console.log("All Data:", allData); // Log all the fetched data
            setUnits(allData.units);
        }
    }, [allData]);


    const getChangeStatus = (current: StockUnitData, original: StockUnitData, index: number) => {
        // New unit (exists in current but not in original)
        if (!original && current) return "new";

        // Removed unit (exists in original but not in current)
        if (!current && original) return "removed";

        // Compare all fields if both exist
        const isModified = original && Object.keys(current).some(key => {
            const currentValue = current[key as keyof StockUnitData];
            const originalValue = original[key as keyof StockUnitData];

            // Handle numeric comparison for stock/price/conversionQty
            if (["stock", "price", "conversionQty"].includes(key)) {
                return Number(currentValue) !== Number(originalValue);
            }

            return currentValue !== originalValue;
        });

        return isModified ? "modified" : "unchanged";
    };
    // In EditBatch component
    const { mutateAsync: updateSupplierUnits } = api.inventory.updateSupplierUnits.useMutation();

    const handleSaveChanges = async () => {
        if (!itemData) return;

        try {
            setIsSaving(true);
            const updates = Object.values(inventoryCardRefs.current).map(async (cardRef) => {
                const cardData = cardRef.getStockData();

                // Validate batch variant existence
                if (!cardData.batchVariantId) {
                    throw new Error("Invalid batch variant ID");
                }

                // Get supplier ID from first existing unit or original data
                const baseSupplierId = cardData.originalUnits[0]?.supplierId ||
                    itemData.variant.BatchVariant[0]?.supplierUnits[0]?.supplier.supplier_id;

                if (!baseSupplierId) {
                    throw new Error("Could not determine supplier for this batch");
                }

                const unitsToUpdate = cardData.currentUnits.map((currentUnit, index) => {
                    const originalUnit = cardData.originalUnits[index] || {
                        stock: '0',
                        price: '0',
                        unit: '',
                        conversionQty: '0',
                        conversionUnit: ''
                    };
                    const status = getChangeStatus(currentUnit, originalUnit, index);

                    // Validation checks
                    if (isNaN(Number(currentUnit.stock)) || Number(currentUnit.stock) < 0) {
                        throw new Error("Stock must be a positive number.");
                    }
                    if (!/^\d*\.?\d+$/.test(currentUnit.price)) {
                        throw new Error("Price must be a valid positive number.");
                    }
                    if (!/^[a-zA-Z\s]+$/.test(currentUnit.unit)) {
                        throw new Error("Unit must contain only letters and spaces.");
                    }
                    if (currentUnit.conversionQty && (isNaN(Number(currentUnit.conversionQty)) || Number(currentUnit.conversionQty) < 0)) {
                        throw new Error("Conversion quantity must be a positive number.");
                    }
                    if (
                        (currentUnit.conversionQty && !currentUnit.conversionUnit) ||
                        (!currentUnit.conversionQty && currentUnit.conversionUnit)
                    ) {
                        throw new Error("Both conversion quantity and conversion unit must be provided.");
                    }
                    if (currentUnit.conversionUnit && !/^[a-zA-Z\s]+$/.test(currentUnit.conversionUnit)) {
                        throw new Error("Conversion unit must be selected from the list and contain only letters.");
                    }

                    return {
                        operation: status === "new" ? "create" as const
                            : status === "removed" ? "delete" as const
                                : "update" as const,
                        supplierUnitId: originalUnit?.supplierUnitId,
                        data: {
                            stock: currentUnit.stock,
                            price: currentUnit.price,
                            unit: currentUnit.unit,
                            conversionQty: currentUnit.conversionQty,
                            conversionUnit: currentUnit.conversionUnit,
                            supplierId: currentUnit.supplierId || baseSupplierId.toString()
                        }
                    };
                });

                // Handle units removed from the end
                const removedCount = cardData.originalUnits.length - cardData.currentUnits.length;
                if (removedCount > 0) {
                    const removedUnits = cardData.originalUnits
                        .slice(-removedCount)
                        .map(unit => ({
                            operation: "delete" as const,
                            supplierUnitId: unit.supplierUnitId,
                            data: {
                                stock: unit.stock,
                                price: unit.price,
                                unit: unit.unit,
                                conversionQty: unit.conversionQty,
                                conversionUnit: unit.conversionUnit,
                                supplierId: unit.supplierId || baseSupplierId.toString()
                            }
                        }));
                    unitsToUpdate.push(...removedUnits);
                }

                return updateSupplierUnits({
                    batchVariantId: cardData.batchVariantId,
                    units: unitsToUpdate
                });
            });

            await Promise.all(updates);
            setDialogMessage("Edit Batch saved successfully!");
            setDialogType("success");
            setIsDialogOpen(true);

            // Redirect to /admin/restock after success
            setTimeout(() => {
                router.push("/admin/inventory");
            }, 2000); // Delay redirect to let the user see the success message
        } catch (error) {
            console.error("Error Editing Batch.", error);
            setDialogMessage("Failed to Edit Batch.");
            setDialogType("error");
            setIsDialogOpen(true);
        }
    };


    // Combine loading and error states
    const isLoading = inventoryLoading || allLoading;
    const isError = inventoryError || allError;

    if (isLoading)
        return (
            <section className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </section>
        );
    if (isError)
        return (
            <section className="flex h-screen w-full items-center justify-center">
                <span>Error fetching data...</span>
            </section>
        );

    return (
        <section className="flex h-screen w-screen flex-col gap-3 overflow-hidden p-10 pb-0">
            <div className="flex items-center gap-1">
                {/* Dialog Component */}
                <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
                    <DialogContent className="max-h- flex w-full max-w-lg flex-col p-6">
                        <DialogTitle className="text-center">Status</DialogTitle>
                        <DialogHeader>
                            <div className="flex w-full justify-center text-center text-lg">
                                <span>{dialogMessage}</span>
                            </div>
                        </DialogHeader>

                        <div className="mt-4 flex w-full items-center justify-center gap-3">
                            <Button
                                size={"lg"}
                                className={`border-2 p-3 ${dialogType === "error" ? "border-red-500 bg-red-100 text-red-700" : "border-green-500 bg-green-100 text-green-700"}`}
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Close
                            </Button>
                            {dialogType === "success" && (
                                <Button
                                    size={"lg"}
                                    className="border-gray-300 text-gray-700 border-2 bg-white p-3 hover:bg-green"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Ok
                                </Button>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center gap-2">
                <ArrowLeft
                    size={25}
                    color="#FF7B7B"
                    className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
                    onClick={() => router.push("/admin/inventory")}
                />
                <span className="font-bold">
                    {itemData?.variant.item.name || "N/A"} -{" "}
                    {itemData?.variant.name || "N/A"} -{" "}
                    {itemData?.variant.item.brand.name || "N/A"}
                </span>
                <span className="text-gray-400 ml-3 text-sm font-light">{batchId}</span>
            </div>

            <Separator orientation="horizontal" />
            <div className="grid grid-cols-2 gap-4">
                {itemData?.variant.BatchVariant && itemData.variant.BatchVariant.length > 0 ? (
                    itemData.variant.BatchVariant.map((batchVariant: BatchVariant, index: number) => {
                        // console.log("Batch Variant: ", batchVariant);  // Log the structure of batchVariant here
                        // console.log("Supplier Units in Batch Variant: ", batchVariant?.batch?.batchVariants?.flatMap(b => b.SupplierUnit));
                        // console.log("Batch Variant: ", batchVariant);  // Check the structure here
                        return (
                            <InventoryCard
                                key={index}
                                ref={(el) => {
                                    if (el) {
                                        inventoryCardRefs.current[index] = el;
                                    }
                                }}
                                batch={batchVariant}
                                units={units}
                                item={itemData}
                                onRemove={() => {
                                    // Since this is an edit page, we don't need to implement removal
                                    // But we need to provide the handler to satisfy the type
                                }}
                            />
                        );
                    })
                ) : (
                    <div className="py-10 text-center">
                        <p className="text-gray-500 text-lg font-semibold">
                            No batch variants available
                        </p>
                    </div>
                )}
            </div>

            <div
                className="absolute bottom-0 right-0 z-[5] flex w-full items-center justify-end gap-3 bg-white px-10 py-5 pl-36 font-bold drop-shadow-2xl">
                <Button
                    size={"lg"}
                    onClick={handleSaveChanges}
                    className="bg-green py-8 text-sm font-bold"
                    disabled={isSaving} // Disable button while saving
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </section>
    );
};

export default EditBatch;

