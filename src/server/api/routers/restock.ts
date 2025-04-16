import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const restockNotesSchema = z.object({
  invoice_number: z.number(),
  invoice_id: z.number(),
  notes: z.string(),
});

// Define the types first
type PresetUnit = {
  unit_id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
};

type PresetConversion = {
  preset_conversion_id: number;
  preset_id: number;
  conversion_rate: number;
  from_unit_id: number;
  to_unit_id: number;
  from_unit: PresetUnit;
  to_unit: PresetUnit;
  price?: number;
};

type PresetChain = {
  preset_id: number;
  item_id: number;
  main_unit_id: number;
  main_price: number;
  main_unit: PresetUnit;
  conversions: PresetConversion[];
};

export const restockRouter = createTRPCRouter({
  getUnits: publicProcedure.query(async () => {
    try {
      const units = await db.unit.findMany({
        select: { name: true },
      });
      return units;
    } catch (error) {
      console.error("Error fetching units:", error);
      throw new Error("Failed to fetch units.");
    }
  }),

  addUnit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Unit name is required."),
      }),
    )
    .mutation(async ({ input }) => {
      const { name } = input;
      try {
        const result = await db.unit.create({
          data: { name },
        });

        return result;
      } catch (error) {
        console.error("Error adding unit:", error);
        throw new Error(
          `Failed to add unit: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),

  deleteUnit: publicProcedure
    .input(z.object({ name: z.string().min(1, "Unit name is required.") }))
    .mutation(async ({ input }) => {
      const { name } = input;
      try {
        const result = await db.unit.delete({
          where: { name },
        });

        return result;
      } catch (error) {
        console.error("Error deleting unit:", error);
        throw new Error(
          `Failed to delete unit: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),

  getBatchId: publicProcedure.query(async () => {
    try {
      const lastBatch = await db.batch.findFirst({
        orderBy: { batch_id: "desc" },
        select: { batch_id: true },
      });

      const nextBatchId = lastBatch ? lastBatch.batch_id + 1 : 1;
      return nextBatchId;
    } catch (error) {
      console.error("Error fetching batch_id:", error);
      throw new Error("Failed to fetch batch_id.");
    }
  }),
  saveNotes: publicProcedure
    .input(z.object({ notes: restockNotesSchema }))
    .mutation(async ({ ctx, input }) => {
      const { notes } = input;

      const result = await ctx.db.$transaction(async () => {
        await ctx.db.invoice.update({
          where: {
            invoice_id: notes.invoice_id,
            invoice_number: notes.invoice_number,
          },
          data: {
            notes: notes.notes,
          },
        });
      });

      return result;
    }),
  getSuppliers: publicProcedure.query(async () => {
    try {
      const suppliers = await db.user_Role.findMany({
        where: {
          Role: {
            Role_name: "SUPPLIER",
          },
        },
        select: {
          id: true,
          Personal_Details: {
            select: {
              company: true,
            },
          },
        },
      });

      return suppliers.map((supplier) => ({
        id: supplier.id,
        company: supplier.Personal_Details.company || null,
      }));
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw new Error("Failed to fetch suppliers.");
    }
  }),

  saveRestock: publicProcedure
    .input(
      z.object({
        selectedItems: z.array(
          z.object({
            variant_id: z.number(),
            stockValue: z.number(), // Stock value (the value to be added to inventory)
            totalStock: z.number(),
            stockUnits: z.array(
              z.object({
                stock: z.number(),
                price: z.number(),
                unit: z.string(),
                conversionQty: z.number(),
                conversionUnit: z.string(),
              }),
            ),
            inventory_id: z.number(), // Ensure that inventory_id is passed in the input
          }),
        ),
        supplierId: z.string(),
        restockClerk: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { selectedItems, supplierId, restockClerk } = input;

      // Generate a 7-digit batch_number
      const generateBatchNumber = () => {
        return Math.floor(1000000 + Math.random() * 9000000); // Generates a 7-digit number
      };

      // Create a batch for the overall total stock quantity (using totalStock for batch creation)
      const batch = await db.batch.create({
        data: {
          quantity: selectedItems.reduce(
            (acc, item) => acc + item.totalStock,
            0,
          ), // Total stock quantity across all variants
          batch_number: generateBatchNumber(), // Generate a 7-digit batch number
          restock_clerk: restockClerk, // Add restock_clerk
        },
      });

      // Loop through each selected item (variant)
      for (const item of selectedItems) {
        // Create a BatchVariant entry for each variant and link it to the batch
        const batchVariant = await db.batchVariant.create({
          data: {
            batch_id: batch.batch_id,
            variant_id: item.variant_id,
            quantity: item.totalStock, // Store total stock per variant in batchVariant
          },
        });

        // Loop through stock units to save SupplierUnits
        for (const stockUnit of item.stockUnits) {
          // Find the unit based on the unit name
          const unit = await db.unit.findUnique({
            where: { name: stockUnit.unit },
          });

          if (!unit) {
            throw new Error(`Unit ${stockUnit.unit} not found.`);
          }

          // Create the SupplierUnit and associate it with the BatchVariant
          const supplierUnit = await db.supplierUnit.create({
            data: {
              batch_variant_id: batchVariant.batch_variant_id, // Associate with BatchVariant
              supplier_id: supplierId,
              unit_id: unit.unit_id,
              price: stockUnit.price,
              quantity_per_unit: stockUnit.stock,
              total_quantity: stockUnit.stock,
            },
          });

          // If there's a conversion unit and quantity, create a ConversionRate
          if (stockUnit.conversionUnit && stockUnit.conversionQty) {
            const toUnit = await db.unit.findUnique({
              where: { name: stockUnit.conversionUnit },
            });

            if (!toUnit) {
              throw new Error(
                `Conversion unit ${stockUnit.conversionUnit} not found.`,
              );
            }

            await db.conversionRate.create({
              data: {
                supplier_unit_id: supplierUnit.supplier_unit_id,
                from_unit_id: unit.unit_id,
                to_unit_id: toUnit.unit_id,
                conversion_rate: stockUnit.conversionQty,
              },
            });
          }
        }

        // Update the inventory stock by adding stockValue to the current quantity
        const inventory = await db.inventory.findUnique({
          where: { inventory_id: item.inventory_id },
        });

        if (inventory) {
          // Add the stockValue to the current inventory quantity
          await db.inventory.update({
            where: {
              inventory_id: inventory.inventory_id,
            },
            data: {
              quantity: inventory.quantity + item.totalStock, // Increment current quantity by stockValue
            },
          });
        } else {
          // If inventory doesn't exist, create a new record with stockValue
          await db.inventory.create({
            data: {
              variant_id: item.variant_id,
              quantity: item.totalStock, // Set initial stock value as the stockValue
              inventory_clerk: restockClerk,
            },
          });
        }
      }

      return { message: "Restock data saved successfully!" };
    }),

  getRestockData: publicProcedure
    .input(
      z
        .object({
          clerkId: z.string().optional(),
          supplierId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      try {
        const whereClause = {
          OR: [
            ...(input?.clerkId ? [{ restock_clerk: input.clerkId }] : []),
            ...(input?.supplierId
              ? [
                  {
                    batchVariants: {
                      some: {
                        SupplierUnit: {
                          some: {
                            supplier_id: input.supplierId,
                          },
                        },
                      },
                    },
                  },
                ]
              : []),
          ],
        };

        const restocks = await db.batch.findMany({
          where: input ? whereClause : {},
          include: {
            batchVariants: {
              include: {
                variant: {
                  include: {
                    item: {
                      include: {
                        brand: true,
                      },
                    },
                  },
                },
                SupplierUnit: {
                  include: {
                    unit: true,
                    supplier: {
                      include: {
                        Personal_Details: true,
                      },
                    },
                    ConversionRate: {
                      include: {
                        fromUnit: true,
                        toUnit: true,
                      },
                    },
                  },
                },
              },
            },
            Personal_Details: true,
          },
          orderBy: { created_at: "desc" },
        });

        const formattedRestocks = restocks.map((batch) => ({
          restockId: batch.batch_number,
          date: batch.created_at.toISOString().split("T")[0], // Format date to YYYY-MM-DD
          supplier: batch.batchVariants[0]?.SupplierUnit[0]?.supplier
            ?.Personal_Details
            ? batch.batchVariants[0]?.SupplierUnit[0]?.supplier.Personal_Details
                .company
            : "Unknown", // Get supplier's name from personal details
          supplierId:
            batch.batchVariants[0]?.SupplierUnit[0]?.supplier?.id || null, // Include supplier ID
          restockClerk: batch.Personal_Details
            ? `${batch.Personal_Details.first_name} ${batch.Personal_Details.last_name}` // Get clerk's full name
            : "Unknown", // Fallback if clerk details are missing
          addedStock: batch.quantity,
          restockItems: batch.batchVariants.map((batchVariant) => {
            const unitConversions = batchVariant.SupplierUnit.flatMap(
              (supplierUnit) =>
                supplierUnit.ConversionRate.map((rate) => ({
                  from: rate.fromUnit.name,
                  count: rate.conversion_rate,
                  to: rate.toUnit.name,
                  price: supplierUnit.price,
                })),
            );

            return {
              variant: batchVariant.variant.name,
              item: batchVariant.variant.item.name,
              brand: batchVariant.variant.item.brand.name,
              quantity: batchVariant.quantity,
              price: batchVariant.SupplierUnit[0]?.price,
              mainUnit: batchVariant.SupplierUnit[0]?.unit.name || "Unknown",
              unitConversion: unitConversions,
            };
          }),
        }));

        return formattedRestocks;
      } catch (error) {
        console.error("Error fetching restock data:", error);
        throw new Error("Failed to fetch restock data.");
      }
    }),

  getItemPresets: publicProcedure
    .input(
      z.object({
        itemId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const { itemId } = input;
        console.log(`Getting presets for item ID: ${itemId}`);

        // Get all presets for the given item ID
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
        const presetChains: PresetChain[] = [];
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

        console.log(`Found ${startingPresets.length} starting presets`);

        for (const preset of startingPresets) {
          // Skip if this preset has already been processed
          if (processedPresetIds.has(preset.preset_id)) continue;

          // Only process presets that have conversions (these are the starting points of chains)
          if (preset.conversions.length > 0 && preset.main_unit) {
            const chain: PresetChain = {
              preset_id: preset.preset_id,
              item_id: preset.item_id,
              main_unit_id: preset.main_unit_id,
              main_price: preset.main_price,
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
                from_unit: currentConversion.from_unit,
                to_unit: currentConversion.to_unit,
                price: nextPreset.main_price,
              } as PresetConversion);

              // Add the next preset to processed set
              processedPresetIds.add(nextPreset.preset_id);
              currentPreset = nextPreset;
            }

            presetChains.push(chain);
          }
        }

        console.log(`Built ${presetChains.length} preset chains`);

        // Format the presets for the frontend
        const formattedPresets = presetChains.map((chain) => {
          console.log(`Processing chain with id ${chain.preset_id}`);
          console.log(
            `Main unit: ${chain.main_unit.name}, Price: ${chain.main_price}`,
          );
          console.log(`Chain has ${chain.conversions.length} conversions`);

          return {
            presetId: chain.preset_id,
            mainUnit: chain.main_unit.name,
            mainPrice: chain.main_price,
            conversions: chain.conversions.map((conv) => {
              console.log(
                `Conversion: ${conv.from_unit.name} → ${conv.to_unit.name} (${conv.conversion_rate}), Price: ${conv.price}`,
              );
              return {
                fromUnit: conv.from_unit.name,
                toUnit: conv.to_unit.name,
                conversionRate: conv.conversion_rate,
                price: conv.price || 0,
              };
            }),
            conversionCount: chain.conversions.length,
          };
        });

        return formattedPresets;
      } catch (error) {
        console.error("Error fetching item presets:", error);
        throw new Error("Failed to fetch item presets.");
      }
    }),
});
