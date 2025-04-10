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
      // Update or create stock level
      await db.stockLevel.upsert({
        where: { variant_id: variantId },
        update: {
          low_stock: lowStock,
          very_low_stock: veryLowStock,
        },
        create: {
          variant_id: variantId,
          low_stock: lowStock,
          very_low_stock: veryLowStock,
        },
      });
      return updatedVariant;
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

  createPreset: publicProcedure
    .input(
      z.object({
        itemId: z.number(),
        mainUnit: z.string(),
        mainPrice: z.number(),
        conversions: z.array(
          z.object({
            qty: z.number(),
            unit: z.string(),
            price: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { itemId, mainUnit, mainPrice, conversions } = input;

      console.log("Creating preset with data:", JSON.stringify(input, null, 2));

      // Find or create main unit without creating special price units
      const mainUnitRecord = await ctx.db.unit.upsert({
        where: { name: mainUnit },
        create: { name: mainUnit },
        update: {},
      });

      // Check if a preset with this main unit already exists for this item
      const existingMainPreset = await ctx.db.preset.findFirst({
        where: {
          item_id: itemId,
          main_unit_id: mainUnitRecord.unit_id,
        },
      });

      // If preset already exists, use a different strategy - don't update existing presets
      if (existingMainPreset) {
        console.log(
          `A preset with main unit ${mainUnit} already exists for this item.`,
        );
        console.log(
          `Creating a new preset chain instead of modifying the existing one.`,
        );
      }

      // Always create a new main preset - don't update existing ones
      const mainPreset = await ctx.db.preset.create({
        data: {
          item_id: itemId,
          main_unit_id: mainUnitRecord.unit_id,
          main_price: mainPrice,
        },
      });

      console.log(`Created new main preset with ID: ${mainPreset.preset_id}`);

      // Process each conversion in sequential order to properly chain them
      let lastUnitId = mainUnitRecord.unit_id; // Start with the main unit (Boxes)
      let lastPresetId = mainPreset.preset_id;

      for (const conversion of conversions) {
        // Find or create the to_unit (Pack, Pieces)
        const toUnitRecord = await ctx.db.unit.upsert({
          where: { name: conversion.unit },
          create: { name: conversion.unit },
          update: {},
        });

        // Create the conversion from the previous unit to this unit
        const conversionRecord = await ctx.db.presetConversion.create({
          data: {
            preset_id: lastPresetId,
            from_unit_id: lastUnitId,
            to_unit_id: toUnitRecord.unit_id,
            conversion_rate: conversion.qty,
          },
        });

        console.log(
          `Created preset conversion with ID: ${conversionRecord.preset_conversion_id}`,
        );

        // Create preset for this unit with its price
        const unitPreset = await ctx.db.preset.create({
          data: {
            item_id: itemId,
            main_unit_id: toUnitRecord.unit_id,
            main_price: conversion.price,
          },
        });

        console.log(`Created unit preset with ID: ${unitPreset.preset_id}`);

        // Update for next iteration to chain properly
        lastUnitId = toUnitRecord.unit_id;
        lastPresetId = unitPreset.preset_id;
      }

      // Return the complete preset chain, starting from the main preset
      return ctx.db.preset.findUnique({
        where: { preset_id: mainPreset.preset_id },
        include: {
          conversions: {
            include: {
              from_unit: true,
              to_unit: true,
            },
          },
        },
      });
    }),

  updatePreset: publicProcedure
    .input(
      z.object({
        presetId: z.number(),
        mainUnit: z.string(),
        mainPrice: z.number(),
        conversions: z.array(
          z.object({
            id: z.number().optional(), // Preset conversion ID if it exists
            qty: z.number(),
            unit: z.string(),
            price: z.number(),
            isNew: z.boolean().optional(), // Flag to indicate if this is a new conversion
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { presetId, mainUnit, mainPrice, conversions } = input;

      console.log(
        "Updating preset with data:",
        JSON.stringify(
          {
            presetId,
            mainUnit,
            mainPrice,
            conversions,
          },
          null,
          2,
        ),
      );

      // Get the existing preset
      const existingPreset = await ctx.db.preset.findUnique({
        where: { preset_id: presetId },
        include: {
          conversions: {
            include: {
              to_unit: true,
              from_unit: true,
            },
          },
          main_unit: true,
        },
      });

      if (!existingPreset) {
        throw new Error(`Preset with ID ${presetId} not found`);
      }

      // Get the item_id from the preset
      const itemId = existingPreset.item_id;

      // Find all presets in this chain
      const allPresets = await ctx.db.preset.findMany({
        where: { item_id: itemId },
        include: {
          conversions: true,
          main_unit: true,
        },
      });

      // Build a map of preset IDs to preset objects for quicker lookups
      const presetMap = new Map(
        allPresets.map((preset) => [preset.preset_id, preset]),
      );

      // Update only the main preset's price - this is the only value we'll change
      // without explicit user input
      if (existingPreset.main_price !== mainPrice) {
        await ctx.db.preset.update({
          where: { preset_id: presetId },
          data: { main_price: mainPrice },
        });
        console.log(`Updated main preset ID ${presetId} price to ${mainPrice}`);
      }

      // Track which conversion IDs we've processed
      const processedConversionIds = new Set<number>();

      // Process only existing conversions - update their rates if needed
      for (const conversion of conversions) {
        // Skip any conversion without an ID (these would be new ones we don't want to auto-create)
        if (!conversion.id && !conversion.isNew) {
          console.log(
            `Skipping conversion without ID that isn't marked as new: ${conversion.unit}`,
          );
          continue;
        }

        // If it's an existing conversion, update it
        if (conversion.id) {
          const existingConversion = await ctx.db.presetConversion.findUnique({
            where: { preset_conversion_id: conversion.id },
            include: { to_unit: true },
          });

          if (!existingConversion) {
            console.log(
              `Warning: Conversion with ID ${conversion.id} not found`,
            );
            continue;
          }

          // Mark this conversion as processed
          processedConversionIds.add(conversion.id);

          // Update the conversion rate if it changed
          if (existingConversion.conversion_rate !== conversion.qty) {
            await ctx.db.presetConversion.update({
              where: { preset_conversion_id: conversion.id },
              data: { conversion_rate: conversion.qty },
            });
            console.log(
              `Updated conversion ${conversion.id} rate to ${conversion.qty}`,
            );
          }

          // Find the linked preset (the one where main_unit_id = this conversion's to_unit_id)
          const linkedPreset = allPresets.find(
            (p) => p.main_unit_id === existingConversion.to_unit_id,
          );

          // Update the linked preset's price if it exists and price changed
          if (linkedPreset && linkedPreset.main_price !== conversion.price) {
            await ctx.db.preset.update({
              where: { preset_id: linkedPreset.preset_id },
              data: { main_price: conversion.price },
            });
            console.log(
              `Updated linked preset ${linkedPreset.preset_id} price to ${conversion.price}`,
            );
          }
        }
        // Only create a new conversion if explicitly marked as new
        else if (conversion.isNew) {
          console.log(
            `Creating new conversion for unit ${conversion.unit} with rate ${conversion.qty}`,
          );

          // Find or create the unit
          const toUnitRecord = await ctx.db.unit.upsert({
            where: { name: conversion.unit },
            create: { name: conversion.unit },
            update: {},
          });

          // Create the new conversion
          const newConversion = await ctx.db.presetConversion.create({
            data: {
              preset_id: presetId,
              from_unit_id: existingPreset.main_unit_id,
              to_unit_id: toUnitRecord.unit_id,
              conversion_rate: conversion.qty,
            },
          });

          // Create a linked preset for this new unit
          const newPreset = await ctx.db.preset.create({
            data: {
              item_id: itemId,
              main_unit_id: toUnitRecord.unit_id,
              main_price: conversion.price,
            },
          });

          console.log(
            `Created new conversion ${newConversion.preset_conversion_id} and linked preset ${newPreset.preset_id}`,
          );
        }
      }

      // Return the updated preset with its conversions
      const result = await ctx.db.preset.findUnique({
        where: { preset_id: presetId },
        include: {
          conversions: {
            include: {
              to_unit: true,
              from_unit: true,
            },
            orderBy: {
              preset_conversion_id: "asc",
            },
          },
        },
      });

      return result;
    }),

  editItem: publicProcedure
    .input(
      z.object({
        inventoryId: z.number(), // This is actually inventory_number now
        name: z.string(),
        brand: z.string(),
        category: z.string(),
        description: z.string().optional(),
        variants: z.array(
          z.object({
            id: z.number().optional(), // Variant ID
            name: z.string(),
            lowStock: z.number().min(1, "Low Stock must be greater than 0."),
            veryLowStock: z
              .number()
              .min(1, "Very Low Stock must be greater than 0."),
          }),
        ),
        inventoryClerk: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const {
        inventoryId,
        name,
        brand,
        category,
        description,
        variants,
        inventoryClerk,
      } = input;

      // Fetch inventory using inventory_number
      const inventoryRecord = await db.inventory.findUnique({
        where: { inventory_number: inventoryId },
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
            },
          },
        },
      });

      if (!inventoryRecord?.variant?.item) {
        throw new Error("Item not found");
      }

      // Extract variant and item
      const variant = inventoryRecord.variant;
      const item = variant.item;

      // Update brand name
      const updatedBrand = await db.brand.update({
        where: { brand_id: item.brand.brand_id },
        data: { name: brand },
      });

      // Update category name
      const updatedCategory = await db.category.update({
        where: { category_id: item.category.category_id },
        data: { name: category },
      });

      // Update item details
      const updatedItem = await db.item.update({
        where: { item_id: item.item_id },
        data: {
          name,
          description,
          brand_id: updatedBrand.brand_id,
          category_id: updatedCategory.category_id,
        },
      });

      const updatedVariants = await Promise.all(
        variants.map(async (variantData) => {
          if (variantData.id) {
            // Check if the variant exists before updating
            const existingVariant = await db.variant.findUnique({
              where: { variant_id: variantData.id },
              include: { StockLevel: true },
            });

            if (!existingVariant) {
              throw new Error(`Variant with ID ${variantData.id} not found`);
            }

            // Update the existing variant
            await db.variant.update({
              where: { variant_id: variantData.id },
              data: { name: variantData.name },
            });

            // Ensure stock level is updated properly
            await db.stockLevel.upsert({
              where: { variant_id: variantData.id }, // Use existing variant ID
              update: {
                low_stock: variantData.lowStock,
                very_low_stock: variantData.veryLowStock,
              },
              create: {
                variant_id: variantData.id,
                low_stock: variantData.lowStock,
                very_low_stock: variantData.veryLowStock,
              },
            });

            return variantData.id;
          }

          // Create new variant
          const newVariant = await db.variant.create({
            data: {
              name: variantData.name,
              item_id: updatedItem.item_id,
            },
          });

          // Create stock level entry
          await db.stockLevel.create({
            data: {
              variant_id: newVariant.variant_id,
              low_stock: variantData.lowStock,
              very_low_stock: variantData.veryLowStock,
            },
          });

          // Create new inventory record
          await db.inventory.create({
            data: {
              variant_id: newVariant.variant_id,
              quantity: 0,
              inventory_clerk: inventoryClerk,
              inventory_number: Math.floor(1000000 + Math.random() * 9000000),
            },
          });

          return newVariant.variant_id;
        }),
      );

      return { updatedItem, updatedVariants };
    }),

  deleteItem: publicProcedure
    .input(
      z.object({
        inventoryId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { inventoryId } = input;

      // Fetch the variant associated with the inventoryId
      const variant = await db.variant.findUnique({
        where: { variant_id: inventoryId },
        include: {
          item: true, // Include the related item to access its ID
        },
      });

      if (!variant) {
        throw new Error("Variant not found");
      }

      const itemId = variant.item?.item_id;

      if (!itemId) {
        throw new Error("Associated item not found");
      }

      // Delete the Item and rely on cascading deletes for related records
      await db.item.delete({
        where: { item_id: itemId },
      });

      return { message: "Item and all related records deleted successfully." };
    }),

  deleteVariant: publicProcedure
    .input(
      z.object({
        variantId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { variantId } = input;
      console.log(`Deleting variant with ID: ${variantId}`);

      try {
        // First, delete related inventory records
        await ctx.db.inventory.deleteMany({
          where: { variant_id: variantId },
        });

        // Delete related stock levels
        await ctx.db.stockLevel.deleteMany({
          where: { variant_id: variantId },
        });

        // Delete the variant itself
        const deletedVariant = await ctx.db.variant.delete({
          where: { variant_id: variantId },
        });

        return { success: true, deletedVariant };
      } catch (error) {
        console.error("Failed to delete variant:", error);
        throw new Error("Failed to delete variant");
      }
    }),

  deletePreset: publicProcedure
    .input(
      z.object({
        presetId: z.number(),
        shouldMarkOnly: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { presetId, shouldMarkOnly = true } = input;
      console.log(
        `Marking preset with ID ${presetId} for deletion (actual delete: ${!shouldMarkOnly})`,
      );

      try {
        // First get the preset to get item_id
        const preset = await ctx.db.preset.findUnique({
          where: { preset_id: presetId },
          include: {
            conversions: {
              include: {
                to_unit: true,
              },
            },
          },
        });

        if (!preset) {
          throw new Error(`Preset with ID ${presetId} not found`);
        }

        const itemId = preset.item_id;

        // Find all presets for this item
        const allPresets = await ctx.db.preset.findMany({
          where: { item_id: itemId },
          include: { conversions: true },
        });

        // Find all presets in the chain
        const presetsToDelete = findPresetChain(presetId, allPresets).map(
          (p) => p.preset_id,
        );

        console.log(
          `Found ${presetsToDelete.length} presets to mark for deletion`,
        );

        if (shouldMarkOnly) {
          // Just return the IDs without deleting anything
          return {
            success: true,
            message: `Marked ${presetsToDelete.length} presets for deletion`,
            presetsToDelete,
          };
        } else {
          // Actually delete the presets and their conversions
          // Delete all preset conversions for all presets in the chain
          await ctx.db.presetConversion.deleteMany({
            where: {
              preset_id: {
                in: presetsToDelete,
              },
            },
          });

          // Delete all presets in the chain
          await ctx.db.preset.deleteMany({
            where: {
              preset_id: {
                in: presetsToDelete,
              },
            },
          });

          return {
            success: true,
            message: `Deleted ${presetsToDelete.length} presets`,
            presetsToDelete,
          };
        }
      } catch (error) {
        console.error("Failed to delete preset:", error);
        throw new Error("Failed to delete preset");
      }
    }),

  getPresetsByItemId: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input }) => {
      const { itemId } = input;

      try {
        // Fetch all presets for the given item ID with their conversions and units
        const allPresets = await db.preset.findMany({
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
        });

        console.log(`Found ${allPresets.length} presets for item ID ${itemId}`);

        // Find top-level presets (ones that have conversions but aren't the target of any conversion)
        // These are the "root" presets in our chains (like "Boxes")

        // First, build a map of all presets that are targets of conversions
        const targetUnitIds = new Set(
          allPresets.flatMap((preset) =>
            preset.conversions.map((conv) => conv.to_unit_id),
          ),
        );

        // Build a map of preset IDs to quickly identify which presets are part of chains
        const presetInChain = new Map<number, boolean>();

        // For each preset...
        allPresets.forEach((preset) => {
          // If this preset has conversions pointing to other presets
          if (preset.conversions.length > 0) {
            // For each of its conversions
            preset.conversions.forEach((conv) => {
              // Find presets where their main unit is the target of this conversion
              const targetPresets = allPresets.filter(
                (p) => p.main_unit_id === conv.to_unit_id,
              );
              // Mark these presets as part of a chain (not root presets)
              targetPresets.forEach((tp) => {
                presetInChain.set(tp.preset_id, true);
              });
            });
          }
        });

        // Get all root presets - ones that aren't targets in any conversion chain
        const rootPresets = allPresets.filter(
          (preset) =>
            !presetInChain.has(preset.preset_id) &&
            preset.conversions.length > 0,
        );

        console.log(`Found ${rootPresets.length} root presets`);

        if (rootPresets.length === 0) {
          // If no root presets found, return all presets with conversions as a fallback
          return allPresets.filter((p) => p.conversions.length > 0);
        }

        // For each root preset, gather all conversions in the chain
        const resultPresets: ProcessedPreset[] = [];

        for (const rootPreset of rootPresets) {
          console.log(
            `Processing root preset: ${rootPreset.preset_id} (${rootPreset.main_unit.name})`,
          );

          // Start with the main preset data
          const processedPreset: ProcessedPreset = {
            ...rootPreset,
            conversions: [],
          };

          // Build the complete conversion chain by traversing all linked presets
          const allChainConversions: ProcessedPresetConversion[] = [];
          const processedUnitIds = new Set<number>();

          // First add the direct conversions from the root preset (level 1)
          for (const directConv of rootPreset.conversions) {
            // Find the next preset in the chain where this conversion points to
            const nextPreset = allPresets.find(
              (p) => p.main_unit_id === directConv.to_unit_id,
            );

            // Add the conversion with price from the next preset
            allChainConversions.push({
              ...directConv,
              related_price: nextPreset?.main_price || null,
            });

            // Track that we've processed this unit
            processedUnitIds.add(directConv.to_unit_id);

            // Now find subsequent conversions in the chain
            if (nextPreset) {
              const chainedConversions = gatherChainedConversions(
                nextPreset,
                allPresets,
                processedUnitIds,
              );

              // Add all chained conversions to our list
              allChainConversions.push(...chainedConversions);
            }
          }

          // Set all conversions for this preset
          processedPreset.conversions = allChainConversions;
          resultPresets.push(processedPreset);
        }

        console.log(`Returning ${resultPresets.length} processed presets`);
        return resultPresets;
      } catch (error) {
        console.error(`Error fetching presets for item ID ${itemId}:`, error);
        throw new Error("Failed to fetch presets");
      }
    }),

  verifyPassword: publicProcedure
    .input(
      z.object({
        personalDetailsId: z.string(), // ID from the session
        password: z.string(), // Password input by the user
      }),
    )
    .mutation(async ({ input }) => {
      const { personalDetailsId, password } = input;

      // Fetch the authentication record for the user
      const authRecord = await db.authentication.findUnique({
        where: { personal_details_id: personalDetailsId },
      });

      if (!authRecord) {
        throw new Error("User not found.");
      }

      // Compare the input password with the stored password
      if (authRecord.password !== password) {
        throw new Error("Incorrect password.");
      }

      return { success: true, message: "Password verified." };
    }),

  // ~/server/api/inventory.ts
  updateSupplierUnits: publicProcedure
    .input(
      z.object({
        batchVariantId: z.number(),
        units: z.array(
          z.object({
            operation: z.enum(["create", "update", "delete"]),
            supplierUnitId: z.number().optional(),
            data: z.object({
              stock: z.string().transform(Number),
              price: z.string().transform(Number),
              unit: z.string(),
              conversionQty: z
                .string()
                .transform((v) => (v ? Number(v) : null)),
              conversionUnit: z.string(),
              supplierId: z.string(),
            }),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { batchVariantId, units } = input;

      return await db.$transaction(
        async (prisma) => {
          const results: any[] = [];
          const BATCH_SIZE = 10;

          for (let i = 0; i < units.length; i += BATCH_SIZE) {
            const batch = units.slice(i, i + BATCH_SIZE);

            await Promise.all(
              batch.map(async (unit) => {
                try {
                  switch (unit.operation) {
                    case "create":
                      const newUnit = await prisma.supplierUnit.create({
                        data: {
                          batchVariant: {
                            connect: {
                              batch_variant_id: batchVariantId,
                            },
                          },
                          supplier: {
                            connect: {
                              id: unit.data.supplierId,
                            },
                          },
                          quantity_per_unit: Number(unit.data.stock),
                          total_quantity: Number(unit.data.stock),
                          price: Number(unit.data.price),
                          unit: {
                            connect: {
                              name: unit.data.unit,
                            },
                          },
                          ConversionRate:
                            unit.data.conversionQty && unit.data.conversionUnit
                              ? {
                                  create: {
                                    conversion_rate: Number(
                                      unit.data.conversionQty,
                                    ),
                                    fromUnit: {
                                      connect: {
                                        name: unit.data.unit,
                                      },
                                    },
                                    toUnit: {
                                      connect: {
                                        name: unit.data.conversionUnit,
                                      },
                                    },
                                  },
                                }
                              : undefined,
                        },
                        include: {
                          ConversionRate: true,
                        },
                      });
                      results.push(newUnit);
                      break;

                    case "update":
                      // Get existing conversion rate
                      const existingConversion =
                        await prisma.conversionRate.findFirst({
                          where: {
                            supplier_unit_id: unit.supplierUnitId,
                          },
                        });

                      const updateData = {
                        quantity_per_unit: Number(unit.data.stock),
                        price: Number(unit.data.price),
                        unit: {
                          connect: {
                            name: unit.data.unit,
                          },
                        },
                        ConversionRate:
                          unit.data.conversionQty && unit.data.conversionUnit
                            ? {
                                upsert: {
                                  where: {
                                    conversion_id:
                                      existingConversion?.conversion_id ?? -1,
                                  },
                                  create: {
                                    conversion_rate: Number(
                                      unit.data.conversionQty,
                                    ),
                                    fromUnit: {
                                      connect: { name: unit.data.unit },
                                    },
                                    toUnit: {
                                      connect: {
                                        name: unit.data.conversionUnit,
                                      },
                                    },
                                  },
                                  update: {
                                    conversion_rate: Number(
                                      unit.data.conversionQty,
                                    ),
                                    toUnit: {
                                      connect: {
                                        name: unit.data.conversionUnit,
                                      },
                                    },
                                  },
                                },
                              }
                            : {
                                deleteMany: {
                                  supplier_unit_id: unit.supplierUnitId,
                                },
                              },
                      };

                      const updatedUnit = await prisma.supplierUnit.update({
                        where: { supplier_unit_id: unit.supplierUnitId },
                        data: updateData,
                        include: { ConversionRate: true },
                      });
                      results.push(updatedUnit);
                      break;

                    case "delete":
                      if (unit.supplierUnitId) {
                        await prisma.conversionRate.deleteMany({
                          where: { supplier_unit_id: unit.supplierUnitId },
                        });
                        const deletedUnit = await prisma.supplierUnit.delete({
                          where: { supplier_unit_id: unit.supplierUnitId },
                        });
                        results.push(deletedUnit);
                      }
                      break;
                  }
                } catch (error) {
                  console.error(`Error processing unit:`, unit);
                  throw error;
                }
              }),
            );
          }
          return results;
        },
        {
          maxWait: 30000,
          timeout: 30000,
        },
      );
    }),
});

export default inventoryRouter;

// Helper function to find all presets in a chain starting from a root preset ID
function findPresetChain(rootPresetId: number, allPresets: any[]): any[] {
  // Start with the root preset
  const rootPreset = allPresets.find((p) => p.preset_id === rootPresetId);
  if (!rootPreset) return [];

  // Initialize with the root preset
  const chainPresets = [rootPreset];
  const processedPresetIds = new Set<number>([rootPresetId]);
  let foundNew = true;

  // Keep finding connected presets until no more found
  while (foundNew) {
    foundNew = false;

    // For each preset we've already found
    for (const currentPreset of [...chainPresets]) {
      // Create copy to avoid iteration issues
      // Look at its conversions
      for (const conv of currentPreset.conversions) {
        // Find any preset that has its main unit matching this conversion's to_unit
        const nextPreset = allPresets.find(
          (p) =>
            p.main_unit_id === conv.to_unit_id &&
            !processedPresetIds.has(p.preset_id),
        );

        if (nextPreset) {
          // Found a new preset in the chain
          chainPresets.push(nextPreset);
          processedPresetIds.add(nextPreset.preset_id);
          foundNew = true;
        }
      }
    }
  }

  return chainPresets;
}

// Helper function to gather conversions from presets further down the chain
function gatherChainedConversions(
  preset: any,
  allPresets: any[],
  processedUnitIds: Set<number>,
): ProcessedPresetConversion[] {
  const conversions: ProcessedPresetConversion[] = [];

  // Process each conversion in this preset
  for (const conv of preset.conversions) {
    // Skip if we've already processed this unit (prevents circular references)
    if (processedUnitIds.has(conv.to_unit_id)) {
      continue;
    }

    // Find the next preset in the chain
    const nextPreset = allPresets.find(
      (p) => p.main_unit_id === conv.to_unit_id,
    );

    // Add this conversion with its price
    conversions.push({
      ...conv,
      related_price: nextPreset?.main_price || null,
    });

    // Mark this unit as processed
    processedUnitIds.add(conv.to_unit_id);

    // Recurse into the next preset if it exists
    if (nextPreset) {
      const nextConversions = gatherChainedConversions(
        nextPreset,
        allPresets,
        processedUnitIds,
      );

      conversions.push(...nextConversions);
    }
  }

  return conversions;
}
