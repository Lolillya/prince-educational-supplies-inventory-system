import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const supplierInputSchema = z.object({
    company: z.string().min(1, "Company is required"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    contact: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^\d{1,15}$/.test(val),
            "Contact must only contain numbers and be up to 15 digits"
        ),
    email: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            "Invalid email format"
        ),
    addressLine: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
    postalCode: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{4}$/.test(val), "Postal code must be 4 digits"),
    notes: z.string().optional(),
});


export const supplierRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const suppliers = await db.user_Role.findMany({
      where: { role_Id: 4 },
      include: {
        Personal_Details: {
          include: { location: true },
        },
      },
    });
    return suppliers ?? null;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;
      const supplierData = await db.personal_Details.findFirst({
        where: { personal_details_id: id },
        include: {
          location: true,
        },
      });
      return supplierData ?? null; // If not found, return null
    }),

  create: publicProcedure
      .input(supplierInputSchema)
      .mutation(async ({ input }) => {
        const {
          company,
          firstName,
          lastName,
          contact,
          email,
          addressLine,
          city,
          region,
          country,
          postalCode,
          notes,
        } = input;

        // Create location if address details are provided
        let locationId: number | null = null;

        if (addressLine || city || region || country || postalCode) {
          const location = await db.location.create({
            data: {
              address_line: addressLine || null,
              city: city || null,
              region: region || null,
              country: country || null,
              postal_code: postalCode || null,
            },
          });
          locationId = location.location_id;
        }

        // Create supplier personal details
        const personalDetails = await db.personal_Details.create({
          data: {
            company,
            first_name: firstName || null,
            last_name: lastName || null,
            contact: contact || null,
            email: email || null,
            notes: notes || null,
            location_id: locationId,
          },
        });

        // Assign the supplier role
        await db.user_Role.create({
          data: {
            Personal_Details_Id: personalDetails.personal_details_id,
            role_Id: 4, // Assuming 4 is the role ID for "Supplier"
          },
        });

        return { success: true, personalDetails };
      }),

    update: publicProcedure
        .input(
            supplierInputSchema.extend({
                id: z.string().uuid("Invalid supplier ID format"),
            })
        )
        .mutation(async ({ input }) => {
            const {
                id,
                company,
                firstName,
                lastName,
                contact,
                email,
                addressLine,
                city,
                region,
                country,
                postalCode,
                notes,
            } = input;

            // Find the supplier and its associated location
            const supplier = await db.personal_Details.findUnique({
                where: { personal_details_id: id },
                include: { location: true },
            });

            if (!supplier) {
                throw new Error("Supplier not found");
            }

            let locationId: number | null = null;

            // If the supplier doesn't have a location, create one
            if (!supplier.location_id && (addressLine || city || region || country || postalCode)) {
                const location = await db.location.create({
                    data: {
                        address_line: addressLine || null,
                        city: city || null,
                        region: region || null,
                        country: country || null,
                        postal_code: postalCode || null,
                    },
                });
                locationId = location.location_id;
            } else if (supplier.location_id) {
                // If the supplier already has a location, update it
                await db.location.update({
                    where: { location_id: supplier.location_id },
                    data: {
                        address_line: addressLine || null,
                        city: city || null,
                        region: region || null,
                        country: country || null,
                        postal_code: postalCode || null,
                    },
                });
                locationId = supplier.location_id; // Retain the existing location ID
            }

            // Update supplier details with the new or updated location
            await db.personal_Details.update({
                where: { personal_details_id: id },
                data: {
                    company,
                    first_name: firstName || null,
                    last_name: lastName || null,
                    contact: contact || null,
                    email: email || null,
                    notes: notes || null,
                    location_id: locationId, // Associate the supplier with the location
                },
            });

            return { success: true };
        }),


    delete: publicProcedure
        .input(z.object({ id: z.string().uuid("Invalid supplier ID format") }))
        .mutation(async ({ input }) => {
            const { id } = input;

            // Find the supplier to delete and associated location
            const supplier = await db.personal_Details.findUnique({
                where: { personal_details_id: id },
                include: {
                    User_Role: true, // Check if a related User_Role exists
                },
            });

            if (!supplier) {
                throw new Error("Supplier not found");
            }

            // Delete the associated User_Role entry if it exists
            if (supplier.User_Role) {
                await db.user_Role.delete({
                    where: { Personal_Details_Id: id },
                });
            } else {
                console.log("No associated User_Role to delete.");
            }

            // Delete the associated location if it exists
            if (supplier.location_id) {
                await db.location.delete({ where: { location_id: supplier.location_id } });
            } else {
                console.log("No associated location to delete.");
            }

            // Delete the supplier
            await db.personal_Details.delete({
                where: { personal_details_id: id },
            });

            return { success: true };
        }),

});
