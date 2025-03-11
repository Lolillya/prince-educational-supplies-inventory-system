import { TooltipContent } from '@radix-ui/react-tooltip'
import { AlertCircle, ArrowLeft, ArrowUpRight, Box, Hash } from 'lucide-react'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import { useRouter } from "next/navigation"
import React, { useState } from 'react'
import UnitLine from "~/app/(protected)/admin/restock/_components/unit-line"
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card"
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import RecordEditor from '../../_components/record-editor'
import AddBatchLine from './add-batch-line'
import BatchLineItem from './batch-line-item'
import OutToOffice from './out-to-office'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface BatchVariant {
  batch_variant_id: string;
  variant_id: number; // Add missing field
  quantity: number;
  SupplierUnit?: {
    supplier_unit_id: string;
    quantity_per_unit: number;
    price: number;
    ConversionRate?: {
      conversion_id: string;
      conversion_rate: number;
      fromUnit?: { name: string };
      toUnit?: { name: string };
    }[];
    unit?: { name: string };
  }[];
  batch: {
    batch_id: string;
    batch_number: string;
    batchVariants?: {
      batch_variant_id: string;
      SupplierUnit?: {
        supplier_unit_id: string;
        quantity_per_unit: number;
        price: number;
        unit?: { name: string };
        ConversionRate?: {
          conversion_id: string;
          conversion_rate: number;
          fromUnit?: { name: string };
          toUnit?: { name: string };
        }[];
      }[];
    }[];
  };
}

interface InventoryBatchProps {
  restockId: number;
  date: string;
  employee: string;
  addedStock: number;
  restockData?: any;
  batchVariants: BatchVariant[];
  selectedVariantId: number;
  onVerifyPassword: (password: string) => Promise<boolean>;
  inventoryNumber: string;
}


interface Unit {
  supplier_id: string;
  unit_name: string;
  quantity_per_unit: number;
}

