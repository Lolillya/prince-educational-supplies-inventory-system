"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useState } from "react";
import InventoryItemInfo from "./_components/item-info";
import InventorySearchAndButtonRouter from "./_components/inventory-search";

const InventoryPage = () => {
  const router = useRouter();
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  // const {data: inventoryItems} = api.inventory.list.useQuery()

  const handleCardClick = (itemId: number) => {
    setExpandedCardId(expandedCardId === itemId ? null : itemId);
  };

  const handleNewInventory = () => {
    router.push("/admin/inventory/newItem"); // Redirect to create new inventory
  };
  const handleEditInventory = () => {
    router.push("/admin/inventory/editItem"); // Redirect to create new item
  };

  return (
    <section
      className={`flex h-auto w-screen flex-col gap-3 overflow-y-scroll p-10`}
    >
      <InventorySearchAndButtonRouter />
      <InventoryItemInfo />
    </section>
  );
};

export default InventoryPage;
