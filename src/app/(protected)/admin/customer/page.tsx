"use client"; // Add this line to make it a Client Component

import { Poppins } from "next/font/google";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { RxMagnifyingGlass } from "react-icons/rx";
import { AiFillMail, AiFillPhone } from "react-icons/ai";
import { Input } from "~/components/ui/input";
import Filter_Icon from "public/icons/filter-icon2.svg";
import Image from "next/image";
import { Card } from "~/components/ui/card";
import { FaAngleDown, FaAngleUp, FaPen } from "react-icons/fa";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";
import { customers } from "~/server/db/customersData";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "700"],
});

const CustomerPage = () => {
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedCardId(expandedCardId === id ? null : id);
    };

    return (
        <section className={`h-auto w-screen p-5 ${poppins.className} m-10 flex flex-col gap-3`}>
            <div className="relative flex items-center justify-between">
                <Label className="text-4xl font-bold">Customer</Label>
                <div className="flex h-16 items-center gap-3">
                    <div className="relative flex h-auto w-full max-w-md gap-3">
                        <RxMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500" />
                        <Input placeholder="Search" className="bg-gray-100 p-5 pl-10" />
                        <div className="rounded-md bg-gray-100 p-3 hover:cursor-pointer hover:bg-gray-300">
                            <Image src={Filter_Icon} alt="filter icon" />
                        </div>
                    </div>
                    <Button className="bg-[#FF7B7B] p-5 font-bold">+ New Invoice</Button>
                </div>
            </div>

            {customers.map((customer) => (
                <Card key={customer.id} className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between gap-5 rounded-md">
                        <div className="w-full">
                            <div className="flex items-center gap-5">
                                <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
                                <div className="flex flex-col gap-5">
                                    <div className="flex items-center gap-3">
                                        <Label>{customer.name}</Label>
                                    </div>
                                    <div className="flex">
                                        <Label>{customer.company}</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex items-center">
                            <Separator orientation="vertical" className="h-16 w-[2px]" />
                        </div>

                        <div className="flex w-full flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <AiFillPhone />
                                <Label>{customer.phone}</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <AiFillMail />
                                <Label>{customer.email}</Label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex items-center justify-center rounded-md border-2 p-3">
                                <FaPen color="gray" />
                            </div>
                            <div
                                className="flex items-center justify-center rounded-md border-2 p-3"
                                onClick={() => toggleExpand(customer.id)}
                            >
                                {expandedCardId === customer.id ? (
                                    <FaAngleUp color="gray" />
                                ) : (
                                    <FaAngleDown color="gray" />
                                )}
                            </div>
                        </div>
                    </div>

                    {expandedCardId === customer.id && (
                        <div className="flex p-3">
                            <div className="flex w-full flex-col gap-5">
                                <Label>Location</Label>
                                <Label>{customer.location}</Label>
                            </div>
                            <div className="flex w-full flex-col gap-5">
                                <Label>Notes</Label>
                                <Label>{customer.notes}</Label>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </section>
    );
};

export default CustomerPage;
