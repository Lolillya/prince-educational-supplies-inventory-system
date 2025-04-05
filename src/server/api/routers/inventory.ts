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
  from_unit: { name: string; created_at: Date; updated_at: Date; unit_id: number; };
  to_unit: { name: string; created_at: Date; updated_at: Date; unit_id: number; };
  related_price?: number | null;
}

type ProcessedPreset = {
  preset_id: number;
  item_id: number;
  main_unit_id: number;
  main_price: number;
  created_at: Date;
  updated_at: Date;
  main_unit: { name: string; created_at: Date; updated_at: Date; unit_id: number; };
  conversions: ProcessedPresetConversion[];
}

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

      // Create/connect main unit
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

      // Create or update main preset
      let preset;
      if (existingMainPreset) {
        // Update existing preset instead of creating a new one
        preset = await ctx.db.preset.update({
          where: { preset_id: existingMainPreset.preset_id },
          data: {
            main_price: mainPrice,
          },
        });
        
        // Delete existing conversions to avoid duplicates
        await ctx.db.presetConversion.deleteMany({
          where: { preset_id: existingMainPreset.preset_id },
        });
      } else {
        // Create new preset if one doesn't exist
        preset = await ctx.db.preset.create({
          data: {
            item_id: itemId,
            main_unit_id: mainUnitRecord.unit_id,
            main_price: mainPrice,
          },
        });
      }

      // Create conversions with prices stored in special presets
      for (const conversion of conversions) {
        // Get/create conversion unit
        const toUnit = await ctx.db.unit.upsert({
          where: { name: conversion.unit },
          create: { name: conversion.unit },
          update: {},
        });

        // Create the conversion
        const createdConversion = await ctx.db.presetConversion.create({
          data: {
            preset_id: preset.preset_id,
            from_unit_id: mainUnitRecord.unit_id,
            to_unit_id: toUnit.unit_id,
            conversion_rate: conversion.qty,
          },
        });

        // Store the price in a special preset with a unique name pattern
        const pricePresetName = `${mainUnit}_to_${conversion.unit}_${preset.preset_id}`;
        
        // Create unit for price
        const priceUnit = await ctx.db.unit.upsert({
          where: { name: pricePresetName },
          create: { name: pricePresetName },
          update: {},
        });

        // Create price preset
        await ctx.db.preset.create({
          data: {
            item_id: itemId,
            main_unit_id: priceUnit.unit_id,
            main_price: conversion.price,
          },
        });
      }

      return ctx.db.preset.findUnique({
        where: { preset_id: preset.preset_id },
        include: { conversions: true },
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
            qty: z.number(),
            unit: z.string(),
            price: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { presetId, mainUnit, mainPrice, conversions } = input;
      
      console.log("Updating preset with data:", JSON.stringify({
        presetId, mainUnit, mainPrice, conversions
      }, null, 2));

      // Get the existing preset
      const existingPreset = await ctx.db.preset.findUnique({
        where: { preset_id: presetId },
        include: { 
          conversions: {
            include: {
              to_unit: true,
              from_unit: true
            }
          }
        },
      });

      if (!existingPreset) {
        throw new Error(`Preset with ID ${presetId} not found`);
      }

      // Update or create main unit
      const mainUnitRecord = await ctx.db.unit.upsert({
        where: { name: mainUnit },
        create: { name: mainUnit },
        update: {},
      });

      // Update main preset
      const updatedPreset = await ctx.db.preset.update({
        where: { preset_id: presetId },
        data: {
          main_unit_id: mainUnitRecord.unit_id,
          main_price: mainPrice,
        },
      });

      // Get the item_id from the preset
      const itemId = existingPreset.item_id;

      // Delete existing conversions for this preset to avoid duplicates
      await ctx.db.presetConversion.deleteMany({
        where: { preset_id: presetId },
      });

      // Create conversions with new technique to store prices
      const conversionPromises = conversions.map(async (conversion) => {
        // Get/create conversion unit
        const toUnit = await ctx.db.unit.upsert({
          where: { name: conversion.unit },
          create: { name: conversion.unit },
          update: {},
        });

        // Create conversion with a specific unique name pattern
        const conversionRate = await ctx.db.presetConversion.create({
          data: {
            preset_id: updatedPreset.preset_id,
            from_unit_id: mainUnitRecord.unit_id,
            to_unit_id: toUnit.unit_id,
            conversion_rate: conversion.qty,
          },
        });

        // Store the conversion price in a separate custom preset just for this conversion
        // We use a naming convention to link this price to the specific conversion
        // Format: preset-{presetId}-conversion-{conversionId}
        const pricePresetName = `${mainUnit}_to_${conversion.unit}_${presetId}`;
        
        // Generate a hash for this specific conversion to ensure uniqueness
        const conversionHash = `${presetId}_${toUnit.unit_id}_${new Date().getTime()}`;
        
        // Create or update a custom unit just for storing this price
        const priceUnit = await ctx.db.unit.upsert({
          where: { name: pricePresetName },
          create: { name: pricePresetName },
          update: {},
        });

        // Store the price in a preset linked to this specific conversion
        const customPreset = await ctx.db.preset.upsert({
          where: {
            // Find by item and this special unit
            preset_id: await ctx.db.preset.findFirst({
              where: {
                item_id: itemId,
                main_unit_id: priceUnit.unit_id,
              },
            }).then(p => p?.preset_id ?? -1)
          },
          create: {
            item_id: itemId,
            main_unit_id: priceUnit.unit_id,
            main_price: conversion.price,
          },
          update: {
            main_price: conversion.price,
          },
        });

        return {
          conversion: conversionRate,
          priceUnit: priceUnit,
          price: conversion.price,
        };
      });

      await Promise.all(conversionPromises);

      const result = await ctx.db.preset.findUnique({
        where: { preset_id: updatedPreset.preset_id },
        include: { 
          conversions: {
            include: {
              to_unit: true,
              from_unit: true
            }
          }
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
    .input(z.object({ variantId: z.number() }))
    .mutation(async ({ input }) => {
      const { variantId } = input;

      return await db.$transaction(async (prisma) => {
        // 1. Get variant and its associated item
        const variant = await prisma.variant.findUnique({
          where: { variant_id: variantId },
          include: { item: true },
        });

        if (!variant) {
          throw new Error("Variant not found");
        }

        const itemId = variant.item.item_id;

        // 2. Delete the variant
        await prisma.variant.delete({
          where: { variant_id: variantId },
        });

        // 3. Check if item has any remaining variants
        const remainingVariants = await prisma.variant.count({
          where: { item_id: itemId },
        });

        if (remainingVariants === 0) {
          // 4. Delete presets first (due to foreign key constraints)
          await prisma.presetConversion.deleteMany({
            where: { preset: { item_id: itemId } },
          });

          await prisma.preset.deleteMany({
            where: { item_id: itemId },
          });

          // 5. Delete the item
          const deletedItem = await prisma.item.delete({
            where: { item_id: itemId },
          });

          // 6. Check brand usage
          const brandUsed = await prisma.item.count({
            where: { brand_id: deletedItem.brand_id },
          });

          if (brandUsed === 0) {
            await prisma.brand.delete({
              where: { brand_id: deletedItem.brand_id },
            });
          }

          // 7. Check category usage
          const categoryUsed = await prisma.item.count({
            where: { category_id: deletedItem.category_id },
          });

          if (categoryUsed === 0) {
            await prisma.category.delete({
              where: { category_id: deletedItem.category_id },
            });
          }
        }

        return {
          message: "Variant and related records deleted successfully.",
        };
      });
    }),

  getPresetsByItemId: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input }) => {
      const { itemId } = input;

      try {
        // Fetch all presets for the given item ID
        const presets = await db.preset.findMany({
          where: { item_id: itemId },
          include: {
            main_unit: true,
            conversions: {
              include: {
                from_unit: true,
                to_unit: true,
              },
              // Add explicit ordering by the preset_conversion_id to maintain consistent order
              orderBy: {
                preset_conversion_id: 'asc'
              }
            },
          },
        });

        // Filter out special price-storing presets (they have distinctive unit names)
        const mainPresets = presets.filter(preset => 
          !preset.main_unit.name.includes('_to_')
        );

        // Process each preset to recover prices from special presets
        const presetsWithPrices: ProcessedPreset[] = await Promise.all(
          mainPresets.map(async (preset): Promise<ProcessedPreset> => {
            if (preset.conversions.length === 0) {
              return {
                ...preset,
                conversions: []
              } as ProcessedPreset;
            }
            
            // Find prices for each conversion
            const conversionsWithPrices: ProcessedPresetConversion[] = await Promise.all(
              preset.conversions.map(async (conv): Promise<ProcessedPresetConversion> => {
                // Look for a price preset with the matching pattern
                const pricePresetName = `${preset.main_unit.name}_to_${conv.to_unit.name}_${preset.preset_id}`;
                
                // Find the unit with this name
                const priceUnit = await db.unit.findFirst({
                  where: { name: pricePresetName }
                });
                
                // If we found the unit, look for the preset with this unit as its main unit
                let price = null;
                if (priceUnit) {
                  const pricePreset = await db.preset.findFirst({
                    where: {
                      item_id: itemId,
                      main_unit_id: priceUnit.unit_id
                    }
                  });
                  
                  if (pricePreset) {
                    price = pricePreset.main_price;
                  }
                }
                
                // Return the conversion with the related price added
                return {
                  ...conv,
                  related_price: price
                } as ProcessedPresetConversion;
              })
            );
            
            // Return the preset with enhanced conversions, maintaining original order
            return {
              ...preset,
              conversions: conversionsWithPrices
            } as ProcessedPreset;
          })
        );

        // Return only presets with conversions (main presets)
        return presetsWithPrices.filter(preset => preset.conversions.length > 0);
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
