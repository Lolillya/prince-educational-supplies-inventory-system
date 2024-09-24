// "use client";

// import { useState } from "react";
// import { Label } from "~/components/ui/label";
// import { Raleway } from "next/font/google";
// import { RxArrowLeft } from "react-icons/rx";
// import { RxGear } from "react-icons/rx";
// import { RxInfoCircled } from "react-icons/rx";
// import { RxExit } from "react-icons/rx";

// import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

// import Company_Logo from "public/Company_Logo.svg";
// import Dashboard_Logo from "public/icons/dashboard.svg";
// import Invoice_Logo from "public/icons/invoice.svg";
// import Suppliers_Logo from "public/icons/suppliers.svg";
// import Customers_Logo from "public/icons/customers.svg";
// import Inventory_Logo from "public/icons/inventory.svg";
// import Staff_Logo from "public/icons/staff.svg";
// import History_Logof from "public/icons/history.svg";
// import Image from "next/image";

// const ralewaye = Raleway({ subsets: ["latin"] });

// const Sidebar = () => {
//   const [hovered, setHovered] = useState(false);
//   return (
//     <div
//       className={`h-full max-h-[100vh] w-full max-w-72 bg-[#F0F1F4] p-5 ${ralewaye.className} sticky flex flex-col justify-between`}
//     >
//       <section>
//         {/* Header Logo and back button */}
//         <section className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Image src={Company_Logo} alt="Company Logo" width={30} />
//             <Label className="text-2xl font-extrabold text-red-500">
//               Prince
//             </Label>
//           </div>

//           <div
//             className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#FFCCCC] hover:cursor-pointer hover:bg-red-300"
//             onMouseEnter={() => setHovered(true)}
//             onMouseLeave={() => setHovered(false)}
//           >
//             <RxArrowLeft color={hovered ? "#ff5c5c " : "#FF5252"} size={25} />
//           </div>
//         </section>

//         {/* --------------------------- */}

//         {/* Records section */}
//         <section className="mt-5 flex flex-col">
//           <div className="flex items-center rounded-lg p-2 hover:bg-white">
//             <Image src={Dashboard_Logo} alt="dashboard logo" />
//             <Label>Dashboard</Label>
//           </div>

//           <div className="flex items-center rounded-lg p-2 hover:bg-white">
//             <Image src={Invoice_Logo} alt="invoice logo" />
//             <Label>Invoice</Label>
//           </div>
//         </section>

//         <section className="mt-5 flex flex-col">
//           <Label className="pb-5 pt-5 font-extralight text-gray-400">
//             Records
//           </Label>

//           <section className="flex flex-col">
//             <div className="flex items-center rounded-lg p-2 hover:bg-white">
//               <Image src={Suppliers_Logo} alt="suppliers logo" />
//               <Label>Suppliers</Label>
//             </div>

//             <div className="flex items-center rounded-lg p-2 hover:bg-white">
//               <Image src={Customers_Logo} alt="customers logo" />
//               <Label>Customers</Label>
//             </div>

//             <div className="flex items-center rounded-lg p-2 hover:bg-white">
//               <Image src={Inventory_Logo} alt="inventory logo" />
//               <Label>Inventory</Label>
//             </div>

//             <div className="flex items-center rounded-lg p-2 hover:bg-white">
//               <Image src={Staff_Logo} alt="staff logo" />
//               <Label>Staff</Label>
//             </div>

//             <div className="flex items-center rounded-lg p-2 hover:bg-white">
//               <Image src={History_Logof} alt="history logo" />
//               <Label>History</Label>
//             </div>
//           </section>
//         </section>

//         {/* ------------------------------ */}
//       </section>

//       {/* Settings, About, Logout, and Avatar section */}
//       <section className="flex flex-col gap-3">
//         <div className="max-w-full rounded-lg bg-white p-3">
//           <div className="flex flex-col text-xl">
//             <div className="flex items-center gap-1 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white">
//               <RxGear />
//               <Label className="hover:cursor-pointer">Settings</Label>
//             </div>

//             <div className="flex items-center gap-1 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white">
//               <RxInfoCircled />
//               <Label className="hover:cursor-pointer">About</Label>
//             </div>

//             <div className="flex items-center gap-1 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white">
//               <RxExit />
//               <Label className="hover:cursor-pointer">Logout</Label>
//             </div>
//           </div>
//         </div>

