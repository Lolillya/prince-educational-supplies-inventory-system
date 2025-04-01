import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const restockNotesSchema = z.object({
  invoice_number: z.number(),
  invoice_id: z.number(),
  notes: z.string(),
});
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

        // First, get all the presets for this item
        const mainPresets = await db.preset.findMany({
          where: {
            item_id: itemId,
          },
          select: {
            preset_id: true,
            main_unit_id: true,
            main_price: true,
            main_unit: {
              select: {
                unit_id: true,
                name: true,
              },
            },
            conversions: {
              select: {
                preset_conversion_id: true,
                conversion_rate: true,
                from_unit_id: true,
                to_unit_id: true,
                from_unit: {
                  select: {
                    unit_id: true,
                    name: true,
                  },
                },
                to_unit: {
                  select: {
                    unit_id: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                created_at: "asc",
              },
            },
          },
        });

        console.log(`Found ${mainPresets.length} main presets`);

        // Then get a separate list of all unit presets with their prices
        const unitPrices = await db.preset.findMany({
          where: {
            item_id: itemId,
          },
          select: {
            main_unit_id: true,
            main_price: true,
            main_unit: {
              select: {
                name: true,
              },
            },
          },
        });

        console.log(`Found ${unitPrices.length} unit prices`);
        unitPrices.forEach((up) => {
          console.log(
            `Unit ID: ${up.main_unit_id}, Price: ${up.main_price}, Name: ${up.main_unit?.name}`,
          );
        });

        // Create a map of unit ID to price
        const unitPriceMap = new Map<number, number>();
        unitPrices.forEach((up) => {
          unitPriceMap.set(up.main_unit_id, up.main_price);
        });

        // Format presets for easier consumption by frontend
        const formattedPresets = mainPresets
          .map((preset) => {
            // Skip presets with no conversions
            if (preset.conversions.length === 0) {
              return null;
            }

            console.log(`\n\n---- Processing preset ${preset.preset_id} ----`);
            console.log(
              `Main unit: ${preset.main_unit.name} (ID: ${preset.main_unit_id})`,
            );
            console.log(`Raw conversions (${preset.conversions.length}):`);
            preset.conversions.forEach((conv, i) => {
              console.log(
                `  [${i}] ID: ${conv.preset_conversion_id}, From: ${conv.from_unit.name} (${conv.from_unit_id}) → To: ${conv.to_unit.name} (${conv.to_unit_id}), Rate: ${conv.conversion_rate}`,
              );
            });

            // Sort conversions to ensure they form a proper chain
            // We'll create a proper chain by ordering them correctly
            const sortedConversions = [];
            const fromUnitToConversion = new Map();

            // First, create a map of from_unit_id to conversion
            preset.conversions.forEach((conv) => {
              if (!fromUnitToConversion.has(conv.from_unit_id)) {
                fromUnitToConversion.set(conv.from_unit_id, []);
              }
              fromUnitToConversion.get(conv.from_unit_id).push(conv);
            });

            console.log("Created map of from_unit_id to conversions:");
            fromUnitToConversion.forEach((convs, unitId) => {
              console.log(
                `  Unit ID ${unitId} has ${convs.length} outgoing conversions`,
              );
              convs.forEach((c: any, i: number) => {
                console.log(
                  `    [${i}] To: ${c.to_unit.name} (${c.to_unit_id}), Rate: ${c.conversion_rate}`,
                );
              });
            });

            // Start with conversions from the main unit
            let currentUnitId = preset.main_unit_id;
            console.log(
              `Starting with main unit ID: ${currentUnitId} (${preset.main_unit.name})`,
            );

            // Keep track of processed unit IDs to avoid infinite loops
            const processedUnitIds = new Set();

            // Build the chain
            let iterationCount = 0;
            while (
              fromUnitToConversion.has(currentUnitId) &&
              !processedUnitIds.has(currentUnitId) &&
              iterationCount < 10 // Safety limit
            ) {
              iterationCount++;
              console.log(
                `Iteration ${iterationCount}: Processing unit ID ${currentUnitId}`,
              );
              processedUnitIds.add(currentUnitId);

              const nextConversions = fromUnitToConversion.get(currentUnitId);
              if (nextConversions && nextConversions.length > 0) {
                // Sort by creation date in case there are multiple options
                const nextConversion = nextConversions[0];
                console.log(
                  `  Adding conversion: ${nextConversion.from_unit.name} → ${nextConversion.to_unit.name}, Rate: ${nextConversion.conversion_rate}`,
                );
                sortedConversions.push(nextConversion);
                currentUnitId = nextConversion.to_unit_id;
                console.log(`  Next unit ID: ${currentUnitId}`);
              } else {
                console.log(
                  `  No more conversions from unit ID ${currentUnitId}`,
                );
                break;
              }
            }

            // Check for missing conversions and add them if they exist
            if (sortedConversions.length < preset.conversions.length) {
              console.log(
                `WARNING: ${preset.conversions.length - sortedConversions.length} conversions were not included in chain`,
              );

              // Use a Set to keep track of included conversion IDs
              const includedIds = new Set(
                sortedConversions.map((c) => c.preset_conversion_id),
              );

              // Find all missing conversions
              const missingConversions = preset.conversions.filter(
                (c) => !includedIds.has(c.preset_conversion_id),
              );

              console.log(
                `Adding ${missingConversions.length} missing conversions to the chain`,
              );
              missingConversions.forEach((c, i) => {
                console.log(
                  `  Adding missing conversion [${i}]: From: ${c.from_unit.name} (${c.from_unit_id}) → To: ${c.to_unit.name} (${c.to_unit_id}), Rate: ${c.conversion_rate}`,
                );
                sortedConversions.push(c);
              });
            }

            if (iterationCount >= 10) {
              console.log(
                "WARNING: Reached maximum iteration count, possible circular dependency",
              );
            }

            console.log(`Sorted conversions (${sortedConversions.length}):`);
            sortedConversions.forEach((conv, i) => {
              console.log(
                `  [${i}] From: ${conv.from_unit.name} → To: ${conv.to_unit.name}, Rate: ${conv.conversion_rate}`,
              );
            });

            const result = {
              presetId: preset.preset_id,
              mainUnit: preset.main_unit.name,
              mainPrice: preset.main_price,
              conversions: sortedConversions.map((conversion) => {
                // Get the price from the map using the to_unit_id
                const conversionPrice =
                  unitPriceMap.get(conversion.to_unit_id) || 0;

                return {
                  fromUnit: conversion.from_unit.name,
                  toUnit: conversion.to_unit.name,
                  conversionRate: conversion.conversion_rate,
                  price: conversionPrice,
                };
              }),
              conversionCount: sortedConversions.length,
            };

            console.log(
              `Final result: Preset with ${result.conversions.length} conversions`,
            );
            result.conversions.forEach((c, i) => {
              console.log(
                `  Conversion ${i + 1}: ${c.fromUnit} → ${c.toUnit} (${c.conversionRate}), Price: ${c.price}`,
              );
            });

            return result;
          })
          .filter(Boolean); // Filter out null entries

        return formattedPresets;
      } catch (error) {
        console.error("Error fetching item presets:", error);
        throw new Error("Failed to fetch item presets.");
      }
    }),
});
