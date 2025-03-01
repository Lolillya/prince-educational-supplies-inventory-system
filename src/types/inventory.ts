import type { Batch, BatchVariant as PrismaBatchVariant } from "@prisma/client";

export interface Unit {
  unit_id: number;
  name: string;
  conversion_rate: string;
}

export interface Brand {
  brand_id: number;
  name: string;
}

export interface Category {
  category_id: number;
  name: string;
}

export interface Item {
  item_id: number;
  name: string;
  description: string;
  brand: Brand;
  category: Category;
}

interface SupplierUnit {
  supplier_unit_id: number;
  unit: Unit;
}

interface BatchVariantWithSupplierUnit {
  batch_variant_id: number;
  variant_id: number;
  quantity: number;
  SupplierUnit?: SupplierUnit[];
}

interface BatchWithVariants {
  batch_id: number;
  batch_number: string;
  batchVariants: BatchVariantWithSupplierUnit[];
}

interface BatchVariant extends PrismaBatchVariant {
  batch: BatchWithVariants;
}

export interface Variant {
  variant_id: number;
  item_id: number;
  unit: Unit;
  item: Item;
  name?: string;
  description?: string;
  Batch: Batch[];
  BatchVariant: BatchVariant[];
}

export interface InventoryItem {
  inventory_id: number;
  variant_id: number;
  quantity: number;
  inventory_number: number;
  variant: Variant;
}

// Additional type for the props interface used in components
export interface InventoryItemInfoProps {
  inventoryItems: InventoryItem[];
}
