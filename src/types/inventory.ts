import type { Batch, BatchVariant as PrismaBatchVariant } from "@prisma/client";

export interface Unit {
  unit_id: number;
  name: string;
  conversion_rate: string;
  created_at: Date;
  updated_at: Date;
}

export interface Brand {
  brand_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  category_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Item {
  item_id: number;
  name: string;
  description: string | null;
  brand_id: number;
  category_id: number;
  created_at: Date;
  updated_at: Date;
  discount_id: number | null;
  brand: Brand;
  category: Category;
}

interface ConversionRate {
  conversion_id: string;
  conversion_rate: number;
  fromUnit?: { name: string };
  toUnit?: { name: string };
}

interface SupplierUnit {
  supplier_unit_id: string;
  quantity_per_unit: number;
  price: number;
  unit?: { name: string };
  ConversionRate?: ConversionRate[];
  supplier?: {
    Personal_Details?: {
      first_name: string;
      last_name: string;
    };
  };
}

interface BatchVariant {
  batch_variant_id: number;
  variant_id: number;
  quantity: number;
  batch: {
    batch_id: number;
    batch_number: number;
    quantity: number;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    restock_clerk: string;
    batchVariants: {
      batch_variant_id: number;
      SupplierUnit: {
        supplier_unit_id: number;
        quantity_per_unit: number;
        price: number;
        unit: { name: string };
        ConversionRate: {
          conversion_id: number;
          conversion_rate: number;
          fromUnit: { name: string };
          toUnit: { name: string };
        }[];
      }[];
    }[];
  };
}

export interface Variant {
  variant_id: number;
  item_id: number;
  unit?: Unit;
  item: Item;
  name?: string;
  description?: string | null;
  Batch?: Batch[];
  BatchVariant: BatchVariant[];
  StockLevel: {
    low_stock: number;
    very_low_stock: number;
  } | null;
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
