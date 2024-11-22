"use client";

import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { useState } from "react";

import InventoryItemInfo from "./_components/item-info";
import InventorySearchAndButtonRouter from "./_components/inventory-search";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const InventoryPage = () => {
  const router = useRouter();
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

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
      className={`h-auto w-screen p-10 ${poppins.className} flex flex-col gap-3 overflow-y-scroll`}
    >
      <InventorySearchAndButtonRouter />
      {/* <InventoryItemInfo /> */}
    </section>
  );
};

export default InventoryPage;
