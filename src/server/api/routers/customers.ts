import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const customerInputSchema = z.object({
  company: z.string().min(1, "Company is required"),
  term: z
    .number()
    .int()
    .min(2, "Term must be at least 2 days")
    .optional()
    .nullable(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  contact: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{1,15}$/.test(val),
      "Contact must only contain numbers and be up to 15 digits",
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Invalid email format",
    ),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  postalCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{4}$/.test(val),
      "Postal code must be 4 digits",
    ),
  notes: z.string().optional(),
});

export const customerRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const customers = await db.user_Role.findMany({
      where: { role_Id: 3 },
      include: {
        Personal_Details: {
          select: {
            location: true,
            first_name: true,
            last_name: true,
            company: true,
            contact: true,
            email: true,
            notes: true,
          },
        },
        customerInvoices: {
          select: {
            invoice_number: true,
            created_at: true,
            total_amount: true,
            invoiceClerk: {
              select: {
                Personal_Details: {
                  select: {
                    first_name: true,
                    last_name: true,
                    company: true,
                  },
                },
              },
            },
          },
        }, // Fetch invoices where the user is a customer
      },
    });
    return customers ?? null;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;
      const customerData = await db.personal_Details.findFirst({
        where: { personal_details_id: id },
        include: {
          location: true,
        },
      });
      return customerData ?? null; // If not found, return null
    }),

  getByName: publicProcedure
    .input(z.object({ companyName: z.string() }))
    .query(async ({ input }) => {
      const { companyName } = input;
      const customerData = await db.personal_Details.findFirst({
        where: { company: companyName },
        include: {
          User_Role: true,
          location: true,
        },
      });
      return customerData ?? null; // If not found, return null
    }),

  create: publicProcedure
    .input(customerInputSchema)
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

      // Create customer personal details
      const personalDetails = await db.personal_Details.create({
        data: {
          company,
          term: input.term,
          first_name: firstName || null,
          last_name: lastName || null,
          contact: contact || null,
          email: email || null,
          notes: notes || null,
          location_id: locationId,
        },
      });

      // Assign the customer role
      await db.user_Role.create({
        data: {
          Personal_Details_Id: personalDetails.personal_details_id,
          role_Id: 3,
          emoji: "🏬",
        },
      });

      return { success: true, personalDetails };
    }),

  update: publicProcedure
    .input(
      customerInputSchema.extend({
        id: z.string().uuid("Invalid customer ID format"),
      }),
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

      // Find the customer and its associated location
      const customer = await db.personal_Details.findUnique({
        where: { personal_details_id: id },
        include: { location: true },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      let locationId: number | null = null;

      // If the customer doesn't have a location, create one
      if (
        !customer.location_id &&
        (addressLine || city || region || country || postalCode)
      ) {
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
      } else if (customer.location_id) {
        // If the customer already has a location, update it
        await db.location.update({
          where: { location_id: customer.location_id },
          data: {
            address_line: addressLine || null,
            city: city || null,
            region: region || null,
            country: country || null,
            postal_code: postalCode || null,
          },
        });
        locationId = customer.location_id; // Retain the existing location ID
      }

      // Update customer details with the new or updated location
      await db.personal_Details.update({
        where: { personal_details_id: id },
        data: {
          company,
          term: input.term,
          first_name: firstName || null,
          last_name: lastName || null,
          contact: contact || null,
          email: email || null,
          notes: notes || null,
          location_id: locationId, // Associate the customer with the location
        },
      });

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      try {
        // 1. First delete any authentication logs
        await db.authentication_Log.deleteMany({
          where: { personal_details_id: id },
        });

        // 2. Delete any authentication records
        await db.authentication.deleteMany({
          where: { personal_details_id: id },
        });

        // 3. Delete any user roles associated with this personal detail
        await db.user_Role.deleteMany({
          where: { Personal_Details_Id: id },
        });

        // 4. Find and delete any invoices associated with this customer
        const userRoles = await db.user_Role.findMany({
          where: { Personal_Details_Id: id },
        });

        for (const role of userRoles) {
          // Delete payments for invoices related to this customer
          const invoices = await db.invoice.findMany({
            where: { customer_id: role.id },
            select: { invoice_id: true },
          });

          for (const invoice of invoices) {
            // Delete payments and payment logs
            const payments = await db.payment.findMany({
              where: { invoice_id: invoice.invoice_id },
              select: { payment_id: true },
            });

            for (const payment of payments) {
              await db.payment_Log.deleteMany({
                where: { payment_id: payment.payment_id },
              });
            }

            await db.payment.deleteMany({
              where: { invoice_id: invoice.invoice_id },
            });

            // Delete line items
            await db.line_Item.deleteMany({
              where: { invoice_id: invoice.invoice_id },
            });
          }

          // Delete invoices
          await db.invoice.deleteMany({
            where: { customer_id: role.id },
          });
        }

        // 5. Finally delete the personal details
        await db.personal_Details.delete({
          where: { personal_details_id: id },
        });

        return { success: true };
      } catch (error) {
        console.error("Error in delete mutation:", error);
        throw error;
      }
    }),

  verifyPassword: publicProcedure
    .input(
      z.object({
        personalDetailsId: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { personalDetailsId, password } = input;

      const authRecord = await db.authentication.findUnique({
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

  getCustomerInvoices: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      return await db.invoice.findMany({
        where: { customer_id: input.customerId },
        include: {
          line_items: {
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
              unit: true,
            },
          },
          Payment: true,
          invoiceClerk: {
            include: {
              Personal_Details: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });
    }),

  unpaidInvoices: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input }) => {
      const invoices = await db.invoice.findMany({
        where: {
          customer_id: input.customerId,
          status: "PENDING",
        },
        include: {
          Payment: {
            include: {
              PaymentLog: true,
            },
          },
          line_items: {
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
              unit: true,
            },
          },
          invoiceClerk: {
            include: {
              Personal_Details: true,
            },
          },
        },
      });

      return invoices.map((invoice) => {
        // Filter out refunded payments
        const activePayments = invoice.Payment.filter((payment) => {
          // Check if the payment has any logs with status "REFUNDED"
          const isRefunded = payment.PaymentLog?.some(
            (log) => log.status === "REFUNDED",
          );
          return !isRefunded;
        });

        // Calculate paid amount only from active (non-refunded) payments
        const paidAmount = activePayments.reduce(
          (sum, p) => sum + (p.amount || 0),
          0,
        );

        return {
          ...invoice,
          paid_amount: paidAmount,
          remaining: (invoice.total_amount || 0) - paidAmount,
        };
      });
    }),
});
