"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import InventoryCard from "../../_components/inventory-card";
import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { LoadingSpinner } from "~/components/loading";

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
    batch_variant_id: number;
    batch_id: number;
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
    const [itemData, setItemData] = useState<InventoryItem | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);

    const batchIdAsNumber = Number(batchId);

    const {
        data: itemDataResponse,
        isLoading: itemLoading,
        isError: itemError,
    } = api.inventory.getInventoryItem.useQuery(
        { id: batchIdAsNumber },
        { enabled: !isNaN(batchIdAsNumber) },
    );

    const {
        data: allData,
        isLoading: allLoading,
        isError: allError,
    } = api.inventory.listAllData.useQuery();

    // // Effect to set item data
    // useEffect(() => {
    //     if (itemDataResponse) {
    //         setItemData(itemDataResponse);
    //     }
    // }, [itemDataResponse]);

    useEffect(() => {
        if (itemDataResponse) {
            setItemData(itemDataResponse);

            // Find the specific variant that matches the `batchId`
            const matchingVariant = itemDataResponse.find((variant) =>
                variant.BatchVariant.some((batch) => batch.batch_id === batchIdAsNumber)
            );

            setItemData(matchingVariant || null);
        }
    }, [itemDataResponse, batchIdAsNumber]);


    useEffect(() => {
        if (allData) {
            setUnits(allData.units);
        }
    }, [allData]);

    const handleSaveChanges = () => {
        if (!itemData) {
            console.log("No inventory data available.");
            return;
        }

        const batchIdAsNumber = Number(batchId);  // Convert batchId from URL to number
        if (isNaN(batchIdAsNumber)) {
            console.log("Invalid Batch ID. Cannot determine Inventory ID.");
            return;
        }

        console.log("===== Inventory Details =====");
        console.log(`Inventory ID: ${batchIdAsNumber || "N/A"}`);
        console.log(`Variant ID: ${itemData.variant_id || "N/A"}`);
        console.log(`Item Name: ${itemData.item?.name || "N/A"}`);
        console.log(`Variant Name: ${itemData.name || "N/A"}`);
        console.log(`Brand Name: ${itemData.item?.brand?.name || "N/A"}`);
        console.log("-----------------------------\n");

        console.log("Full itemData structure:", itemData); // Log the full itemData
        const batchVariants = itemData?.BatchVariant || [];
        console.log("BatchVariants:", batchVariants); // Log the batchVariants array

        if (batchVariants.length > 0) {
            batchVariants.forEach((batchVariant, batchIndex) => {
                console.log(`===== Batch Variant ${batchIndex + 1} =====`);
                console.log(`Batch Variant ID: ${batchVariant.batch_variant_id || "N/A"}`);
                console.log(`Batch ID: ${batchVariant.batch_id || "N/A"}`);
                console.log(`Quantity: ${batchVariant.quantity || "N/A"}`);

                // Access the 'batch' property inside 'batchVariant'
                const batch = batchVariant?.batch || {};
                console.log("Batch:", batch);

                // Now access 'batchVariants' within the 'batch' object
                const batchVariantsArray = batch?.batchVariants || [];
                console.log("BatchVariants in batch:", batchVariantsArray);

                // Check if 'batchVariantsArray' contains the data and proceed with 'SupplierUnit'
                if (batchVariantsArray.length > 0) {
                    batchVariantsArray.forEach((batchVariantItem, batchVariantIndex) => {
                        console.log(`--- Batch Variant Item ${batchVariantIndex + 1} ---`);
                        const supplierUnits = batchVariantItem?.SupplierUnit || [];
                        console.log("SupplierUnits in this batchVariant:", supplierUnits);

                        if (supplierUnits.length > 0) {
                            supplierUnits.forEach((supplierUnit, supplierIndex) => {
                                console.log(`\n--- Supplier Unit ${supplierIndex + 1} ---`);
                                console.log(`Supplier Unit ID: ${supplierUnit.supplier_unit_id || "N/A"}`);
                                console.log(`Price: ${supplierUnit.price || "N/A"}`);
                                console.log(`Quantity per Unit: ${supplierUnit.quantity_per_unit || "N/A"}`);

                                const unit = supplierUnit.unit || {};
                                console.log(`Unit: ${unit.name || "N/A"}`);

                                // Log Conversion Rates if they exist
                                const conversions = supplierUnit.ConversionRate || [];
                                if (conversions.length > 0) {
                                    conversions.forEach((conversion, conversionIndex) => {
                                        console.log(`\nConversion ${conversionIndex + 1}`);
                                        console.log(`Conversion Rate: ${conversion.conversion_rate || "N/A"}`);
                                        console.log(`From Unit: ${conversion.fromUnit?.name || "N/A"}`);
                                        console.log(`To Unit: ${conversion.toUnit?.name || "N/A"}`);
                                    });
                                } else {
                                    console.log("No conversion rates available.");
                                }

                                // Supplier Information
                                const supplierName = `${supplierUnit.supplier?.Personal_Details?.first_name || "Unknown"} ${supplierUnit.supplier?.Personal_Details?.last_name || ""}`;
                                console.log(`Supplier: ${supplierName.trim()}`);
                            });
                        } else {
                            console.log("No supplier units available for this batch variant.");
                        }
                    });
                } else {
                    console.log("No batch variants available in the batch.");
                }

                console.log("---------------------------\n");
            });
        } else {
            console.log("No batch variants available to log.");
        }
    };


    // const handleSaveChanges = () => {
    //     if (itemData?.variant?.BatchVariant) {
    //         itemData.variant.BatchVariant.forEach((batchVariant) => {
    //             console.log("----- Batch Variant Details -----");
    //             console.log(`Batch Variant ID: ${batchVariant.batch_variant_id}`);
    //             console.log(`Batch ID: ${batchVariant.batch_id}`);
    //
    //             if (batchVariant.supplierUnits.length > 0) {
    //                 batchVariant.supplierUnits.forEach((supplierUnit, index) => {
    //                     console.log(`\n--- Supplier Unit ${index + 1} ---`);
    //                     console.log(`Stock: ${supplierUnit.quantity_per_unit}`);
    //                     console.log(`Price: ${supplierUnit.price}`);
    //                     console.log(`Unit: ${supplierUnit.unit?.name || "N/A"}`);
    //
    //                     if (supplierUnit.ConversionRate.length > 0) {
    //                         supplierUnit.ConversionRate.forEach((conversion) => {
    //                             console.log(`Conversion Rate: ${conversion.conversion_rate}`);
    //                             console.log(`From Unit: ${conversion.fromUnit?.name || "N/A"}`);
    //                             console.log(`To Unit: ${conversion.toUnit?.name || "N/A"}`);
    //                         });
    //                     } else {
    //                         console.log("Conversion Rate: N/A");
    //                     }
    //
    //                     console.log(
    //                         `Supplier Name: ${
    //                             supplierUnit.supplier?.Personal_Details?.first_name || "Unknown"
    //                         } ${
    //                             supplierUnit.supplier?.Personal_Details?.last_name || "Supplier"
    //                         }`
    //                     );
    //                 });
    //             } else {
    //                 console.log("No supplier units available for this batch variant.");
    //             }
    //
    //             console.log("---------------------------\n");
    //         });
    //     } else {
    //         console.log("No batch variants available to save.");
    //     }
    // };

    // Combine loading and error states
    const isLoading = itemLoading || allLoading;
    const isError = itemError || allError;

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
            <div className="flex items-center gap-2">
                <ArrowLeft
                    size={25}
                    color="#FF7B7B"
                    className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
                    onClick={() => router.push("/admin/inventory")}
                />
                <span className="font-bold">
                    {itemData?.item?.name || "N/A"} -{" "}
                    {itemData?.name || "N/A"} -{" "}
                    {itemData?.item?.brand?.name || "N/A"}
                </span>
                <span className="text-gray-400 ml-3 text-sm font-light">{batchId}</span>
            </div>

            <Separator orientation="horizontal"/>
            <div className="grid grid-cols-2 gap-4">
                {itemData?.BatchVariant && itemData.BatchVariant.length > 0 ? (
                    itemData.BatchVariant.map((batchVariant) => {
                        // console.log("Batch Variant: ", batchVariant);  // Log the structure of batchVariant here
                        // console.log("Supplier Units in Batch Variant: ", batchVariant?.batch?.batchVariants?.flatMap(b => b.SupplierUnit));
                        // console.log("Batch Variant: ", batchVariant);  // Check the structure here
                        return (
                            <InventoryCard
                                key={batchVariant.batch_variant_id}
                                batch={batchVariant}  // Ensure this contains valid supplierUnits data
                                units={units}
                                item={itemData}
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
                >
                    Save Changes
                </Button>
            </div>
        </section>
    );
};

export default EditBatch;