const InventoryBatch = ({ batchVariants, selectedVariantId, onVerifyPassword, inventoryNumber }: InventoryBatchProps) => {

  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedBatchNumber, setSelectedBatchNumber] = useState<number | null>(null);
  const [showAllBatches, setShowAllBatches] = useState(false);
  const shouldShowMore = batchVariants.length > 2;
  const visibleBatches = showAllBatches ? batchVariants : batchVariants.slice(0, 2);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const selectedBatch = selectedBatchNumber
    ? batchVariants[selectedBatchNumber - 1]
    : null;

  // Access the first SupplierUnit for the selected batchVariant
  const mainSupplierUnit = selectedBatch?.batch?.batchVariants
    ?.find((bv) => bv.batch_variant_id === selectedBatch.batch_variant_id)
    ?.SupplierUnit?.[0];

  // Debugging: Log selectedBatch and mainSupplierUnit
  console.log("Selected Batch:", selectedBatch);
  console.log("Main Supplier Unit:", mainSupplierUnit);

  // Fetch unitName, stockQuantity, and unitPrice with proper fallbacks
  const unitName = mainSupplierUnit?.unit?.name ?? 'N/A';
  const stockQuantity = mainSupplierUnit?.quantity_per_unit ?? 0;
  const unitPrice = mainSupplierUnit?.price ?? 0;

  // Debugging: Log fetched values
  console.log("Unit Name:", unitName);
  console.log("Stock Quantity:", stockQuantity);
  console.log("Unit Price:", unitPrice);

  const handlePasswordVerification = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!password) {
      setPasswordError("Please enter your password to confirm.");
      return;
    }

    try {
      const isValid = await onVerifyPassword(password);
      if (!isValid) {
        setPasswordError("Incorrect password.");
        return;
      }

      setPasswordError(null);
      setIsPasswordVerified(true);
      setIsPasswordDialogOpen(false);
      router.push(`/admin/inventory/edit-batch/${inventoryNumber}`);
    } catch (error) {
      setPasswordError("Failed to verify password. Please try again.");
    }
  };


  const handleEdit = () => {
    setIsEditing((prev) => !prev);
    setShowWarning(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isEditing) {
      setShowWarning(true);
      event.preventDefault();
    }
  };

  const handleBatchClick = (batchNumber: number) => {
    setSelectedBatchNumber(batchNumber);
  };

  const handleShowMore = () => {
    setShowAllBatches((prev) => !prev);
  };
  return (
    <div className="rounded-lg bg-white/60 p-5 text-slate-400">
      <div className="flex items-center justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Link href={""}>
              <div className="flex w-fit items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500">
                Batches
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </Link>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="text-center font-bold">
              Verify it's you!
            </DialogTitle>

            <div className="flex flex-col gap-1">
              <Label className="text-textGray">Password</Label>
              <Input
                className="bg-slate-100 text-slate-700 shadow-none"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 mt-1">
                <AlertCircle className="text-rose-500 w-5 h-5" />
                <p className="text-rose-500">{passwordError}</p>
              </div>
            )}
            <div className="flex justify-center gap-3">
              <Button
                size={"lg"}
                onClick={handlePasswordVerification}
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <p className="pr-5 text-sm text-slate-400">
          {visibleBatches.length} of {batchVariants.length} Batches
        </p>
      </div>
      <div className="mt-2">
        <div className="flex flex-col gap-1">
          {/* //TODO: map restock data based on selected supplier */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                if (isEditing) {
                  setShowWarning(true);
                  return;
                }
              }
              setIsDialogOpen(open);
              if (!open) {
                setShowWarning(false);
              }
            }}
          >
            <DialogTrigger>
              {visibleBatches.map((batchVariant, index) => {
                // First, get the raw supplier units with their conversion rates
                const rawSupplierUnits = batchVariant.batch?.batchVariants
                  ?.filter((bv) => bv.batch_variant_id === batchVariant.batch_variant_id)
                  .flatMap((bv) => bv.SupplierUnit || []) || [];

                // Transform supplier units
                const supplierUnits = rawSupplierUnits.map(unit => ({
                  supplier_unit_id: parseInt(unit.supplier_unit_id),
                  batch_variant_id: 0,
                  supplier_id: "",
                  unit_id: 0,
                  price: unit.price,
                  quantity_per_unit: unit.quantity_per_unit,
                  total_quantity: 0,
                  discount_id: null,
                  created_at: new Date(),
                  updated_at: new Date()
                }));

                // Transform conversion rates separately using the raw data
                const unitConversions = rawSupplierUnits.flatMap(
                  (unit) => (unit.ConversionRate || []).map(conversion => ({
                    supplier_unit_id: parseInt(unit.supplier_unit_id),
                    created_at: new Date(),
                    updated_at: new Date(),
                    conversion_id: parseInt(conversion.conversion_id),
                    from_unit_id: 0,
                    to_unit_id: 0,
                    conversion_rate: conversion.conversion_rate
                  }))
                );

                return (
                  <InventoryBatchCard
                    key={batchVariant.batch_variant_id}
                    batchVariant={batchVariant}
                    batchNumber={index + 1}
                    onClick={() => handleBatchClick(index + 1)}
                    supplierUnit={supplierUnits}
                    unitConversion={unitConversions}
                  />
                );
              })}
            </DialogTrigger>
            <DialogContent
              className="!w-full !max-w-2xl [&>button]:hidden"
              onKeyDown={handleKeyDown}
            >
              <DialogHeader
                className={`text-xl ${poppins.className} font-normal`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <DialogTitle className="text-xl font-normal text-slate-700">
                      <span>
                        {selectedBatchNumber
                          ? `Batch ${selectedBatchNumber}`
                          : "Batch Details"}
                      </span>
                    </DialogTitle>
                    <div className="flex items-center gap-3 text-slate-400">
                      <Hash className="h-4 w-4" />
                      <DialogDescription className="text-sm tracking-wide">
                        {selectedBatchNumber !== null
                          ? batchVariants[selectedBatchNumber - 1]?.batch?.batch_number || "N/A"
                          : "N/A"
                        }
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <RecordEditor
                      isEditing={isEditing}
                      handleEdit={handleEdit}
                    />
                  </div>
                </div>
              </DialogHeader>

              <Separator orientation="horizontal" className="h-[2px]" />

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="group flex w-1/2 flex-col gap-2">
                    <Label className="text-slate-400">Unit</Label>
                    <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
                      <Input
                        className="bg-slate-100 text-slate-700 shadow-none"
                        disabled={!isEditing}
                        defaultValue={unitName}
                      />{" "}
                      {/** Please pass real data here */}
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-14 w-[1px]" />
                  <div className="group flex w-1/2 items-end gap-2">
                    <div className="flex w-1/2 flex-col gap-1">
                      <Label className="text-slate-400">Stock</Label>
                      <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
                        <Input
                          className="bg-slate-100 text-slate-700 shadow-none"
                          disabled={!isEditing}
                          defaultValue={stockQuantity}
                        />
                      </div>
                    </div>
                    <div className="flex w-1/2 flex-col gap-1">
                      <Label className="text-slate-400">Price per unit</Label>
                      <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">
                        <Input
                          className="bg-slate-100 text-slate-700 shadow-none"
                          disabled={!isEditing}
                          defaultValue={unitPrice}
                        />
                      </div>
                    </div>
                    <div className="flex h-10 w-12 items-center justify-center !p-1">
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <ArrowLeft
                              className="!h-5 !w-5 text-slate-400"
                              strokeWidth={2.5}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="my-4 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-none">
                            This is your main unit.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
                <div className="border-b-[3px] border-dashed border-slate-200" />
                {/*<ScrollArea className='h-52'>*/}
                {/*	<div className="flex flex-col gap-4">*/}
                {/*		<BatchLineItem isEditing={isEditing} />*/}
                {/*		<BatchLineItem isEditing={isEditing} />*/}
                {/*		{isEditing && (*/}
                {/*			<AddBatchLine />*/}
                {/*		)}*/}
                {/*	</div>*/}
                {/*</ScrollArea>*/}
                {/* Inside DialogContent -> ScrollArea */}
                <ScrollArea className="h-52">
                  <div className="flex flex-col gap-4">
                    {selectedBatch?.batch?.batchVariants
                      ?.find((bv) => bv.batch_variant_id === selectedBatch.batch_variant_id)
                      ?.SupplierUnit?.map((supplierUnit) =>
                        supplierUnit.ConversionRate?.map((conversion) => (
                          <BatchLineItem
                            key={`${supplierUnit.supplier_unit_id}-${conversion.conversion_id}`}
                            isEditing={isEditing}
                            conversionQty={typeof conversion.conversion_rate === 'number' ? conversion.conversion_rate : undefined}
                            conversionUnit={conversion.toUnit?.name || 'N/A'}
                            stock={typeof supplierUnit.quantity_per_unit === 'number' ? supplierUnit.quantity_per_unit : undefined}
                            price={typeof supplierUnit.price === 'number' ? supplierUnit.price : undefined}
                            mainUnit={supplierUnit.unit?.name || 'N/A'}
                          />
                        ))
                      )}
                    {isEditing && <AddBatchLine />}
                  </div>
                </ScrollArea>
              </div>

              <Separator orientation="horizontal" className="h-[2px]" />

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-base font-normal text-slate-700">
                    {selectedBatchNumber
                      ? (batchVariants[selectedBatchNumber - 1]?.quantity ??
                        "N/A")
                      : "N/A"}
                  </p>
                  <p className="text-sm text-slate-400">Remaining Stock</p>
                </div>
                <div className="flex items-center gap-2">
                  <DialogClose asChild disabled={isEditing}>
                    <Button
                      variant="secondary"
                      className="text-slate-700 hover:bg-slate-200"
                      disabled={isEditing}
                    >
                      Close
                    </Button>
                  </DialogClose>
                  <OutToOffice isEditing={isEditing} />
                </div>
              </div>
              {showWarning && (
                <p className="text-right text-sm text-orange-400">
                  Whoops! Don't forget to save your changes.
                </p>
              )}
            </DialogContent>
          </Dialog>
          <Separator orientation="horizontal" className="h-[1px]" />
        </div>
      </div>
      {shouldShowMore && (
        <div className="mt-4">
          <p
            className="cursor-pointer text-center hover:underline"
            onClick={handleShowMore}
          >
            {showAllBatches ? "Show less" : "Show more"}
          </p>
        </div>
      )}
    </div>
  );
}

