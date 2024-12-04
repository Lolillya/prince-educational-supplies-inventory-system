import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

// Define a helper function for normalization
const normalizeInput = (input: string) => input.trim().toLowerCase();

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
        .input(
            z.object({
                firstname: z.string().max(50, "First Name must be at most 50 characters long").transform(normalizeInput),
                lastname: z.string().max(50, "Last Name must be at most 50 characters long").transform(normalizeInput),
                company: z.string().min(2, "Business Name is required").max(100, "Company name must be at most 100 characters long").optional().transform(normalizeInput),
                email: z
                    .string()
                    .optional() // Allows undefined
                    .refine(
                        value => value === "" || z.string().email().safeParse(value).success,
                        {
                            message: "Invalid email address format",
                        }
                    ),

                contact: z.string().max(15, "Contact must be at most 15 digits long").optional().transform(normalizeInput).refine(value => value === undefined || /^\d*$/.test(value), {
                    message: "Contact must be numeric",
                }),
                notes: z.string().max(500, "Notes must be at most 500 characters long").optional().transform(normalizeInput),
                address: z.object({
                    addressLine: z.string().max(100, "Address Line must be at most 100 characters long").optional().transform(normalizeInput),
                    city: z.string().max(50, "City must be at most 50 characters long").optional().transform(normalizeInput),
                    region: z.string().max(50, "Region must be at most 50 characters long").optional().transform(normalizeInput),
                    country: z.string().max(50, "Country must be at most 50 characters long").optional().transform(normalizeInput),
                    postalCode: z.string().max(4, "Postal Code must be at most 4 digits long").optional().transform(normalizeInput).refine(value => value === undefined || /^\d*$/.test(value), {
                        message: "Postal Code must be numeric",
                    }),
                }).optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { firstname, lastname, company, contact, email, address, notes } = input;

            // Start a transaction for atomic operations
            const createdSupplier = await db.$transaction(async (prisma) => {
                // Insert into Location if address is provided
                let locationId = null;
                if (address) {
                    const location = await prisma.location.create({
                        data: {
                            address_line: address.addressLine ?? null,
                            city: address.city ?? null,
                            region: address.region ?? null,
                            country: address.country ?? null,
                            postal_code: address.postalCode ?? null,
                        },
                    });
                    locationId = location.location_id;
                }

                // Insert into Personal_Details
                const personalDetails = await prisma.personal_Details.create({
                    data: {
                        first_name: firstname,
                        last_name: lastname,
                        company,
                        contact: contact ?? null,
                        email,
                        location_id: locationId,
                        notes: notes ?? null,
                    },
                });

                // Insert into User_Role
                await prisma.user_Role.create({
                    data: {
                        Personal_Details_Id: personalDetails.personal_details_id,
                        role_Id: 4, // Role ID for Supplier
                    },
                });

                return personalDetails;
            });

            return createdSupplier;
        }),

});
