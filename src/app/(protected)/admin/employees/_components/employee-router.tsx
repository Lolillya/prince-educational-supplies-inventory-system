"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";

interface NewEmployeeRouterProps {
    title: string; // Title to display in the header
}

const EmployeeRouter = ({ title }: NewEmployeeRouterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    return (
        <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
            <div className="flex items-center gap-2">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <ArrowLeft
                            size={25}
                            color="#FF7B7B"
                            className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
                        />
                    </DialogTrigger>
                    <DialogContent className="max-h- flex w-full max-w-lg flex-col p-10">
                        <DialogTitle className="text-center">Confirm</DialogTitle>
                        <DialogHeader>
                            <div className="flex w-full justify-center text-center text-xl">
                <span>
                  You have unsaved changes. Are you sure you want to leave this
                  page?
                </span>
                            </div>
                        </DialogHeader>

                        <div className="flex w-full items-center justify-center gap-3">
                            <Button
                                size={"lg"}
                                className="border-2 border-green bg-white p-6 text-lg font-bold text-green"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size={"lg"}
                                className="bg-green p-6 text-lg font-bold text-white"
                                onClick={() => router.push("/admin/employees")}
                            >
                                Leave
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                <span className="font-bold">{title}</span>
                <span className="text-gray-400 ml-3 text-sm font-light"></span>
            </div>
        </div>
    );
};

export default EmployeeRouter;
