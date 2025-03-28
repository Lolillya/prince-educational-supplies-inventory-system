// import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { customerRouter } from "./routers/customers";
import { supplierRouter } from "./routers/suppliers";
import { employeeRouter } from "./routers/employees";
import inventoryRouter from "./routers/inventory";
import { restockRouter } from "./routers/restock";
import { invoiceRouter } from "./routers/invoice";
import { paymentRouter } from "./routers/payment";
import { GetStockedIn } from "./routers/dashboard/get-stocked-in";
import { GetStockedOut } from "./routers/dashboard/get-stocked-out";
import { GetAllCustomers } from "./routers/dashboard/get-all-customers";
import { GetAllSuppliers } from "./routers/dashboard/get-all-supplierst";
import { GetCategoryList } from "./routers/dashboard/get-cagetory-list";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  customers: customerRouter,
  suppliers: supplierRouter,
  employees: employeeRouter,
  inventory: inventoryRouter,
  restock: restockRouter,
  invoice: invoiceRouter,
  payment: paymentRouter,

  // dashboard routers
  getStockedIn: GetStockedIn,
  getStockedOut: GetStockedOut,
  getAllCustomers: GetAllCustomers,
  getAllSuppliers: GetAllSuppliers,
  getCategoryList: GetCategoryList,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
