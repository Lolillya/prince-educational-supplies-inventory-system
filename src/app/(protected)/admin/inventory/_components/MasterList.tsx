// "use client";
//
// import { DialogContent, DialogTitle } from "~/components/ui/dialog";
// import { Label } from "~/components/ui/label";
// import { Select, SelectTrigger } from "~/components/ui/select";
// import { Separator } from "~/components/ui/separator";
// import { X } from "lucide-react";
// import { useEffect, useState } from "react";
// import { api } from "~/trpc/react";
//
// const MasterList = () => {
//   const {
//     data: initialInventory,
//     isLoading,
//     error,
//   } = api.lists.listInventory.useQuery();
//   const [inventory, setInventory] = useState([]);
//
//   useEffect(() => {
//     if (initialInventory && !isLoading && !error) {
//       setInventory(initialInventory); // Initialize local state with fetched inventory
//     }
//   }, [initialInventory, isLoading, error]);
//
//   const handleRemoveItem = (inventoryId) => {
//     setInventory((prevInventory) =>
//       prevInventory.filter((item) => item.inventory_id !== inventoryId),
//     );
//   };
//
//   return (
//     <DialogContent className="flex h-full max-h-[80%] max-w-3xl flex-col">
//       <div className="flex items-center gap-3">
//         <DialogTitle>ITEM MASTERLIST</DialogTitle>
//         <Label className="text-textGray">MM/DD/YY</Label>
//       </div>
//
//       <div className="flex flex-col gap-3">
//         <div className="flex w-fit gap-3">
//           <Select>
//             <SelectTrigger className="border-none">
//               <Label>All Items</Label>
//             </SelectTrigger>
//           </Select>
//
//           <Select>
//             <SelectTrigger className="border-none">
//               <Label>Select Items</Label>
//             </SelectTrigger>
//           </Select>
//
//           <Select>
//             <SelectTrigger className="border-none">
//               <Label>Category</Label>
//             </SelectTrigger>
//           </Select>
//         </div>
//
//         <Separator orientation="horizontal" />
//
//         <div className="flex flex-col gap-3">
//           {isLoading ? (
//             <Label>Loading...</Label>
//           ) : error ? (
//             <Label className="text-red-500">Failed to load inventory.</Label>
//           ) : inventory.length === 0 ? (
//             <Label>No items found.</Label>
//           ) : (
//             inventory.map((item) => (
//               <div
//                 key={item.inventory_id} // Ensure unique key for each inventory item
//                 className="flex w-full items-center justify-between rounded-lg bg-gray p-3"
//               >
//                 <div className="flex flex-col gap-2">
//                   <div className="flex items-center gap-3">
//                     <Label>{item.variant.item.name}</Label>
//                     <Label>{item.variant.item.brand.name}</Label>
//                     <Label>{item.variant.name}</Label>
//                     <Label>{item.variant.Unit?.name}</Label>
//                     <Label>
//                       {item.variant.BatchVariant[0]?.supplierUnits[0]?.price}
//                     </Label>
//                   </div>
//                 </div>
//
//                 <div>
//                   <X
//                     color="gray"
//                     className="cursor-pointer"
//                     onClick={() => handleRemoveItem(item.inventory_id)} // Remove item on click
//                   />
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </DialogContent>
//   );
// };
//
// export default MasterList;

"use client";

import { DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Select, SelectTrigger } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

const MasterList = () => {
  // Fetch inventory list from backend
  const { data: initialInventory, isLoading, error } = api.inventory.listInventory.useQuery();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (initialInventory && !isLoading && !error) {
      setInventory(initialInventory); // Initialize local state with fetched inventory
    }
  }, [initialInventory, isLoading, error]);

  const handleRemoveItem = (inventoryId: number) => {
    setInventory((prevInventory) =>
        prevInventory.filter((item) => item.inventory_id !== inventoryId)
    );
  };

  return (
      <DialogContent className="flex h-full max-h-[80%] max-w-3xl flex-col">
        <div className="flex items-center gap-3">
          <DialogTitle>ITEM MASTERLIST</DialogTitle>
          <Label className="text-textGray">MM/DD/YY</Label>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex w-fit gap-3">
            <Select>
              <SelectTrigger className="border-none">
                <Label>All Items</Label>
              </SelectTrigger>
            </Select>

            <Select>
              <SelectTrigger className="border-none">
                <Label>Select Items</Label>
              </SelectTrigger>
            </Select>

            <Select>
              <SelectTrigger className="border-none">
                <Label>Category</Label>
              </SelectTrigger>
            </Select>
          </div>

          <Separator orientation="horizontal" />

          <div className="flex flex-col gap-3">
            {isLoading ? (
                <Label>Loading...</Label>
            ) : error ? (
                <Label className="text-red-500">Failed to load inventory.</Label>
            ) : inventory.length === 0 ? (
                <Label>No items found.</Label>
            ) : (
                inventory.map((item) => {
                  // Access the item variant, batch, and supplier unit details
                  const variant = item.variant;
                  const batchVariant = variant?.BatchVariant?.[0];
                  const supplierUnit = batchVariant?.batch?.batchVariants?.[0]?.SupplierUnit?.[0];

                  return (
                      <div
                          key={item.inventory_id} // Ensure unique key for each inventory item
                          className="flex w-full items-center justify-between rounded-lg bg-gray p-3"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <Label>{variant?.item?.name}</Label>
                            <Label>{variant?.item?.brand?.name}</Label>
                            <Label>{variant?.name}</Label>
                            <Label>{variant?.Unit?.name}</Label>
                            <Label>
                              {supplierUnit?.price ? `₱${Number(supplierUnit?.price).toFixed(2)}` : 'N/A'}
                            </Label>
                          </div>
                        </div>

                        <div>
                          <X
                              color="gray"
                              className="cursor-pointer"
                              onClick={() => handleRemoveItem(item.inventory_id)} // Remove item on click
                          />
                        </div>
                      </div>
                  );
                })
            )}
          </div>
        </div>
      </DialogContent>
  );
};

export default MasterList;
