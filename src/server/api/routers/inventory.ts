// ~/server/api/inventory.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

// TypeScript types for preset conversions with related prices
type ProcessedPresetConversion = {
  preset_conversion_id: number;
  preset_id: number;
  conversion_rate: number;
  from_unit_id: number;
  to_unit_id: number;
  created_at: Date;
  updated_at: Date;
  from_unit: {
    name: string;
    created_at: Date;
    updated_at: Date;
    unit_id: number;
  };
  to_unit: {
    name: string;
    created_at: Date;
    updated_at: Date;
    unit_id: number;
  };
  related_price?: number | null;
};

type ProcessedPreset = {
  preset_id: number;
  item_id: number;
  main_unit_id: number;
  main_price: number;
  created_at: Date;
  updated_at: Date;
  main_unit: {
    name: string;
    created_at: Date;
    updated_at: Date;
    unit_id: number;
  };
  conversions: ProcessedPresetConversion[];
};

const normalizeInput = (value: any) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const itemSchema = z.object({
  name: z
    .string()
    .min(1, "Item name is required")
    .max(100, "Item name must be at most 100 characters long")
    .transform(normalizeInput),
  brandId: z.number().int().positive("Brand ID must be a positive integer"),
  categoryId: z
    .number()
    .int()
    .positive("Category ID must be a positive integer"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters long")
    .optional()
    .transform(normalizeInput),
});

const variantSchema = z.object({
  itemId: z.number().int().positive("Item ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Variant name is required")
    .max(100, "Variant name must be at most 100 characters long")
    .transform(normalizeInput),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters long")
    .optional()
    .transform(normalizeInput),
});

const inventorySchema = z.object({
  variantId: z.number().int().positive("Variant ID must be a positive integer"),
  quantity: z.number().int().min(0, "Quantity must be at least 0"),
});

export const inventoryRouter = createTRPCRouter({
  listInventory: publicProcedure.query(async () => {
    const inventory = await db.inventory.findMany({
      include: {
        variant: {
          include: {
            item: {
              include: {
                brand: true,
                category: true,
              },
            },
            BatchVariant: {
              include: {
                batch: {
                  include: {
                    batchVariants: {
                      include: {
                        SupplierUnit: {
                          include: {
                            supplier: {
                              include: {
                                Personal_Details: true,
                              },
                            },
                            unit: true,
                            ConversionRate: {
                              select: {
                                conversion_rate: true,
                                fromUnit: {
                                  select: {
                                    name: true,
                                  },
                                },
                                toUnit: {
                                  select: {
                                    name: true,
                                  },
                                },
                                supplierUnit: {
                                  select: {
                                    price: true,
                                  },
                                }, // Include price
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            StockLevel: true,
          },
        },
      },
      orderBy: {
        inventory_id: "desc",
      },
    });
    console.log(inventory);
    return inventory;
  }),

  getInventoryItem: publicProcedure
    .input(z.object({ id: z.number() })) // Using inventory_number as input
    .query(async ({ input }) => {
      // Find the inventory record based on inventory_number
      const inventoryRecord = await db.inventory.findUnique({
        where: { inventory_number: input.id },
        include: {
          variant: {
            include: {
              item: {
                include: {
                  brand: true,
                  category: true,
                  variants: true,
                },
              },
              StockLevel: true,
              BatchVariant: {
                include: {
                  batch: {
                    include: {
                      batchVariants: {
                        include: {
                          SupplierUnit: {
                            include: {
                              supplier: {
                                include: {
                                  Personal_Details: true,
                                },
                              },
                              unit: true,
                              ConversionRate: {
                                select: {
                                  conversion_id: true,
                                  conversion_rate: true,
                                  fromUnit: true,
                                  toUnit: true,
                                },
                              },
                            },
                            orderBy: { supplier_unit_id: "asc" }, // Ordering SupplierUnit
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!inventoryRecord) {
        return null;
      }

      return inventoryRecord;
    }),

  listAllData: publicProcedure.query(async () => {
    try {
      const [brands, categories, units, items] = await Promise.all([
        db.brand.findMany(),
        db.category.findMany(),
        db.unit.findMany(),
        db.item.findMany({
          include: {
            brand: true,
            category: true,
            variants: {
              include: {
                StockLevel: true,
              },
            },
          },
        }),
      ]);

      const variants = items.flatMap((item) =>
        item.variants.map((variant) => ({
          ...variant,
          StockLevel: variant.StockLevel,
        })),
      );

      return { brands, categories, units, items, variants };
    } catch (error) {
      console.error("Error listing all data:", error);
      throw new Error("Failed to retrieve data.");
    }
  }),

  getItemId: publicProcedure.query(async () => {
    try {
      const lastItem = await db.inventory.findFirst({
        orderBy: { inventory_id: "desc" },
        select: { inventory_id: true },
      });

      const nextItemId = lastItem ? lastItem.inventory_id + 1 : 1;
      return nextItemId;
    } catch (error) {
      console.error("Error fetching inventory_id:", error);
      throw new Error("Failed to fetch inventory_id.");
    }
  }),

  createBrand: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const brand = await db.brand.create({
        data: { name: input.name },
      });
      return brand;
    }),

  createCategory: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const category = await db.category.create({
        data: { name: input.name },
      });
      return category;
    }),

  createItem: publicProcedure
    .input(
      z.object({
        name: z.string(),
        brand_id: z.number(),
        category_id: z.number(),
        description: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const item = await db.item.create({
        data: {
          name: input.name,
          brand_id: input.brand_id,
          category_id: input.category_id,
          description: input.description,
        },
      });
      return item;
    }),

  updateItem: publicProcedure
    .input(
      z.object({
        item_id: z.number(),
        name: z.string().optional(),
        brand_id: z.number().optional(),
        category_id: z.number().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { item_id, name, brand_id, category_id, description } = input;

      const updatedItem = await db.item.update({
        where: {
          item_id: item_id,
        },
        data: {
          name: name ?? undefined,
          brand_id: brand_id ?? undefined,
          category_id: category_id ?? undefined,
          description: description ?? undefined,
        },
      });

      return updatedItem;
    }),

  updateVariant: publicProcedure
    .input(
      z.object({
        variantId: z.number(),
        name: z.string(),
        lowStock: z.number(),
        veryLowStock: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { variantId, name, lowStock, veryLowStock } = input;

      // Update variant name
      const updatedVariant = await db.variant.update({
        where: { variant_id: variantId },
        data: { name },
      });

      // Update stock level if it exists, create if it doesn't
      const existingStockLevel = await db.stockLevel.findUnique({
        where: { variant_id: variantId },
      });

      if (existingStockLevel) {
        await db.stockLevel.update({
          where: { variant_id: variantId },
          data: {
            low_stock: lowStock,
            very_low_stock: veryLowStock,
          },
        });
      } else {
        await db.stockLevel.create({
          data: {
            variant_id: variantId,
            low_stock: lowStock,
            very_low_stock: veryLowStock,
          },
        });
      }

      return updatedVariant;
    }),

  updateBrand: publicProcedure
    .input(
      z.object({
        brand_id: z.number(),
        name: z.string().min(1, "Brand name is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const { brand_id, name } = input;

      // Update the brand with the given ID
      const updatedBrand = await db.brand.update({
        where: { brand_id },
        data: { name },
      });

      return updatedBrand;
    }),

  updateCategory: publicProcedure
    .input(
      z.object({
        category_id: z.number(),
        name: z.string().min(1, "Category name is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const { category_id, name } = input;

      // Update the category with the given ID
      const updatedCategory = await db.category.update({
        where: { category_id },
        data: { name },
      });

      return updatedCategory;
    }),

  createVariant: publicProcedure
    .input(
      z.object({
        item_id: z.number(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { item_id, name } = input;

      // Create a new variant for the given item
      const variant = await db.variant.create({
        data: {
          item_id,
          name,
        },
      });

      return variant;
    }),

  createStockLevel: publicProcedure
    .input(
      z.object({
        variant_id: z.number(),
        low_stock: z.number().min(1, "Low Stock must be greater than 0."),
        very_low_stock: z
          .number()
          .min(1, "Very Low Stock must be greater than 0."),
      }),
    )
    .mutation(async ({ input }) => {
      // First check if a stock level already exists for this variant
      const existingStockLevel = await db.stockLevel.findUnique({
        where: { variant_id: input.variant_id },
      });

      if (existingStockLevel) {
        throw new Error("Stock level already exists for this variant");
      }

      // Create new stock level with auto-incrementing ID
      const stockLevel = await db.stockLevel.create({
        data: {
          variant_id: input.variant_id,
          low_stock: input.low_stock,
          very_low_stock: input.very_low_stock,
        },
      });

      return stockLevel;
    }),

  createInventory: publicProcedure
    .input(
      z.object({
        variant_id: z.number(),
        quantity: z.number(),
        inventory_clerk: z.string(), // Ensure this matches the schema
        inventory_number: z.number(), // Ensure this matches the schema
      }),
    )
    .mutation(async ({ input }) => {
      const inventory = await db.inventory.create({
        data: {
          variant_id: input.variant_id,
          quantity: input.quantity,
          inventory_clerk: input.inventory_clerk, // Add this field
          inventory_number: input.inventory_number, // Add this field
        },
      });
      return inventory;
    }),

  deleteVariant: publicProcedure
    .input(z.object({ variantId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { variantId } = input;

      // Only check for batch variants
      const batchVariant = await ctx.db.batchVariant.findFirst({
        where: { variant_id: variantId },
      });

      // If batch variant exists, throw an error
      if (batchVariant) {
        throw new Error(
          "Cannot delete variant as it has associated batch records.",
        );
      }

      // If no batch variants, proceed with deletion
      const deletedVariant = await ctx.db.variant.delete({
        where: { variant_id: variantId },
      });

      return deletedVariant;
    }),

  getPresetsByItemId: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input }) => {
      const { itemId } = input;

      try {
        // First, get all presets for the given item ID
        const presets = await db.preset.findMany({
          where: { item_id: itemId },
          include: {
            main_unit: true,
            conversions: {
              include: {
                from_unit: true,
                to_unit: true,
              },
              orderBy: {
                preset_conversion_id: "asc",
              },
            },
          },
          orderBy: {
            preset_id: "asc",
          },
        });

        // Group presets by their chain (starting with presets that have conversions)
        const presetChains: ProcessedPreset[] = [];
        const processedPresetIds = new Set<number>();
        const processedConversionIds = new Set<number>();

        // First, find all starting presets (those that are not the target of any conversion)
        const startingPresets = presets.filter((preset) => {
          // A preset is a starting preset if it's not the target of any conversion
          return !presets.some((p) =>
            p.conversions.some(
              (conv) => conv.to_unit_id === preset.main_unit_id,
            ),
          );
        });

        for (const preset of startingPresets) {
          // Skip if this preset has already been processed
          if (processedPresetIds.has(preset.preset_id)) continue;

          // Only process presets that have conversions (these are the starting points of chains)
          if (preset.conversions.length > 0 && preset.main_unit) {
            const chain: ProcessedPreset = {
              preset_id: preset.preset_id,
              item_id: preset.item_id,
              main_unit_id: preset.main_unit_id,
              main_price: preset.main_price,
              created_at: preset.created_at,
              updated_at: preset.updated_at,
              main_unit: preset.main_unit,
              conversions: [],
            };

            // Add the first preset to processed set
            processedPresetIds.add(preset.preset_id);

            // Find all presets in this chain
            let currentPreset = preset;

            while (currentPreset.conversions.length > 0) {
              // Only consider conversions we haven't processed yet
              const currentConversion = currentPreset.conversions.find(
                (conv) =>
                  !processedConversionIds.has(conv.preset_conversion_id),
              );

              if (!currentConversion) break;
              if (!currentConversion?.from_unit || !currentConversion?.to_unit)
                break;

              // Mark this conversion as processed
              processedConversionIds.add(
                currentConversion.preset_conversion_id,
              );

              // Find the next preset in the chain
              const nextPreset = presets.find(
                (p) =>
                  p.main_unit_id === currentConversion.to_unit_id &&
                  !processedPresetIds.has(p.preset_id),
              );

              if (!nextPreset) break;

              // Add the conversion to the chain with the next preset's main price
              chain.conversions.push({
                preset_conversion_id: currentConversion.preset_conversion_id,
                preset_id: currentPreset.preset_id,
                conversion_rate: currentConversion.conversion_rate,
                from_unit_id: currentConversion.from_unit_id,
                to_unit_id: currentConversion.to_unit_id,
                created_at: currentConversion.created_at,
                updated_at: currentConversion.updated_at,
                from_unit: currentConversion.from_unit,
                to_unit: currentConversion.to_unit,
                related_price: nextPreset.main_price,
              });

              // Add the next preset to processed set
              processedPresetIds.add(nextPreset.preset_id);
              currentPreset = nextPreset;
            }

            presetChains.push(chain);
          }
        }

        // Format the presets for the frontend
        const formattedPresets = presetChains.map((chain) => ({
          preset_id: chain.preset_id,
          main_unit: chain.main_unit.name,
          main_price: chain.main_price,
          conversions: chain.conversions.map((conv) => ({
            preset_conversion_id: conv.preset_conversion_id,
            from_unit: conv.from_unit.name,
            to_unit: conv.to_unit.name,
            conversion_rate: conv.conversion_rate,
            related_price: conv.related_price,
          })),
        }));

        return formattedPresets;
      } catch (error) {
        console.error("Error fetching presets:", error);
        throw new Error("Failed to fetch presets");
      }
    }),

  createPreset: publicProcedure
    .input(
      z.object({
        itemId: z.number(),
        mainUnit: z.string(),
        mainPrice: z.union([z.string(), z.number()]),
        conversions: z.array(
          z.object({
            qty: z.union([z.string(), z.number()]),
            unit: z.string(),
            price: z.union([z.string(), z.number()]),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { itemId, mainUnit, mainPrice, conversions } = input;

      try {
        // Find the main unit
        const mainUnitRecord = await db.unit.findUnique({
          where: { name: mainUnit },
        });

        if (!mainUnitRecord) {
          throw new Error(`Main unit ${mainUnit} not found.`);
        }

        // Create the first preset record (main unit)
        const firstPreset = await db.preset.create({
          data: {
            item_id: itemId,
            main_unit_id: mainUnitRecord.unit_id,
            main_price:
              typeof mainPrice === "string" ? parseFloat(mainPrice) : mainPrice,
          },
        });

        let currentPreset = firstPreset;
        let currentUnitId = mainUnitRecord.unit_id;

        // Process each conversion in the chain
        for (const conversion of conversions) {
          // Find the to unit
          const toUnit = await db.unit.findUnique({
            where: { name: conversion.unit },
          });

          if (!toUnit) {
            throw new Error(`Unit ${conversion.unit} not found.`);
          }

          // Create preset conversion for the current chain
          await db.presetConversion.create({
            data: {
              preset_id: currentPreset.preset_id,
              from_unit_id: currentUnitId, // Use the current unit's ID
              to_unit_id: toUnit.unit_id,
              conversion_rate:
                typeof conversion.qty === "string"
                  ? parseFloat(conversion.qty)
                  : conversion.qty,
            },
          });

          // Create a new preset for the next unit in the chain
          currentPreset = await db.preset.create({
            data: {
              item_id: itemId,
              main_unit_id: toUnit.unit_id,
              main_price:
                typeof conversion.price === "string"
                  ? parseFloat(conversion.price)
                  : conversion.price,
            },
          });

          // Update the current unit ID for the next conversion
          currentUnitId = toUnit.unit_id;
        }

        return {
          message: "Preset chain created successfully!",
          firstPresetId: firstPreset.preset_id,
        };
      } catch (error) {
        console.error("Error creating preset chain:", error);
        throw new Error(
          `Failed to create preset chain: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),

  deletePreset: publicProcedure
    .input(
      z.object({
        presetId: z.number(),
        shouldMarkOnly: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { presetId, shouldMarkOnly = false } = input;

      try {
        console.log(`=== DELETING PRESET CHAIN ===`);
        console.log(`Starting with preset_id=${presetId}`);

        // Find the preset to get related info
        const presetToDelete = await db.preset.findUnique({
          where: { preset_id: presetId },
          include: {
            conversions: true,
            item: true,
            main_unit: true,
          },
        });

        if (!presetToDelete) {
          throw new Error(`Preset with ID ${presetId} not found.`);
        }

        console.log(`Found preset: ${presetToDelete.preset_id}, unit: ${presetToDelete.main_unit?.name}, item: ${presetToDelete.item_id}`);

        // Step 1: Get all conversions directly related to this preset_id
        const directConversions = await db.presetConversion.findMany({
          where: {
            OR: [
              { preset_id: presetId }, // Conversions FROM this preset
              { to_unit_id: presetToDelete.main_unit_id } // Conversions TO this preset
            ]
          },
          include: {
            preset: true,
            to_unit: true,
            from_unit: true
          }
        });

        console.log(`Direct conversions for preset ${presetId}:`, directConversions.map(c =>
          `ID: ${c.preset_conversion_id}, From preset: ${c.preset_id}, From: ${c.from_unit.name}, To: ${c.to_unit.name}`
        ));

        // Step 2: Get explicit chain (both upstream and downstream)
        // We need to find the entire chain this preset belongs to

        // First, find all presets for this item
        const allPresets = await db.preset.findMany({
          where: { item_id: presetToDelete.item_id },
          include: {
            main_unit: true,
            conversions: {
              include: {
                from_unit: true,
                to_unit: true
              }
            }
          }
        });

        // Get all conversions for this item
        const allConversions = await db.presetConversion.findMany({
          where: {
            preset: {
              item_id: presetToDelete.item_id
            }
          },
          include: {
            preset: true,
            from_unit: true,
            to_unit: true
          }
        });

        // Build a direct preset-to-preset conversion map based on exact preset IDs
        // key: preset_id, value: {nextPresetId, conversionId}
        const presetConnections = new Map<number, {nextPresetId: number, conversionId: number}>();

        // Build a reverse map to find what preset points to each preset
        // key: preset_id, value: {previousPresetId, conversionId}
        const reverseConnections = new Map<number, {prevPresetId: number, conversionId: number}>();

        // Map which exact preset has each unit as its main unit
        const unitToPresetMap = new Map<number, number>();
        for (const p of allPresets) {
          unitToPresetMap.set(p.main_unit_id, p.preset_id);
        }

        // Build the connection maps
        for (const conv of allConversions) {
          const targetPresetId = unitToPresetMap.get(conv.to_unit_id);
          if (targetPresetId) {
            // Forward connection
            presetConnections.set(conv.preset_id, {
              nextPresetId: targetPresetId,
              conversionId: conv.preset_conversion_id
            });

            // Reverse connection
            reverseConnections.set(targetPresetId, {
              prevPresetId: conv.preset_id,
              conversionId: conv.preset_conversion_id
            });
          }
        }

        console.log(`Forward connections:`, JSON.stringify(Array.from(presetConnections.entries())));
        console.log(`Reverse connections:`, JSON.stringify(Array.from(reverseConnections.entries())));

        // Find the first preset in this chain (the root)
        let rootPresetId = presetId;
        while (reverseConnections.has(rootPresetId)) {
          const prevInfo = reverseConnections.get(rootPresetId);
          if (!prevInfo) break;
          rootPresetId = prevInfo.prevPresetId;
        }

        console.log(`Root preset for chain containing ${presetId} is: ${rootPresetId}`);

        // Now follow the chain from the root to collect all presets in this exact chain
        const chainPresets = new Set<number>([rootPresetId]);
        let currentId = rootPresetId;

        while (presetConnections.has(currentId)) {
          const nextInfo = presetConnections.get(currentId);
          if (!nextInfo) break;

          chainPresets.add(nextInfo.nextPresetId);
          currentId = nextInfo.nextPresetId;
        }

        console.log(`Presets in this specific chain: ${Array.from(chainPresets).join(', ')}`);

        // Now delete all conversions in this chain to avoid foreign key constraints
        const conversionIdsToDelete = new Set<number>();

        // Collect conversion IDs
        for (const presetId of chainPresets) {
          const preset = allPresets.find(p => p.preset_id === presetId);
          if (preset && preset.conversions.length > 0) {
            for (const conv of preset.conversions) {
              conversionIdsToDelete.add(conv.preset_conversion_id);
            }
          }
        }

        console.log(`Conversion IDs to delete: ${Array.from(conversionIdsToDelete).join(', ')}`);

        // Delete conversions
        for (const convId of conversionIdsToDelete) {
          try {
            await db.presetConversion.delete({
              where: { preset_conversion_id: convId }
            });
            console.log(`Deleted conversion: ${convId}`);
          } catch (e) {
            console.log(`Could not delete conversion ${convId}, may already be deleted`);
          }
        }

        // Delete presets
        for (const id of chainPresets) {
          try {
            await db.preset.delete({
              where: { preset_id: id }
            });
            console.log(`Deleted preset: ${id}`);
          } catch (e) {
            console.log(`Could not delete preset ${id}, may already be deleted`);
          }
        }

        return {
          message: `Preset chain deleted successfully`,
          presetId,
          deletedCount: chainPresets.size,
        };
      } catch (error) {
        console.error("Error deleting preset:", error);
        throw new Error(
          `Failed to delete preset: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),

  removeConversionFromPreset: publicProcedure
    .input(
      z.object({
        presetId: z.number(),
        toUnitId: z.number(),
        itemId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { presetId, toUnitId, itemId } = input;

      try {
        console.log(`=== REMOVING CONVERSION FROM PRESET ===`);
        console.log(`Starting with preset_id=${presetId}, removing unit_id=${toUnitId}`);

        // Step 1: Get all data needed to understand the chain structure
        // Get all presets for this item
        const allPresets = await db.preset.findMany({
          where: { item_id: itemId },
          include: {
            main_unit: true,
            conversions: {
              include: {
                from_unit: true,
                to_unit: true,
              },
            },
          },
          orderBy: {
            preset_id: "asc",
          },
        });

        // Get the source preset to verify it exists
        const sourcePreset = allPresets.find(p => p.preset_id === presetId);
        if (!sourcePreset) {
          throw new Error(`Preset with ID ${presetId} not found`);
        }

        // Get all conversions for this item
        const allConversions = await db.presetConversion.findMany({
          where: {
            preset: {
              item_id: itemId,
            },
          },
          include: {
            preset: true,
            from_unit: true,
            to_unit: true,
          },
        });

        console.log("All presets:", allPresets.map(p =>
          `ID: ${p.preset_id}, Unit: ${p.main_unit?.name}, Price: ${p.main_price}`
        ));
        console.log("All conversions:", allConversions.map(c =>
          `ID: ${c.preset_conversion_id}, From preset: ${c.preset_id}, From: ${c.from_unit.name}, To: ${c.to_unit.name}`
        ));

        // Step 2: Build precise preset-to-preset mapping
        // Forward map: which preset points to which preset
        const presetConnections = new Map<number, {nextPresetId: number, conversionId: number}>();
        // Reverse map: which preset is pointed to by which preset
        const reverseConnections = new Map<number, {prevPresetId: number, conversionId: number}>();
        // Map unit IDs to the presets that have them as main_unit
        const unitToPresetMap = new Map<number, number>();

        // Build the unit-to-preset map
        for (const preset of allPresets) {
          unitToPresetMap.set(preset.main_unit_id, preset.preset_id);
        }

        // Build the connection maps
        for (const conv of allConversions) {
          const targetPresetId = unitToPresetMap.get(conv.to_unit_id);
          if (targetPresetId) {
            // Forward connection
            presetConnections.set(conv.preset_id, {
              nextPresetId: targetPresetId,
              conversionId: conv.preset_conversion_id,
            });

            // Reverse connection
            reverseConnections.set(targetPresetId, {
              prevPresetId: conv.preset_id,
              conversionId: conv.preset_conversion_id,
            });
          }
        }

        console.log("Forward connections:", JSON.stringify(Array.from(presetConnections.entries())));
        console.log("Reverse connections:", JSON.stringify(Array.from(reverseConnections.entries())));

        // Step 3: Find the root of this specific chain
        let rootPresetId = presetId;
        while (reverseConnections.has(rootPresetId)) {
          const prevInfo = reverseConnections.get(rootPresetId);
          if (!prevInfo) break;
          rootPresetId = prevInfo.prevPresetId;
        }

        console.log(`Root preset for chain containing ${presetId} is: ${rootPresetId}`);

        // Step 4: Map out the exact chain from root to end
        const chainPresets = new Set<number>([rootPresetId]);
        let currentId = rootPresetId;

        while (presetConnections.has(currentId)) {
          const nextInfo = presetConnections.get(currentId);
          if (!nextInfo) break;

          chainPresets.add(nextInfo.nextPresetId);
          currentId = nextInfo.nextPresetId;
        }

        console.log(`All presets in this specific chain: ${Array.from(chainPresets).join(', ')}`);

        // Step 5: Find the exact preset with the target unit ID that's in our chain
        const presetToRemove = allPresets.find(
          p => p.main_unit_id === toUnitId && chainPresets.has(p.preset_id)
        );

        if (!presetToRemove) {
          throw new Error(`No preset found with unit ID ${toUnitId} in this chain`);
        }

        console.log(`Removing preset: ${presetToRemove.preset_id} with unit: ${presetToRemove.main_unit.name}`);

        // Step 6: Find the conversion that points to this preset
        let sourcePresetId: number | null = null;
        let conversionToRemove: any = null;

        // Look for the exact connection leading to our target preset
        const previousPresetInfo = reverseConnections.get(presetToRemove.preset_id);
        if (previousPresetInfo) {
          sourcePresetId = previousPresetInfo.prevPresetId;
          conversionToRemove = allConversions.find(
            c => c.preset_conversion_id === previousPresetInfo.conversionId
          );
        }

        if (!conversionToRemove) {
          throw new Error(`Could not find conversion leading to preset ${presetToRemove.preset_id}`);
        }

        console.log(`Found conversion ${conversionToRemove.preset_conversion_id} connecting presets ${sourcePresetId} -> ${presetToRemove.preset_id}`);

        // Step 7: Find if this preset has any outgoing connections
        const nextConnectionInfo = presetConnections.get(presetToRemove.preset_id);
        const hasOutgoingConnection = !!nextConnectionInfo;

        if (hasOutgoingConnection) {
          // Case: This is a middle preset in the chain - need to reconnect
          console.log(`Preset ${presetToRemove.preset_id} has an outgoing connection to preset ${nextConnectionInfo?.nextPresetId}`);

          const nextPresetId = nextConnectionInfo?.nextPresetId;
          const nextPreset = allPresets.find(p => p.preset_id === nextPresetId);

          if (!nextPreset) {
            throw new Error(`Could not find next preset with ID ${nextPresetId}`);
          }

          const outgoingConversion = allConversions.find(
            c => c.preset_conversion_id === nextConnectionInfo?.conversionId
          );

          if (!outgoingConversion) {
            throw new Error(`Could not find outgoing conversion from preset ${presetToRemove.preset_id}`);
          }

          console.log(`Reconnecting chain: ${sourcePresetId} -> ${nextPresetId} (skipping ${presetToRemove.preset_id})`);

          // Update the existing conversion to skip over the removed preset
          await db.presetConversion.update({
            where: { preset_conversion_id: conversionToRemove.preset_conversion_id },
            data: {
              to_unit_id: nextPreset.main_unit_id,
              conversion_rate: outgoingConversion.conversion_rate,
            },
          });

          // Delete the outgoing conversion
          await db.presetConversion.delete({
            where: { preset_conversion_id: outgoingConversion.preset_conversion_id },
          });

          // Delete the preset being removed
          await db.preset.delete({
            where: { preset_id: presetToRemove.preset_id },
          });
        } else {
          // Case: This is the last preset in the chain - just delete the conversion and preset
          console.log(`Preset ${presetToRemove.preset_id} is the last in the chain`);

          // Delete the conversion pointing to this preset
          await db.presetConversion.delete({
            where: { preset_conversion_id: conversionToRemove.preset_conversion_id },
          });

          // Delete the preset
          await db.preset.delete({
            where: { preset_id: presetToRemove.preset_id },
          });
        }

        return {
          message: `Conversion removed successfully`,
          removedPresetId: presetToRemove.preset_id,
          sourcePresetId: sourcePresetId || presetId,
        };
      } catch (error) {
        console.error("Error removing conversion from preset:", error);
        throw new Error(
          `Failed to remove conversion: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),

  addConversionToPreset: publicProcedure
    .input(
      z.object({
        presetId: z.number(),
        fromUnitId: z.number().optional(),
        conversionRate: z.union([z.string(), z.number()]),
        toUnit: z.string(),
        price: z.union([z.string(), z.number()]),
        itemId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { presetId, fromUnitId, conversionRate, toUnit, price, itemId } =
        input;

      try {
        console.log(`=== ADDING CONVERSION TO PRESET CHAIN ===`);
        console.log(`Starting with preset_id=${presetId}`);

        // 1. First, find the preset to get info about the chain
        const sourcePreset = await db.preset.findUnique({
          where: { preset_id: presetId },
          include: {
            main_unit: true,
          },
        });

        if (!sourcePreset) {
          throw new Error(`Preset with ID ${presetId} not found`);
        }

        // Fetch all presets and conversions for this item to understand the chain structure
        const itemPresets = await db.preset.findMany({
          where: { item_id: itemId },
          include: {
            main_unit: true,
            conversions: {
              include: { to_unit: true, from_unit: true },
            },
          },
        });

        const allConversions = await db.presetConversion.findMany({
          where: {
            preset: {
              item_id: itemId,
            },
          },
          include: {
            preset: true,
            from_unit: true,
            to_unit: true,
          },
        });

        console.log(
          "All presets:",
          itemPresets.map(
            (p) =>
              `ID: ${p.preset_id}, Unit: ${p.main_unit?.name}, Price: ${p.main_price}`,
          ),
        );
        console.log(
          "All conversions:",
          allConversions.map(
            (c) =>
              `ID: ${c.preset_conversion_id}, From preset: ${c.preset_id}, From unit: ${c.from_unit.name}, To unit: ${c.to_unit.name}`,
          ),
        );

        // Build a preset chain map to track exact chains
        const presetChainMap = new Map<
          number,
          { nextPresetId: number; conversionId: number }
        >();

        for (const conv of allConversions) {
          const targetPreset = itemPresets.find(
            (p) => p.main_unit_id === conv.to_unit_id,
          );
          if (targetPreset) {
            presetChainMap.set(conv.preset_id, {
              nextPresetId: targetPreset.preset_id,
              conversionId: conv.preset_conversion_id,
            });
          }
        }

        console.log(
          "Chain map:",
          JSON.stringify(Array.from(presetChainMap.entries())),
        );

        // 2. Find the end of the chain starting from the source preset
        let endOfChainPreset = sourcePreset;
        const presetsInChain = new Set<number>([sourcePreset.preset_id]);
        let currentPresetId = sourcePreset.preset_id;

        // Follow the chain starting from the source preset
        while (true) {
          const nextLink = presetChainMap.get(currentPresetId);
          if (!nextLink) {
            // This is the end of the chain
            break;
          }

          presetsInChain.add(nextLink.nextPresetId);
          currentPresetId = nextLink.nextPresetId;

          // Update the end of chain preset
          const nextPreset = itemPresets.find(
            (p) => p.preset_id === nextLink.nextPresetId,
          );
          if (nextPreset) {
            endOfChainPreset = nextPreset;
          }
        }

        console.log(
          `Presets in chain: ${Array.from(presetsInChain).join(", ")}`,
        );
        console.log(
          `End of chain preset: ${endOfChainPreset.preset_id}, Unit: ${endOfChainPreset.main_unit.name}`,
        );

        // 3. If fromUnitId was specified, verify it's part of our chain
        let lastPresetInChain = endOfChainPreset;
        let lastUnitId = endOfChainPreset.main_unit_id;

        if (fromUnitId) {
          const presetWithFromUnit = itemPresets.find(
            (p) =>
              p.main_unit_id === fromUnitId && presetsInChain.has(p.preset_id),
          );

          if (presetWithFromUnit) {
            lastPresetInChain = presetWithFromUnit;
            lastUnitId = fromUnitId;
            console.log(
              `Using specified fromUnitId=${fromUnitId} from preset ${presetWithFromUnit.preset_id}`,
            );
          } else {
            console.warn(
              `No preset found with main_unit_id ${fromUnitId} in this chain, using end of chain preset.`,
            );
          }
        }

        // 4. Find or confirm the to_unit
        const toUnitRecord = await db.unit.findUnique({
          where: { name: toUnit },
        });

        if (!toUnitRecord) {
          throw new Error(`Unit ${toUnit} not found`);
        }

        // 5. Create a preset conversion linking the last unit to the new unit
        const presetConversion = await db.presetConversion.create({
          data: {
            preset_id: lastPresetInChain.preset_id,
            from_unit_id: lastUnitId,
            to_unit_id: toUnitRecord.unit_id,
            conversion_rate:
              typeof conversionRate === "string"
                ? parseFloat(conversionRate)
                : conversionRate,
          },
        });

        console.log(
          `Created conversion ${presetConversion.preset_conversion_id} from preset ${lastPresetInChain.preset_id}`,
        );

        // 6. Create a new preset for the new unit
        const newPreset = await db.preset.create({
          data: {
            item_id: itemId,
            main_unit_id: toUnitRecord.unit_id,
            main_price: typeof price === "string" ? parseFloat(price) : price,
          },
        });

        console.log(
          `Created new preset ${newPreset.preset_id} with unit ${toUnitRecord.name} and price ${price}`,
        );

        return {
          message: "Conversion added successfully to preset chain",
          presetId: newPreset.preset_id,
          conversionId: presetConversion.preset_conversion_id,
        };
      } catch (error) {
        console.error("Error adding conversion to preset:", error);
        throw new Error(
          `Failed to add conversion to preset: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),

  updatePresetChain: publicProcedure
    .input(
      z.object({
        presetId: z.number(),
        mainUnit: z.string(),
        mainPrice: z.number(),
        conversions: z.array(
          z.object({
            conversionId: z.number().optional(),
            rate: z.number(),
            unit: z.string(),
            price: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { presetId, mainUnit, mainPrice, conversions } = input;

      console.log(`=== UPDATING PRESET CHAIN ===`);
      console.log(
        `Starting with preset_id=${presetId}, unit=${mainUnit}, price=${mainPrice}`,
      );
      console.log(`Conversions:`, JSON.stringify(conversions));

      // Get all presets for this item to allow chain tracing
      const itemId = await ctx.db.preset
        .findUnique({
          where: { preset_id: presetId },
          select: { item_id: true },
        })
        .then((data) => data?.item_id);

      if (!itemId) {
        throw new Error(`Preset with ID ${presetId} not found`);
      }

      // Load all item presets and conversions for accurate chain tracking
      const allPresets = await ctx.db.preset.findMany({
        where: { item_id: itemId },
        include: {
          main_unit: true,
          conversions: {
            include: {
              from_unit: true,
              to_unit: true,
            },
          },
        },
      });

      // Build a directed graph of preset chain connections for easier traversal
      const chainGraph: Record<
        number,
        { nextPresetId?: number; conversion?: any }
      > = {};

      // First pass: record all connections between presets
      for (const preset of allPresets) {
        if (preset.conversions && preset.conversions.length > 0) {
          const conversion = preset.conversions[0]; // Only take first conversion from each preset
          if (conversion && conversion.to_unit_id) {
            // Find the preset that this conversion points to
            const targetPreset = allPresets.find(
              (p) => p.main_unit_id === conversion.to_unit_id,
            );

            if (targetPreset) {
              chainGraph[preset.preset_id] = {
                nextPresetId: targetPreset.preset_id,
                conversion: conversion,
              };
            }
          }
        }
      }

      // For debugging: print the graph of chains
      console.log("Chain graph:", JSON.stringify(chainGraph, null, 2));

      // Get the new main unit by name
      const newMainUnit = await ctx.db.unit.findUnique({
        where: { name: mainUnit },
      });

      if (!newMainUnit) {
        throw new Error(`Unit ${mainUnit} not found`);
      }

      // Update the root preset with the new main price and unit
      await ctx.db.preset.update({
        where: { preset_id: presetId },
        data: {
          main_unit_id: newMainUnit.unit_id,
          main_price: mainPrice,
        },
      });

      // Update each conversion in the chain
      let currentPresetId = presetId;
      let currentUnitId = newMainUnit.unit_id;

      // Track which presets we've processed to avoid duplicates or cycles
      const processedPresets = new Set<number>([presetId]);

      // Process each conversion in the array
      for (const conversion of conversions) {
        console.log(`Processing conversion: ${JSON.stringify(conversion)}`);
        console.log(
          `Current preset: ${currentPresetId}, current unit: ${currentUnitId}`,
        );

        // Get the unit we're converting to
        const toUnit = await ctx.db.unit.findUnique({
          where: { name: conversion.unit },
        });

        if (!toUnit) {
          throw new Error(`Unit ${conversion.unit} not found`);
        }

        if (conversion.conversionId) {
          // UPDATING EXISTING CONVERSION
          // First find the exact conversion
          const existingConversion = await ctx.db.presetConversion.findUnique({
            where: { preset_conversion_id: conversion.conversionId },
          });

          if (!existingConversion) {
            throw new Error(
              `Conversion with ID ${conversion.conversionId} not found`,
            );
          }

          // Update the conversion
          await ctx.db.presetConversion.update({
            where: { preset_conversion_id: conversion.conversionId },
            data: {
              conversion_rate: conversion.rate,
              from_unit_id: currentUnitId,
              to_unit_id: toUnit.unit_id,
            },
          });

          // CRITICAL: Find the EXACT preset this conversion links to in the chain
          const nextPresetId = chainGraph[currentPresetId]?.nextPresetId;

          if (nextPresetId) {
            console.log(
              `Updating linked preset: ${nextPresetId} with price: ${conversion.price}`,
            );

            // Update the preset this conversion points to
            await ctx.db.preset.update({
              where: { preset_id: nextPresetId },
              data: {
                main_unit_id: toUnit.unit_id,
                main_price: conversion.price,
              },
            });

            // Move to the next preset in the chain
            currentPresetId = nextPresetId;
            currentUnitId = toUnit.unit_id;
            processedPresets.add(nextPresetId);
          } else {
            console.log(
              `Warning: Could not find next preset in chain after ${currentPresetId}`,
            );
          }
        } else {
          // CREATING NEW CONVERSION
          console.log(`Creating new conversion from preset ${currentPresetId}`);

          // Create a new conversion
          const newConversion = await ctx.db.presetConversion.create({
            data: {
              preset_id: currentPresetId,
              from_unit_id: currentUnitId,
              to_unit_id: toUnit.unit_id,
              conversion_rate: conversion.rate,
            },
          });

          // Create a new preset for this conversion
          const newPreset = await ctx.db.preset.create({
            data: {
              item_id: itemId,
              main_unit_id: toUnit.unit_id,
              main_price: conversion.price,
            },
          });

          console.log(
            `Created new preset: ${newPreset.preset_id} for unit: ${toUnit.name}`,
          );

          // Update the chain graph
          chainGraph[currentPresetId] = {
            nextPresetId: newPreset.preset_id,
            conversion: newConversion,
          };

          // Move to the next preset in the chain
          currentPresetId = newPreset.preset_id;
          currentUnitId = toUnit.unit_id;
          processedPresets.add(newPreset.preset_id);
        }
      }

      console.log(
        `Chain update complete. Processed presets: ${Array.from(processedPresets).join(", ")}`,
      );
      return { success: true, presetId };
    }),

  verifyPassword: publicProcedure
    .input(
      z.object({
        personalDetailsId: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { personalDetailsId, password } = input;

      try {
        // Get user from the database
        const user = await ctx.db.personal_Details.findUnique({
          where: { personal_details_id: personalDetailsId },
          select: {
            // Include fields needed for authentication
            personal_details_id: true,
            // Use whatever fields the schema has for authentication
            // For demo purposes, we'll check if user exists
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // For demo purposes - simplified authentication
        // In a real app, you would have a proper password check
        // This is just a placeholder implementation
        if (password !== "admin") {
          // Replace with real authentication
          throw new Error("Incorrect password.");
        }

        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Password verification failed");
      }
    }),
});

export default inventoryRouter;
