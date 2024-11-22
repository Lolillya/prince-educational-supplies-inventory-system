import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

// Helper function to normalize input
const normalizeInput = (value) =>
  typeof value === "string" && value.trim() === "" ? null : value;

// Zod schema for  input validation
const customerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First Name is required")
    .max(50, "First Name must be at most 50 characters long")
    .transform(normalizeInput),
  lastName: z
    .string()
    .min(1, "Last Name is required")
    .max(50, "Last Name must be at most 50 characters long")
    .transform(normalizeInput),
  company: z
    .string()
    .max(100, "Company name must be at most 100 characters long")
    .optional()
    .transform(normalizeInput),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .transform(normalizeInput)
    .refine(
      (value) =>
        value === undefined || z.string().email().safeParse(value).success,
      {
        message: "Invalid email address format",
      },
    ),
  contact: z
    .string()
    .max(15, "Contact must be at most 15 digits long")
    .optional()
    .transform(normalizeInput)
    .refine((value) => value === undefined || /^\d*$/.test(value), {
      message: "Contact must be numeric",
    }),
  notes: z
    .string()
    .max(500, "Notes must be at most 500 characters long")
    .optional()
    .transform(normalizeInput),
  location: z
    .object({
      addressLine: z
        .string()
        .max(100, "Address Line must be at most 100 characters long")
        .optional()
        .transform(normalizeInput),
      city: z
        .string()
        .max(50, "City must be at most 50 characters long")
        .optional()
        .transform(normalizeInput),
      region: z
        .string()
        .max(50, "Region must be at most 50 characters long")
        .optional()
        .transform(normalizeInput),
      country: z
        .string()
        .max(50, "Country must be at most 50 characters long")
        .optional()
        .transform(normalizeInput),
      postalCode: z
        .string()
        .max(4, "Postal Code must be at most 4 digits long")
        .optional()
        .transform(normalizeInput)
        .refine((value) => value === undefined || /^\d*$/.test(value), {
          message: "Postal Code must be numeric",
        }),
    })
    .nullable()
    .optional(),
});

// Define the  router
export const customerRouter = createTRPCRouter({
  // List
  list: publicProcedure.query(async () => {
    return db.personal_Details.findMany({
      include: {
        User_Role: {
          where: {
            role_Id: 3,
          },
        },
      },
      // include: {
      //     personal_details: {
      //         include: {
      //             location: true,
      //         },
      //     },
      // },
    });
  }),

  // Create
  create: publicProcedure.input(customerSchema).mutation(async ({ input }) => {
    const { firstName, lastName, company, email, contact, location, notes } =
      input;

    const newCustomer = await db.personal_Details.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        company,
        email,
        contact,
        notes,
        location: location
          ? {
              create: {
                address_line: location.addressLine,
                city: location.city,
                region: location.region,
                country: location.country,
                postal_code: location.postalCode,
              },
            }
          : undefined,
        User_Role: {
          connect: {
            Role: { Role_name: "CUSTOMER" },
          },
        },
      },
    });

    return newCustomer;
  }),

  // Update
  update: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        firstName: z.string().optional().transform(normalizeInput),
        lastName: z.string().optional().transform(normalizeInput),
        company: z.string().nullable().optional().transform(normalizeInput), // Allow null
        email: z
          .string()
          .nullable()
          .optional()
          .transform(normalizeInput)
          .refine(
            (value) =>
              value === null || z.string().email().safeParse(value).success,
            {
              message: "Invalid email address",
            },
          ),
        contact: z.string().optional().transform(normalizeInput),
        notes: z.string().optional().transform(normalizeInput),
        location: z
          .object({
            addressLine: z.string().optional().transform(normalizeInput),
            city: z.string().optional().transform(normalizeInput),
            region: z.string().optional().transform(normalizeInput),
            country: z.string().optional().transform(normalizeInput),
            postalCode: z.string().optional().transform(normalizeInput),
          })
          .nullable()
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const {
        customerId,
        firstName,
        lastName,
        company,
        email,
        contact,
        location,
        notes,
      } = input;

      // Log the values being processed for update
      console.log("Data being sent for update:", {
        customerId,
        firstName,
        lastName,
        company,
        email,
        contact,
        notes,
        location,
      });

      // Normalize to null if it's empty
      const normalizedCompany = normalizeInput(company);
      const normalizedContact = normalizeInput(contact);
      const normalizedEmail = normalizeInput(email);
      // console.log("Normalized Email:", normalizedEmail);
      const normalizedNotes = normalizeInput(notes);

      // Normalize location fields
      const normalizedLocation = location
        ? {
            addressLine: normalizeInput(location.addressLine),
            city: normalizeInput(location.city),
            region: normalizeInput(location.region),
            country: normalizeInput(location.country),
            postalCode: normalizeInput(location.postalCode),
          }
        : null;

      // Perform the update for personal_details
      const updatedCustomer = await db.personal_Details.update({
        where: { personal_details_id: customerId },
        data: {
          update: {
            ...(firstName ? { first_name: firstName } : {}),
            ...(lastName ? { last_name: lastName } : {}),
            company: normalizedCompany,
            contact: normalizedContact,
            email: normalizedEmail,
            notes: normalizedNotes,
          },

          updated_at: new Date(), // Record the time of the update
        },
        include: { personal_details: true },
      });

      // Ensure  is not null and has personal_details
      if (!updatedCustomer.personal_details) {
        throw new Error("Personal details not found after update.");
      }

      // Handle the location update or deletion
      if (normalizedLocation) {
        await prisma.location.upsert({
          where: {
            location_id: updatedCustomer.personal_details.location_id || 0, // Use the existing location_id
          },
          update: {
            address_line: normalizedLocation.addressLine,
            city: normalizedLocation.city || null,
            region: normalizedLocation.region || null,
            country: normalizedLocation.country || null,
            postal_code: normalizedLocation.postalCode || null,
          },
          create: {
            address_line: normalizedLocation.addressLine,
            city: normalizedLocation.city || null,
            region: normalizedLocation.region || null,
            country: normalizedLocation.country || null,
            postal_code: normalizedLocation.postalCode || null,
            personal_details: {
              connect: {
                personal_details_id:
                  updatedCustomer.personal_details.personal_details_id,
              }, // Connect to the updated personal_details
            },
          },
        });
      } else {
        // If normalizedLocation is null, remove the location association
        const personalDetailsId =
          updatedCustomer.personal_details.personal_details_id;

        // Check if there is an existing location to delete
        if (updatedCustomer.personal_details.location_id) {
          await prisma.location.delete({
            where: {
              location_id: updatedCustomer.personal_details.location_id,
            },
          });
        }
      }
      return updatedCustomer;
    }),
  // Delete an employee
  delete: publicProcedure
    .input(
      z.object({
        customerId: z
          .number()
          .min(1, "Customer ID is required and must be greater than 0"),
      }),
    )
    .mutation(async ({ input }) => {
      const { customerId } = input;

      const deletedCustomer = await prisma.customer.delete({
        where: { customer_id: customerId },
        include: {
          personal_details: {
            include: {
              auth: true,
              location: true,
            },
          },
        },
      });

      return deletedCustomer;
    }),
});
