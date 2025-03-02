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

interface BatchVariantWithSupplierUnit extends PrismaBatchVariant {
  batch: {
    batch_id: number;
    batch_number: string;
  };
  SupplierUnit?: SupplierUnit[];
}

interface BatchVariant extends BatchVariantWithSupplierUnit {
  batch: {
    batch_id: number;
    batch_number: string;
  };
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
