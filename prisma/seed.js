// import { PrismaClient, Roles } from "@prisma/client";
// const prisma = new PrismaClient();

// async function main() {
//   // Clean up existing data
//   await prisma.$transaction([
//     prisma.favorite.deleteMany({}),
//     prisma.pin.deleteMany({}),
//     prisma.line_Item.deleteMany({}),
//     prisma.payment_Log.deleteMany({}),
//     prisma.payment.deleteMany({}),
//     prisma.invoice.deleteMany({}),
//     prisma.inventory_Log.deleteMany({}),
//     prisma.inventory.deleteMany({}),
//     prisma.stockLevel.deleteMany({}),
//     prisma.conversionRate.deleteMany({}),
//     prisma.supplierUnit.deleteMany({}),
//     prisma.batchVariant.deleteMany({}),
//     prisma.batch.deleteMany({}),
//     prisma.variant.deleteMany({}),
//     prisma.item.deleteMany({}),
//     prisma.discount.deleteMany({}),
//     prisma.brand.deleteMany({}),
//     prisma.category.deleteMany({}),
//     prisma.unit.deleteMany({}),
//     prisma.authentication_Log.deleteMany({}),
//     prisma.authentication.deleteMany({}),
//     prisma.user_Role.deleteMany({}),
//     prisma.role.deleteMany({}),
//     prisma.personal_Details.deleteMany({}),
//     prisma.location.deleteMany({}),
//   ]);

//   // Create Roles
//   const roles = await Promise.all([
//     prisma.role.create({ data: { Role_name: Roles.ADMIN } }),
//     prisma.role.create({ data: { Role_name: Roles.EMPLOYEE } }),
//     prisma.role.create({ data: { Role_name: Roles.CUSTOMER } }),
//     prisma.role.create({ data: { Role_name: Roles.SUPPLIER } }),
//   ]);

//   // Create Units
//   const units = await Promise.all([
//     prisma.unit.create({ data: { name: "Piece" } }),
//     prisma.unit.create({ data: { name: "Box" } }),
//     prisma.unit.create({ data: { name: "Pack" } }),
//     prisma.unit.create({ data: { name: "Dozen" } }),
//     prisma.unit.create({ data: { name: "Ream" } }),
//   ]);

//   // Create Categories
//   const categories = await Promise.all([
//     prisma.category.create({ data: { name: "Writing Instruments" } }),
//     prisma.category.create({ data: { name: "Paper Products" } }),
//     prisma.category.create({ data: { name: "Computer Accessories" } }),
//     prisma.category.create({ data: { name: "Storage & Organization" } }),
//     prisma.category.create({ data: { name: "Computer Components" } }),
//   ]);

//   // Create Brands
//   const brands = await Promise.all([
//     prisma.brand.create({ data: { name: "Faber-Castell" } }),
//     prisma.brand.create({ data: { name: "Pilot" } }),
//     prisma.brand.create({ data: { name: "Logitech" } }),
//     prisma.brand.create({ data: { name: "HP" } }),
//     prisma.brand.create({ data: { name: "Double A" } }),
//   ]);

//   // Create Sample Admin
//   const adminLocation = await prisma.location.create({
//     data: {
//       address_line: "123 Admin Street",
//       city: "Admin City",
//       country: "Country",
//       postal_code: "12345",
//     },
//   });

//   const adminDetails = await prisma.personal_Details.create({
//     data: {
//       first_name: "Admin",
//       last_name: "User",
//       email: "admin@example.com",
//       contact: "1234567890",
//       location_id: adminLocation.location_id,
//     },
//   });

//   await prisma.authentication.create({
//     data: {
//       personal_details_id: adminDetails.personal_details_id,
//       username: "admin",
//       password: "hashedpassword123", // In real application, ensure this is properly hashed
//     },
//   });

//   await prisma.user_Role.create({
//     data: {
//       Personal_Details_Id: adminDetails.personal_details_id,
//       role_Id: roles[0].role_Id, // Admin role
//       emoji: "👑",
//     },
//   });

//   // Create Sample Items and Variants
//   // Writing Instruments
//   const pencil = await prisma.item.create({
//     data: {
//       name: "Pencil",
//       brand_id: brands[0].brand_id, // Faber-Castell
//       category_id: categories[0].category_id, // Writing Instruments
//       description: "High-quality graphite pencils",
//       variants: {
//         create: [
//           {
//             name: "2B",
//             description: "Soft lead pencil",
//             inventory: {
//               create: {
//                 quantity: 1000,
//               },
//             },
//             StockLevel: {
//               create: {
//                 low_stock: 100,
//                 very_low_stock: 50,
//               },
//             },
//           },
//           {
//             name: "HB",
//             description: "Medium lead pencil",
//             inventory: {
//               create: {
//                 quantity: 1500,
//               },
//             },
//             StockLevel: {
//               create: {
//                 low_stock: 150,
//                 very_low_stock: 75,
//               },
//             },
//           },
//         ],
//       },
//     },
//   });

//   // Paper Products
//   const paper = await prisma.item.create({
//     data: {
//       name: "A4 Paper",
//       brand_id: brands[4].brand_id, // Double A
//       category_id: categories[1].category_id, // Paper Products
//       description: "Premium A4 paper for printing and writing",
//       variants: {
//         create: [
//           {
//             name: "70gsm",
//             description: "Standard weight paper",
//             inventory: {
//               create: {
//                 quantity: 500,
//               },
//             },
//             StockLevel: {
//               create: {
//                 low_stock: 50,
//                 very_low_stock: 20,
//               },
//             },
//           },
//           {
//             name: "80gsm",
//             description: "Premium weight paper",
//             inventory: {
//               create: {
//                 quantity: 300,
//               },
//             },
//             StockLevel: {
//               create: {
//                 low_stock: 30,
//                 very_low_stock: 15,
//               },
//             },
//           },
//         ],
//       },
//     },
//   });

//   // Computer Accessories
//   const mouse = await prisma.item.create({
//     data: {
//       name: "Wireless Mouse",
//       brand_id: brands[2].brand_id, // Logitech
//       category_id: categories[2].category_id, // Computer Accessories
//       description: "Ergonomic wireless mouse",
//       variants: {
//         create: [
//           {
//             name: "Black",
//             description: "Classic black wireless mouse",
//             inventory: {
//               create: {
//                 quantity: 200,
//               },
//             },
//             StockLevel: {
//               create: {
//                 low_stock: 20,
//                 very_low_stock: 10,
//               },
//             },
//           },
//           {
//             name: "White",
//             description: "Modern white wireless mouse",
//             inventory: {
//               create: {
//                 quantity: 150,
//               },
//             },
//             StockLevel: {
//               create: {
//                 low_stock: 15,
//                 very_low_stock: 8,
//               },
//             },
//           },
//         ],
//       },
//     },
//   });

//   // Create Payment Terms
//   const paymentTerms = await Promise.all([
//     prisma.payment_Term.create({
//       data: {
//         term_name: "Net 30",
//         description: "Payment due within 30 days",
//       },
//     }),
//     prisma.payment_Term.create({
//       data: {
//         term_name: "Net 60",
//         description: "Payment due within 60 days",
//       },
//     }),
//     prisma.payment_Term.create({
//       data: {
//         term_name: "Immediate",
//         description: "Payment due immediately",
//       },
//     }),
//   ]);

//   console.log("Database has been seeded! 🌱");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
