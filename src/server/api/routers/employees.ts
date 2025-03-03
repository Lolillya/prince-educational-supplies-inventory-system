import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const employeeInputSchema = z.object({
    company: z.string().optional(), // Business name is now optional
    firstName: z.string().min(1, "First name is required"), // First name is required
    lastName: z.string().min(1, "Last name is required"),  // Last name is required
    username: z.string().min(1, "Username is required"),   // Username is required
    password: z.string().min(6, "Password must be at least 6 characters"), // Password is required
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
    isAdmin: z.boolean().default(false),
});

const employeeUpdateInputSchema = z.object({
    company: z.string().optional(), // Business name is now optional
    firstName: z.string().min(1, "First name is required"), // First name is required
    lastName: z.string().min(1, "Last name is required"),  // Last name is required
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
    isAdmin: z.boolean().default(false),
});

export const employeeRouter = createTRPCRouter({
    list: publicProcedure.query(async () => {
        const employees = await db.user_Role.findMany({
            // where: { role_Id: 2 },
            where: { role_Id: { in: [1, 2] } },
            include: {
                Personal_Details: {
                    include: { location: true, auth: true },
                },
            },
        });
        return employees ?? null;
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const { id } = input;
            const employeeData = await db.personal_Details.findFirst({
                where: { personal_details_id: id },
                include: {
                    location: true,
                    auth: true,
                    User_Role: true,
                },
            });
            return employeeData ?? null; // If not found, return null
        }),

    create: publicProcedure
        .input(employeeInputSchema)
        .mutation(async ({ input }) => {
            const {
                company,
                firstName,
                lastName,
                username,
                password,
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

            // Create employee personal details
            const personalDetails = await db.personal_Details.create({
                data: {
                    company: company || null,
                    first_name: firstName,
                    last_name: lastName,
                    contact: contact || null,
                    email: email || null,
                    notes: notes || null,
                    location_id: locationId,
                },
            });

            // Create authentication for the employee
            await db.authentication.create({
                data: {
                    personal_details_id: personalDetails.personal_details_id,
                    username,
                    password, // Make sure to hash the password in a real-world application
                },
            });

            // Assign the employee role
            await db.user_Role.create({
                data: {
                    Personal_Details_Id: personalDetails.personal_details_id,
                    role_Id: input.isAdmin ? 1 : 2, // 1 = ADMIN, 2 = EMPLOYEE
                    emoji: input.isAdmin ? '👑' : '👤',
                },
            });

            return { success: true, personalDetails };
        }),

    update: publicProcedure
        .input(
            employeeUpdateInputSchema.extend({
                id: z.string().uuid("Invalid employee ID format"),
                isAdmin: z.boolean().default(false),
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

            // Find the employee and its associated location
            const employee = await db.personal_Details.findUnique({
                where: { personal_details_id: id },
                include: { location: true, auth: true },
            });

            if (!employee) {
                throw new Error("Employee not found");
            }

            let locationId: number | null = null;

            // If the employee doesn't have a location, create one
            if (!employee.location_id && (addressLine || city || region || country || postalCode)) {
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
            } else if (employee.location_id) {
                // If the employee already has a location, update it
                await db.location.update({
                    where: { location_id: employee.location_id },
                    data: {
                        address_line: addressLine || null,
                        city: city || null,
                        region: region || null,
                        country: country || null,
                        postal_code: postalCode || null,
                    },
                });
                locationId = employee.location_id; // Retain the existing location ID
            }

            // Update employee details with the new or updated location
            await db.personal_Details.update({
                where: { personal_details_id: id },
                data: {
                    company: company || null,
                    first_name: firstName,
                    last_name: lastName,
                    contact: contact || null,
                    email: email || null,
                    notes: notes || null,
                    location_id: locationId,
                },
            });

            // Update user role
            await db.user_Role.update({
                where: { Personal_Details_Id: input.id },
                data: {
                    role_Id: input.isAdmin ? 1 : 2,
                    emoji: input.isAdmin ? '👑' : '👤'
                }
            });

            // // Update authentication details (e.g., username and password)
            // if (username || password) {
            //     await db.authentication.update({
            //         where: { personal_details_id: id },
            //         data: {
            //             ...(username && { username }),
            //             ...(password && { password }), // Ensure password is hashed in production
            //         },
            //     });
            // }

            return { success: true };
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string().uuid("Invalid employee ID format") }))
        .mutation(async ({ input }) => {
            const { id } = input;

            // Find the employee to delete and associated location
            const employee = await db.personal_Details.findUnique({
                where: { personal_details_id: id },
                include: {
                    User_Role: true,
                    auth: true,
                },
            });

            if (!employee) {
                throw new Error("Employee not found");
            }

            // Delete the associated User_Role entry if it exists
            if (employee.User_Role) {
                await db.user_Role.delete({
                    where: { Personal_Details_Id: id },
                });
            }

            // Delete the associated authentication entry
            if (employee.auth) {
                await db.authentication.delete({
                    where: { personal_details_id: id },
                });
            }

            // Delete the associated location if it exists
            if (employee.location_id) {
                await db.location.delete({ where: { location_id: employee.location_id } });
            }

            // Delete the employee
            await db.personal_Details.delete({
                where: { personal_details_id: id },
            });

            return { success: true };
        }),

    verifyPassword: publicProcedure
        .input(
            z.object({
                personalDetailsId: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { personalDetailsId, password } = input;

            const authRecord = await prisma.authentication.findUnique({
                where: { personal_details_id: personalDetailsId },
            });

            if (!authRecord) {
                return { success: false, message: "User not found" };
            }

            if (authRecord.password !== password) {
                return { success: false, message: "Incorrect password" };
            }

            return { success: true, message: "Password verified" };
        }),
});



//old script below no username password


// import { z } from "zod";
// import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// import { db } from "~/server/db";
//
// const employeeInputSchema = z.object({
//     company: z.string().min(1, "Company is required"),
//     firstName: z.string().optional(),
//     lastName: z.string().optional(),
//     contact: z
//         .string()
//         .optional()
//         .refine(
//             (val) => !val || /^\d{1,15}$/.test(val),
//             "Contact must only contain numbers and be up to 15 digits"
//         ),
//     email: z
//         .string()
//         .optional()
//         .refine(
//             (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
//             "Invalid email format"
//         ),
//     addressLine: z.string().optional(),
//     city: z.string().optional(),
//     region: z.string().optional(),
//     country: z.string().optional(),
//     postalCode: z
//         .string()
//         .optional()
//         .refine((val) => !val || /^\d{4}$/.test(val), "Postal code must be 4 digits"),
//     notes: z.string().optional(),
// });
//
//
// export const employeeRouter = createTRPCRouter({
//     list: publicProcedure.query(async () => {
//         const employees = await db.user_Role.findMany({
//             where: { role_Id: 2 },
//             include: {
//                 Personal_Details: {
//                     include: { location: true },
//                 },
//             },
//         });
//         return employees ?? null;
//     }),
//
//     getById: publicProcedure
//         .input(z.object({ id: z.string() }))
//         .query(async ({ input }) => {
//             const { id } = input;
//             const employeeData = await db.personal_Details.findFirst({
//                 where: { personal_details_id: id },
//                 include: {
//                     location: true,
//                 },
//             });
//             return employeeData ?? null; // If not found, return null
//         }),
//
//     create: publicProcedure
//         .input(employeeInputSchema)
//         .mutation(async ({ input }) => {
//             const {
//                 company,
//                 firstName,
//                 lastName,
//                 contact,
//                 email,
//                 addressLine,
//                 city,
//                 region,
//                 country,
//                 postalCode,
//                 notes,
//             } = input;
//
//             // Create location if address details are provided
//             let locationId: number | null = null;
//
//             if (addressLine || city || region || country || postalCode) {
//                 const location = await db.location.create({
//                     data: {
//                         address_line: addressLine || null,
//                         city: city || null,
//                         region: region || null,
//                         country: country || null,
//                         postal_code: postalCode || null,
//                     },
//                 });
//                 locationId = location.location_id;
//             }
//
//             // Create employee personal details
//             const personalDetails = await db.personal_Details.create({
//                 data: {
//                     company,
//                     first_name: firstName || null,
//                     last_name: lastName || null,
//                     contact: contact || null,
//                     email: email || null,
//                     notes: notes || null,
//                     location_id: locationId,
//                 },
//             });
//
//             // Assign the employee role
//             await db.user_Role.create({
//                 data: {
//                     Personal_Details_Id: personalDetails.personal_details_id,
//                     role_Id: 2, // Assuming 4 is the role ID for "Employee"
//                 },
//             });
//
//             return { success: true, personalDetails };
//         }),
//
//     update: publicProcedure
//         .input(
//             employeeInputSchema.extend({
//                 id: z.string().uuid("Invalid employee ID format"),
//             })
//         )
//         .mutation(async ({ input }) => {
//             const {
//                 id,
//                 company,
//                 firstName,
//                 lastName,
//                 contact,
//                 email,
//                 addressLine,
//                 city,
//                 region,
//                 country,
//                 postalCode,
//                 notes,
//             } = input;
//
//             // Find the employee and its associated location
//             const employee = await db.personal_Details.findUnique({
//                 where: { personal_details_id: id },
//                 include: { location: true },
//             });
//
//             if (!employee) {
//                 throw new Error("Employee not found");
//             }
//
//             let locationId: number | null = null;
//
//             // If the employee doesn't have a location, create one
//             if (!employee.location_id && (addressLine || city || region || country || postalCode)) {
//                 const location = await db.location.create({
//                     data: {
//                         address_line: addressLine || null,
//                         city: city || null,
//                         region: region || null,
//                         country: country || null,
//                         postal_code: postalCode || null,
//                     },
//                 });
//                 locationId = location.location_id;
//             } else if (employee.location_id) {
//                 // If the employee already has a location, update it
//                 await db.location.update({
//                     where: { location_id: employee.location_id },
//                     data: {
//                         address_line: addressLine || null,
//                         city: city || null,
//                         region: region || null,
//                         country: country || null,
//                         postal_code: postalCode || null,
//                     },
//                 });
//                 locationId = employee.location_id; // Retain the existing location ID
//             }
//
//             // Update employee details with the new or updated location
//             await db.personal_Details.update({
//                 where: { personal_details_id: id },
//                 data: {
//                     company,
//                     first_name: firstName || null,
//                     last_name: lastName || null,
//                     contact: contact || null,
//                     email: email || null,
//                     notes: notes || null,
//                     location_id: locationId, // Associate the employee with the location
//                 },
//             });
//
//             return { success: true };
//         }),
//
//
//     delete: publicProcedure
//         .input(z.object({ id: z.string().uuid("Invalid employee ID format") }))
//         .mutation(async ({ input }) => {
//             const { id } = input;
//
//             // Find the employee to delete and associated location
//             const employee = await db.personal_Details.findUnique({
//                 where: { personal_details_id: id },
//                 include: {
//                     User_Role: true, // Check if a related User_Role exists
//                 },
//             });
//
//             if (!employee) {
//                 throw new Error("Employee not found");
//             }
//
//             // Delete the associated User_Role entry if it exists
//             if (employee.User_Role) {
//                 await db.user_Role.delete({
//                     where: { Personal_Details_Id: id },
//                 });
//             } else {
//                 console.log("No associated User_Role to delete.");
//             }
//
//             // Delete the associated location if it exists
//             if (employee.location_id) {
//                 await db.location.delete({ where: { location_id: employee.location_id } });
//             } else {
//                 console.log("No associated location to delete.");
//             }
//
//             // Delete the employee
//             await db.personal_Details.delete({
//                 where: { personal_details_id: id },
//             });
//
//             return { success: true };
//         }),
//
// });