//         <div className="flex max-w-full items-center gap-3 rounded-lg bg-white p-3">
//           <div className="flex items-center">
//             <Avatar>
//               <AvatarImage
//                 src="https://github.com/shadcn.png"
//                 alt="profile avatar"
//               />
//               <AvatarFallback>CN</AvatarFallback>
//             </Avatar>
//           </div>

//           <div className="flex flex-col gap-1">
//             <Label className="font-bold">Boss Joshua</Label>
//             <Label className="font-extralight">Admin</Label>
//           </div>
//         </div>
//       </section>

//       {/* ------------------------------------------- */}
//     </div>
//   );
// };

// export default Sidebar;

"use client";

import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Raleway } from "next/font/google";
import { RxGear, RxInfoCircled, RxExit } from "react-icons/rx";

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

const ralewaye = Raleway({ subsets: ["latin"] });

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`h-full ${
        expanded ? "w-[16rem]" : "w-[7rem]"
      } bg-[#F0F1F4] p-5 transition-all duration-300 ${ralewaye.className} flex flex-col justify-between`}
    >
      <section>
        <section className="mb-10 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Image
              src={Company_Logo}
              alt="Company Logo"
              width={30}
              height={30}
              className="min-w-[30px]"
            />
            {expanded && (
              <Label className="text-2xl font-extrabold text-red-500">
                Prince
              </Label>
            )}
          </div>
        </section>

        <section className="mt-5 flex flex-col gap-3">
          <div
            className={`flex items-center rounded-lg p-2 hover:bg-white ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Dashboard_Logo} alt="dashboard logo" />
            {expanded && <Label className="ml-2">Dashboard</Label>}
          </div>

          <div
            className={`flex items-center rounded-lg p-2 hover:bg-white ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Invoice_Logo} alt="invoice logo" />
            {expanded && <Label className="ml-2">Invoice</Label>}
          </div>
        </section>

        <section className="mt-5 flex flex-col gap-3">
          {expanded && (
            <Label className="pb-5 pt-5 font-extralight text-gray-400">
              Records
            </Label>
          )}

          <div
            className={`flex items-center rounded-lg p-2 hover:bg-white ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Suppliers_Logo} alt="suppliers logo" />
            {expanded && <Label className="ml-2">Suppliers</Label>}
          </div>

          <div
            className={`flex items-center rounded-lg p-2 hover:bg-white ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Customers_Logo} alt="customers logo" />
            {expanded && <Label className="ml-2">Customers</Label>}
          </div>

          <div
            className={`flex items-center rounded-lg p-2 hover:bg-white ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Inventory_Logo} alt="inventory logo" />
            {expanded && <Label className="ml-2">Inventory</Label>}
          </div>

          <div
            className={`flex items-center rounded-lg p-2 hover:bg-white ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={Staff_Logo} alt="staff logo" />
            {expanded && <Label className="ml-2">Staff</Label>}
          </div>

          <div
            className={`flex items-center rounded-lg p-2 hover:bg-white ${expanded ? "justify-start" : "justify-center"}`}
          >
            <Image src={History_Logo} alt="history logo" />
            {expanded && <Label className="ml-2">History</Label>}
          </div>
        </section>
      </section>

      <section className="flex flex-col gap-3">
        <div className="max-w-full rounded-lg bg-white p-3">
          <div className="flex flex-col gap-3 text-xl">
            <div
              className={`flex items-center gap-2 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white ${expanded ? "justify-start" : "justify-center"}`}
            >
              <RxGear className="text-xl" />
              {expanded && <Label>Settings</Label>}
            </div>

            <div
              className={`flex items-center gap-2 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white ${expanded ? "justify-start" : "justify-center"}`}
            >
              <RxInfoCircled className="text-xl" />
              {expanded && <Label>About</Label>}
            </div>

            <div
              className={`flex items-center gap-2 rounded-lg p-3 hover:cursor-pointer hover:bg-[#FF7B7B] hover:text-white ${expanded ? "justify-start" : "justify-center"}`}
            >
              <RxExit className="text-xl" />
              {expanded && <Label>Logout</Label>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center rounded-lg bg-white p-3">
          <Avatar>
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="profile avatar"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="ml-3 flex flex-col">
              <Label className="font-bold">John Doe</Label>
              <Label className="font-extralight">Admin</Label>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
