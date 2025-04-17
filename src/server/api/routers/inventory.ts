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
              const currentConversion = currentPreset.conversions[0];
              if (!currentConversion?.from_unit || !currentConversion?.to_unit)
                break;

              // Find the next preset in the chain
              const nextPreset = presets.find(
                (p) => p.main_unit_id === currentConversion.to_unit_id,
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
        // If shouldMarkOnly is true, we might implement a soft delete in the future
        // For now, we'll always perform a hard delete

        // Find the preset to get related info
        const presetToDelete = await db.preset.findUnique({
          where: { preset_id: presetId },
          include: {
            conversions: true,
            item: true,
          },
        });

        if (!presetToDelete) {
          throw new Error(`Preset with ID ${presetId} not found.`);
        }

        // Get all presets for this item to identify which ones to delete
        const allItemPresets = await db.preset.findMany({
          where: { item_id: presetToDelete.item_id },
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

        // Find the specific preset unit name for reference in error messages
        const presetUnitToDelete = allItemPresets.find(
          (p) => p.preset_id === presetId,
        )?.main_unit?.name;

        // Function to follow a specific chain starting from a specific preset ID
        // This ensures we only delete presets in the chain that starts with our target preset
        const followSpecificChain = (startPresetId: number): Set<number> => {
          const chainPresetIds = new Set<number>([startPresetId]);
          let currentPresetId = startPresetId;

          // Follow the chain from the start preset to the end
          while (true) {
            // Find the current preset
            const currentPreset = allItemPresets.find(
              (p) => p.preset_id === currentPresetId,
            );
            if (!currentPreset || currentPreset.conversions.length === 0) {
              // Reached the end of the chain
              break;
            }

            // Get the first conversion (assuming presets have at most one outgoing conversion)
            const conversion = currentPreset.conversions[0];
            if (!conversion) {
              // No conversion found
              break;
            }

            // Find the next preset in the chain
            const nextPreset = allItemPresets.find(
              (p) => p.main_unit_id === conversion.to_unit_id,
            );
            if (!nextPreset || chainPresetIds.has(nextPreset.preset_id)) {
              // No next preset or we've hit a cycle
              break;
            }

            // Add this preset to our chain
            chainPresetIds.add(nextPreset.preset_id);
            currentPresetId = nextPreset.preset_id;
          }

          return chainPresetIds;
        };

        // Get all presets in the specific chain starting from our target preset
        const presetsToDelete = followSpecificChain(presetId);
        console.log(
          `Deleting preset chain for unit "${presetUnitToDelete}" - ${presetsToDelete.size} presets to delete`,
        );

        // Delete all presets in the chain
        // Note: Due to cascading deletes in the database schema, the conversions will be automatically deleted
        for (const idToDelete of presetsToDelete) {
          await db.preset.delete({
            where: { preset_id: idToDelete },
          });
        }

        return {
          message: `Preset chain for "${presetUnitToDelete}" deleted successfully`,
          presetId,
          deletedCount: presetsToDelete.size,
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
        // Get all presets for this item to identify the chain
        const allItemPresets = await db.preset.findMany({
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

        // Find the preset with the given ID
        const sourcePreset = allItemPresets.find(
          (p) => p.preset_id === presetId,
        );
        if (!sourcePreset) {
          throw new Error(`Preset with ID ${presetId} not found.`);
        }

        // Find the preset that uses the unit as its main unit (the one we're removing)
        const presetToRemove = allItemPresets.find(
          (p) => p.main_unit_id === toUnitId,
        );
        if (!presetToRemove) {
          throw new Error(`No preset found with main unit ID ${toUnitId}.`);
        }

        // Find the conversion that leads to the unit we want to remove
        // First, look for a direct conversion from the source preset
        let conversionToRemove = sourcePreset.conversions.find(
          (c) => c.to_unit_id === toUnitId,
        );

        // If no direct conversion found, we need to find the chain that leads to it
        if (!conversionToRemove) {
          // Build a map of the chain: preset_id -> conversion that leads to the next preset
          const chainMap = new Map();

          // Find the first preset in the chain
          const firstPreset = allItemPresets.find(
            (p) => p.preset_id === presetId,
          );
          if (!firstPreset) {
            throw new Error(
              `Could not find start of chain (preset ${presetId})`,
            );
          }

          // Add all conversions to the map
          for (const preset of allItemPresets) {
            if (preset.conversions.length > 0) {
              chainMap.set(preset.preset_id, preset.conversions[0]);
            }
          }

          // Follow the chain from the source preset until we find a conversion
          // that connects to a preset that leads to our target unit
          let currentPresetId = firstPreset.preset_id;
          let previousPresetId = null;
          let previousConversion = null;

          while (
            currentPresetId &&
            currentPresetId !== presetToRemove.preset_id
          ) {
            const conversion = chainMap.get(currentPresetId);
            if (!conversion) {
              // We've reached the end of the chain without finding our target
              break;
            }

            // Find the preset that this conversion points to
            const nextPreset = allItemPresets.find(
              (p) => p.main_unit_id === conversion.to_unit_id,
            );
            if (!nextPreset) {
              break;
            }

            // If the next preset leads to our target, we've found the conversion we need to remove
            if (nextPreset.preset_id === presetToRemove.preset_id) {
              conversionToRemove = conversion;
              break;
            }

            // If the next preset has a conversion that leads to our target, we've found what we need
            const nextConversion = chainMap.get(nextPreset.preset_id);
            if (nextConversion && nextConversion.to_unit_id === toUnitId) {
              conversionToRemove = nextConversion;
              previousPresetId = nextPreset.preset_id;
              break;
            }

            // Otherwise, continue following the chain
            previousPresetId = currentPresetId;
            previousConversion = conversion;
            currentPresetId = nextPreset.preset_id;
          }

          // If we still haven't found the conversion, look for a preset that directly points to our target
          if (!conversionToRemove) {
            for (const preset of allItemPresets) {
              const conv = preset.conversions.find(
                (c) => c.to_unit_id === toUnitId,
              );
              if (conv) {
                conversionToRemove = conv;
                previousPresetId = preset.preset_id;
                break;
              }
            }
          }
        }

        if (!conversionToRemove) {
          throw new Error(
            `No conversion found that leads to unit ID ${toUnitId} in the chain.`,
          );
        }

        // Find the next conversion in the chain (if any)
        const nextConversion = presetToRemove.conversions[0]; // Assuming each preset has at most one outgoing conversion

        // Case 1: This is the last unit in the chain - just delete the conversion and the preset
        if (!nextConversion) {
          console.log(
            `Removing last unit in chain (${presetToRemove.main_unit.name})`,
          );

          // Delete the conversion that points to the preset to remove
          await db.presetConversion.delete({
            where: {
              preset_conversion_id: conversionToRemove.preset_conversion_id,
            },
          });

          // Delete the preset to remove
          await db.preset.delete({
            where: { preset_id: presetToRemove.preset_id },
          });
        }
        // Case 2: This is a middle unit in the chain - need to reconnect the chain
        else {
          console.log(
            `Removing middle unit in chain (${presetToRemove.main_unit.name})`,
          );

          // Find the target preset that follows in the chain
          const targetPreset = allItemPresets.find(
            (p) => p.main_unit_id === nextConversion.to_unit_id,
          );
          if (!targetPreset) {
            throw new Error(
              `Could not find preset with main unit ID ${nextConversion.to_unit_id}.`,
            );
          }

          // Use the next conversion's rate directly instead of multiplying
          const newConversionRate = nextConversion.conversion_rate;

          // Update the existing conversion to point to the target preset
          await db.presetConversion.update({
            where: {
              preset_conversion_id: conversionToRemove.preset_conversion_id,
            },
            data: {
              to_unit_id: nextConversion.to_unit_id,
              conversion_rate: newConversionRate,
            },
          });

          // Delete the conversion from the preset to remove
          await db.presetConversion.delete({
            where: {
              preset_conversion_id: nextConversion.preset_conversion_id,
            },
          });

          // Delete the preset to remove
          await db.preset.delete({
            where: { preset_id: presetToRemove.preset_id },
          });
        }

        return {
          message: `Conversion removed successfully`,
          removedPresetId: presetToRemove.preset_id,
          sourcePresetId: sourcePreset.preset_id,
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

        // 2. Find the preset with the fromUnitId as its main_unit_id or determine the last preset in the chain
        let lastPresetInChain = sourcePreset;
        let lastUnitId = fromUnitId;

        // Get all presets with the same item ID
        const itemPresets = await db.preset.findMany({
          where: { item_id: itemId },
          include: {
            main_unit: true,
            conversions: {
              include: { to_unit: true, from_unit: true },
            },
          },
        });

        // If fromUnitId is provided, find the preset with that unit as its main unit
        if (fromUnitId) {
          const presetWithFromUnit = itemPresets.find(
            (preset) => preset.main_unit_id === fromUnitId,
          );

          if (presetWithFromUnit) {
            lastPresetInChain = presetWithFromUnit;
            lastUnitId = fromUnitId;
          } else {
            console.warn(
              `No preset found with main_unit_id ${fromUnitId}, using source preset's unit.`,
            );
          }
        } else {
          // Otherwise find the last preset in the chain by following conversions
          let currentPreset = sourcePreset;
          const processedPresetIds = new Set<number>([currentPreset.preset_id]);

          while (true) {
            // Find a preset conversion where current preset is the source
            const conversion = await db.presetConversion.findFirst({
              where: { preset_id: currentPreset.preset_id },
              include: { to_unit: true, from_unit: true },
            });

            if (!conversion) {
              // This is the end of the chain
              lastPresetInChain = currentPreset;
              lastUnitId = currentPreset.main_unit_id;
              break;
            }

            // Find the next preset in the chain
            const nextPreset = itemPresets.find(
              (p) => p.main_unit_id === conversion.to_unit_id,
            );

            if (!nextPreset || processedPresetIds.has(nextPreset.preset_id)) {
              // This is the end of the chain or we've encountered a cycle
              lastPresetInChain = currentPreset;
              lastUnitId = conversion.to_unit_id;
              break;
            }

            // Move to the next preset in the chain
            currentPreset = nextPreset;
            processedPresetIds.add(currentPreset.preset_id);
          }
        }

        if (!lastUnitId) {
          throw new Error(
            "Could not determine the last unit in the preset chain",
          );
        }

        console.log(
          `Using preset ${lastPresetInChain.preset_id} with unit ${lastUnitId} as source for new conversion`,
        );

        // 3. Find or confirm the to_unit
        const toUnitRecord = await db.unit.findUnique({
          where: { name: toUnit },
        });

        if (!toUnitRecord) {
          throw new Error(`Unit ${toUnit} not found`);
        }

        // 4. Create a preset conversion linking the last unit to the new unit
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

        // 5. Create a new preset for the new unit
        const newPreset = await db.preset.create({
          data: {
            item_id: itemId,
            main_unit_id: toUnitRecord.unit_id,
            main_price: typeof price === "string" ? parseFloat(price) : price,
          },
        });

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

      // Get existing preset with conversions
      const existingPreset = await ctx.db.preset.findUnique({
        where: { preset_id: presetId },
        include: {
          main_unit: true,
          conversions: {
            orderBy: { preset_conversion_id: "asc" },
          },
        },
      });

      if (!existingPreset) {
        throw new Error("Preset not found");
      }

      // Get new main unit
      const newMainUnit = await ctx.db.unit.findUnique({
        where: { name: mainUnit },
      });
      if (!newMainUnit) {
        throw new Error(`Unit ${mainUnit} not found`);
      }

      // Update main preset
      const updatedPreset = await ctx.db.preset.update({
        where: { preset_id: presetId },
        data: {
          main_unit_id: newMainUnit.unit_id,
          main_price: mainPrice,
        },
      });

      // Handle main unit change
      if (existingPreset.main_unit_id !== newMainUnit.unit_id) {
        // Update previous conversion pointing to this preset
        await ctx.db.presetConversion.updateMany({
          where: {
            to_unit_id: existingPreset.main_unit_id,
            preset: { item_id: existingPreset.item_id },
          },
          data: { to_unit_id: newMainUnit.unit_id },
        });
      }

      // Process conversions
      let currentPresetId = presetId;
      let currentUnitId = newMainUnit.unit_id;

      for (const conversion of conversions) {
        // Handle both updates and new conversions
        if (conversion.conversionId) {
          // UPDATE EXISTING CONVERSION
          const existingConversion = await ctx.db.presetConversion.findUnique({
            where: { preset_conversion_id: conversion.conversionId },
            include: { to_unit: true },
          });

          if (!existingConversion) {
            throw new Error(
              `Conversion with ID ${conversion.conversionId} not found`,
            );
          }

          const toUnit = await ctx.db.unit.findUnique({
            where: { name: conversion.unit },
          });
          if (!toUnit) throw new Error(`Unit ${conversion.unit} not found`);

          // Update the conversion
          await ctx.db.presetConversion.update({
            where: { preset_conversion_id: conversion.conversionId },
            data: {
              conversion_rate: conversion.rate,
              from_unit_id: currentUnitId,
              to_unit_id: toUnit.unit_id,
            },
          });

          // Find and update linked preset for EXISTING conversion
          const nextPreset = await ctx.db.preset.findFirst({
            where: {
              item_id: existingPreset.item_id,
              main_unit_id: existingConversion.to_unit_id,
            },
          });

          if (nextPreset) {
            // Update next preset's main unit and price
            await ctx.db.preset.update({
              where: { preset_id: nextPreset.preset_id },
              data: {
                main_unit_id: toUnit.unit_id,
                main_price: conversion.price,
              },
            });

            currentUnitId = toUnit.unit_id;
            currentPresetId = nextPreset.preset_id;
          }
        } else {
          // CREATE NEW CONVERSION
          const toUnit = await ctx.db.unit.findUnique({
            where: { name: conversion.unit },
          });
          if (!toUnit) throw new Error(`Unit ${conversion.unit} not found`);

          // Create new conversion
          await ctx.db.presetConversion.create({
            data: {
              preset_id: currentPresetId,
              conversion_rate: conversion.rate,
              from_unit_id: currentUnitId,
              to_unit_id: toUnit.unit_id,
            },
          });

          // Handle NEW conversion's next preset
          const nextPreset = await ctx.db.preset.findFirst({
            where: {
              item_id: existingPreset.item_id,
              main_unit_id: toUnit.unit_id, // Use the new toUnit directly
            },
          });

          if (nextPreset) {
            // Update existing linked preset if found
            await ctx.db.preset.update({
              where: { preset_id: nextPreset.preset_id },
              data: {
                main_price: conversion.price,
              },
            });
          } else {
            // Create new preset for the conversion
            const newPreset = await ctx.db.preset.create({
              data: {
                item_id: existingPreset.item_id,
                main_unit_id: toUnit.unit_id,
                main_price: conversion.price,
              },
            });
            currentPresetId = newPreset.preset_id;
          }

          currentUnitId = toUnit.unit_id;
        }
      }

      // Update final preset in the chain
      const finalPreset = await ctx.db.preset.findFirst({
        where: { preset_id: currentPresetId },
        include: { conversions: true },
      });

      if (finalPreset && finalPreset.conversions.length === 0) {
        await ctx.db.preset.update({
          where: { preset_id: currentPresetId },
          data: {
            main_price: conversions[conversions.length - 1]?.price,
          },
        });
      }

      return updatedPreset;
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
