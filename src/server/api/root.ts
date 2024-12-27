// import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { customerRouter } from "./routers/customers";
import { supplierRouter } from "./routers/suppliers";
import { employeeRouter } from "./routers/employees";
import inventoryRouter from "./routers/inventory";
import { inventoryDataRouter } from "~/server/api/routers/inventory-data"; // Import the supplier router
import { restockRouter } from "./routers/restock";
import { listsRouter } from "./routers/lists";
import { invoiceRouter } from "./routers/invoice";

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
  inventoryData: inventoryDataRouter,
  restock: restockRouter,
  invoice: invoiceRouter,
  lists: listsRouter,
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
