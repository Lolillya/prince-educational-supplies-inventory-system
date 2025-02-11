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

    const inventoryIdAsNumber = Number(batchId);

    //old logic still working #333 the logic match  (variant.variant_id === inventoryIdAsNumber)
    // const {
    //     data: itemDataResponse,
    //     isLoading: itemLoading,
    //     isError: itemError,
    // } = api.inventory.getInventoryItem.useQuery(
    //     { id: inventoryIdAsNumber },
    //     { enabled: !isNaN(inventoryIdAsNumber) },
    // );

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
                    console.log("Matched BatchVariant for Variant:", matchedVariant);
                    setItemData(matchedVariant); // Set the matching variant in the state
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

    //old logic still working #333 the logic match (variant.variant_id === inventoryIdAsNumber)
    // useEffect(() => {
    //     if (itemDataResponse && inventoryIdAsNumber) {
    //         console.log("itemDataResponse:", itemDataResponse); // Log the full response
    //
    //         // Step 1: Find the inventory item by inventory_id to get the correct variant_id
    //         const matchedInventory = itemDataResponse.find((variant) => {
    //             console.log("Checking variant:", variant); // Log each variant
    //             console.log("Variant ID:", variant.variant_id);
    //
    //             // Check if this variant is associated with the correct inventory_id (inventoryIdAsNumber)
    //             if (variant.variant_id === inventoryIdAsNumber) {
    //                 console.log("Found matching variant:", variant)
    //                 return true; // Return this variant if it matches the inventory_id
    //             }
    //             return false; // No match
    //         });
    //
    //         // Step 2: If we found the correct variant, check the BatchVariant to validate the link
    //         if (matchedInventory) {
    //             console.log("Matched Inventory Variant:", matchedInventory);
    //
    //             // Now, check if this variant_id exists in the BatchVariant table
    //             const matchedBatchVariant = matchedInventory.BatchVariant.find((batchVariant) => {
    //                 console.log("Checking batch variant:", batchVariant);
    //                 console.log("Batch ID in BatchVariant:", batchVariant.batch_id);
    //
    //                 // If we find the matching batch_id, return the variant
    //                 if (batchVariant.variant_id === matchedInventory.variant_id) {
    //                     console.log("Found matching batch variant for variant_id:", batchVariant);
    //                     return true;
    //                 }
    //                 return false;
    //             });
    //
    //             // Step 3: Handle the result
    //             if (matchedBatchVariant) {
    //                 console.log("Matched BatchVariant for Variant:", matchedInventory);
    //                 setItemData(matchedInventory); // Set the matching variant in the state
    //             } else {
    //                 console.log("No matching batch variant found.");
    //                 setItemData(null); // Handle case when no batch variant is found
    //             }
    //         } else {
    //             console.log("No matching variant found for the given inventory_id.");
    //             setItemData(null); // Handle case when no matching variant is found
    //         }
    //     }
    // }, [itemDataResponse, inventoryIdAsNumber]); // Dependency on inventoryIdAsNumber to trigger effect when it changes
    //


    // useEffect(() => {
    //     console.log("itemDataResponse:", itemDataResponse); // Log full response
    //
    //     // Check if BatchVariant links are correctly mapped
    //     itemDataResponse?.forEach((variant) => {
    //         console.log("Variant ID:", variant.variant_id);
    //         console.log("Checking BatchVariant for variant_id:", variant.variant_id);
    //
    //         variant.BatchVariant.forEach((batchVariant) => {
    //             console.log("Batch Variant ID:", batchVariant.batch_variant_id);
    //             console.log("Batch ID in BatchVariant:", batchVariant.batch_id);
    //
    //             // Log the link to SupplierUnit and other relevant data
    //             if (batchVariant.supplierUnits?.length) {
    //                 batchVariant.supplierUnits.forEach((supplierUnit) => {
    //                     console.log("Supplier Unit ID:", supplierUnit.supplier_unit_id);
    //                     console.log("Unit Name:", supplierUnit.unit.name);
    //                     console.log("Price:", supplierUnit.price);
    //                 });
    //             }
    //         });
    //     });
    // }, [itemDataResponse]);



    useEffect(() => {
        if (allData) {
            // console.log("All Data:", allData); // Log all the fetched data
            setUnits(allData.units);
        }
    }, [allData]);


    const handleSaveChanges = () => {
        if (!itemData) {
            console.error("No inventory data available.");
            return;
        }

        console.log("===== Debugging Inventory Data =====");
        console.log("Inventory ID:", inventoryIdAsNumber);
        console.log("Full Item Data:", itemData);

        if (itemData.BatchVariant && itemData.BatchVariant.length > 0) {
            itemData.BatchVariant.forEach((batchVariant, index) => {
                console.log(`\n--- Batch Variant ${index + 1} ---`);
                console.log("Batch Variant ID:", batchVariant.batch_variant_id);
                console.log("Batch ID:", batchVariant.batch_id);

                // Extract supplier units, handling nested structure if necessary
                const supplierUnits = batchVariant?.batch?.batchVariants?.flatMap(
                    (b) => b.SupplierUnit
                );

                console.log("Supplier Units:", supplierUnits);

                if (supplierUnits && supplierUnits.length > 0) {
                    supplierUnits.forEach((supplierUnit, idx) => {
                        console.log(`\n--- Supplier Unit ${idx + 1} ---`);
                        console.log("Supplier Unit ID:", supplierUnit.supplier_unit_id);
                        console.log("Quantity per Unit:", supplierUnit.quantity_per_unit);
                        console.log("Price:", supplierUnit.price);
                        console.log("Unit Name:", supplierUnit.unit?.name || "N/A");
                    });
                } else {
                    console.log("No supplier units available for this batch variant.");
                }
            });
        } else {
            console.log("No batch variants available.");
        }
    };



    // const handleSaveChanges = () => {
    //     if (!itemData) {
    //         console.log("No inventory data available.");
    //         return;
    //     }
    //
    //     const batchIdAsNumber = Number(batchId);  // Convert batchId from URL to number
    //     if (isNaN(batchIdAsNumber)) {
    //         console.log("Invalid Batch ID. Cannot determine Inventory ID.");
    //         return;
    //     }
    //
    //     console.log("===== Inventory Details =====");
    //     console.log(`Inventory ID: ${batchIdAsNumber || "N/A"}`);
    //     console.log(`Variant ID: ${itemData.variant_id || "N/A"}`);
    //     console.log(`Item Name: ${itemData.item?.name || "N/A"}`);
    //     console.log(`Variant Name: ${itemData.name || "N/A"}`);
    //     console.log(`Brand Name: ${itemData.item?.brand?.name || "N/A"}`);
    //     console.log("-----------------------------\n");
    //
    //     console.log("Full itemData structure:", itemData); // Log the full itemData
    //     const batchVariants = itemData?.BatchVariant || [];
    //     console.log("BatchVariants:", batchVariants); // Log the batchVariants array
    //
    //     if (batchVariants.length > 0) {
    //         batchVariants.forEach((batchVariant, batchIndex) => {
    //             console.log(`===== Batch Variant ${batchIndex + 1} =====`);
    //             console.log(`Batch Variant ID: ${batchVariant.batch_variant_id || "N/A"}`);
    //             console.log(`Batch ID: ${batchVariant.batch_id || "N/A"}`);
    //             console.log(`Quantity: ${batchVariant.quantity || "N/A"}`);
    //
    //             // Access the 'batch' property inside 'batchVariant'
    //             const batch = batchVariant?.batch || {};
    //             console.log("Batch:", batch);
    //
    //             // Now access 'batchVariants' within the 'batch' object
    //             const batchVariantsArray = batch?.batchVariants || [];
    //             console.log("BatchVariants in batch:", batchVariantsArray);
    //
    //             // Check if 'batchVariantsArray' contains the data and proceed with 'SupplierUnit'
    //             if (batchVariantsArray.length > 0) {
    //                 batchVariantsArray.forEach((batchVariantItem, batchVariantIndex) => {
    //                     console.log(`--- Batch Variant Item ${batchVariantIndex + 1} ---`);
    //                     const supplierUnits = batchVariantItem?.SupplierUnit || [];
    //                     console.log("SupplierUnits in this batchVariant:", supplierUnits);
    //
    //                     if (supplierUnits.length > 0) {
    //                         supplierUnits.forEach((supplierUnit, supplierIndex) => {
    //                             console.log(`\n--- Supplier Unit ${supplierIndex + 1} ---`);
    //                             console.log(`Supplier Unit ID: ${supplierUnit.supplier_unit_id || "N/A"}`);
    //                             console.log(`Price: ${supplierUnit.price || "N/A"}`);
    //                             console.log(`Quantity per Unit: ${supplierUnit.quantity_per_unit || "N/A"}`);
    //
    //                             const unit = supplierUnit.unit || {};
    //                             console.log(`Unit: ${unit.name || "N/A"}`);
    //
    //                             // Log Conversion Rates if they exist
    //                             const conversions = supplierUnit.ConversionRate || [];
    //                             if (conversions.length > 0) {
    //                                 conversions.forEach((conversion, conversionIndex) => {
    //                                     console.log(`\nConversion ${conversionIndex + 1}`);
    //                                     console.log(`Conversion Rate: ${conversion.conversion_rate || "N/A"}`);
    //                                     console.log(`From Unit: ${conversion.fromUnit?.name || "N/A"}`);
    //                                     console.log(`To Unit: ${conversion.toUnit?.name || "N/A"}`);
    //                                 });
    //                             } else {
    //                                 console.log("No conversion rates available.");
    //                             }
    //
    //                             // Supplier Information
    //                             const supplierName = `${supplierUnit.supplier?.Personal_Details?.first_name || "Unknown"} ${supplierUnit.supplier?.Personal_Details?.last_name || ""}`;
    //                             console.log(`Supplier: ${supplierName.trim()}`);
    //                         });
    //                     } else {
    //                         console.log("No supplier units available for this batch variant.");
    //                     }
    //                 });
    //             } else {
    //                 console.log("No batch variants available in the batch.");
    //             }
    //
    //             console.log("---------------------------\n");
    //         });
    //     } else {
    //         console.log("No batch variants available to log.");
    //     }
    // };


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

            {/*<div className="grid grid-cols-2 gap-4">*/}
            {/*    {itemData?.BatchVariant && itemData.BatchVariant.length > 0 ? (*/}
            {/*        itemData.BatchVariant.map((batchVariant) => {*/}
            {/*            // Extract supplierUnits directly from the batchVariant*/}
            {/*            const supplierUnits = batchVariant?.batch?.batchVariants?.flatMap(*/}
            {/*                (b) => b.SupplierUnit*/}
            {/*            );*/}

            {/*            console.log("Batch Variant: ", batchVariant);*/}
            {/*            console.log("Supplier Units in Batch Variant: ", supplierUnits);*/}

            {/*            return (*/}
            {/*                <InventoryCard*/}
            {/*                    key={batchVariant.batch_variant_id}*/}
            {/*                    batch={batchVariant} // Pass batchVariant to InventoryCard*/}
            {/*                    supplierUnits={supplierUnits || []} // Pass extracted supplier units*/}
            {/*                    units={units} // Existing prop*/}
            {/*                    item={itemData} // Existing prop*/}
            {/*                />*/}
            {/*            );*/}
            {/*        })*/}
            {/*    ) : (*/}
            {/*        <div className="py-10 text-center">*/}
            {/*            <p className="text-gray-500 text-lg font-semibold">*/}
            {/*                No batch variants available*/}
            {/*            </p>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</div>*/}


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