interface InventoryBatchCardProps {
  batchVariant: BatchVariant;
  batchNumber: number;
  onClick: () => void;
  supplierUnit: {
    supplier_unit_id: number;
    batch_variant_id: number;
    supplier_id: string;
    unit_id: number;
    price: number;
    quantity_per_unit: number;
    total_quantity: number;
    discount_id: number | null;
    created_at: Date;
    updated_at: Date;
  }[];
  unitConversion: {
    supplier_unit_id: number;
    created_at: Date;
    updated_at: Date;
    conversion_id: number;
    from_unit_id: number;
    to_unit_id: number;
    conversion_rate: number;
  }[];
}

const InventoryBatchCard = ({
  batchVariant,
  batchNumber,
  onClick,
  supplierUnit,
  unitConversion,
}: InventoryBatchCardProps) => {
  // Get the main first supplier unit
  const mainSupplierUnit = supplierUnit[0];

  // Get the raw supplier unit data for the unit names and conversions
  const rawSupplierUnits = batchVariant.batch?.batchVariants
    ?.filter((bv) => bv.batch_variant_id === batchVariant.batch_variant_id)
    .flatMap((bv) => bv.SupplierUnit || []) || [];

  const rawSupplierUnit = rawSupplierUnits[0];

  return (
    <div
      className='p-5 flex flex-col gap-4 hover:bg-slate-200/50 rounded-lg cursor-pointer transition-all duration-300'
      onClick={onClick}
    >
      <p className='text-slate-600 text-left'>Batch {batchNumber}</p>
      <div className="flex items-center gap-3 flex-grow overflow-hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Hash className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent
              className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
              From restock record {batchVariant.batch?.batch_number || 'N/A'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-sm truncate">
          {/*ID: {batchVariant.batch?.batch_id || 'N/A'}, Code: */}
          {batchVariant.batch?.batch_number || 'N/A'}
        </p>
      </div>
      <div className="flex items-center gap-4 text-slate-400">
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Box className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent
                className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
                {batchVariant.quantity ?? 'N/A'} remaining stock
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-sm">
            {mainSupplierUnit?.quantity_per_unit} {/*{rawSupplierUnit?.unit?.name || 'N/A'}*/}
          </p>
          <Separator
            orientation="vertical"
            className="h-6 w-[2px] bg-slate-200"
          />
          <div className="flex items-center gap-3 text-slate-400">
            <HoverCard>
              <HoverCardTrigger className="text-sm hover:underline">
                {unitConversion.length} Conversions
              </HoverCardTrigger>
              <HoverCardContent className="flex flex-col gap-3 shadow-none">
                {rawSupplierUnits.flatMap((unit) =>
                  (unit.ConversionRate || []).map((conversion, index) => (
                    <UnitLine
                      key={`${unit.supplier_unit_id}-${conversion.conversion_id}-${index}`}
                      from={conversion.fromUnit?.name || 'N/A'}
                      count={conversion.conversion_rate}
                      to={conversion.toUnit?.name || 'N/A'}
                      price={unit.price}
                    />
                  ))
                )}
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryBatch