import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Raleway } from "next/font/google";
import { RxGear, RxInfoCircled, RxExit } from "react-icons/rx";
import { useRouter } from "next/navigation";
import { logout } from "~/app/actions/actions";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import Company_Logo from "public/Company_Logo.svg";
import Dashboard_Logo from "public/icons/dashboard.svg";
import Invoice_Logo from "public/icons/invoice.svg";
import Suppliers_Logo from "public/icons/suppliers.svg";
import Customers_Logo from "public/icons/customers.svg";
import Inventory_Logo from "public/icons/inventory.svg";
import Staff_Logo from "public/icons/staff.svg";
import History_Logo from "public/icons/history.svg";
import Image from "next/image";

import SidebarClient from "../sidebar-client";

const ralewaye = Raleway({ subsets: ["latin"] });

const Sidebar = () => {
  return <SidebarClient />;
};

export default Sidebar;
