import {
    ArrowUpRight,
    Calendar,
    IdCard,
    PhilippinePeso,
    Printer,
} from "lucide-react";
import {Poppins} from "next/font/google";
import Link from "next/link";
import React, {FC, useState} from "react";
import {Button} from "~/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import {Input} from "~/components/ui/input";
import {Label} from "~/components/ui/label";
import {Separator} from "~/components/ui/separator";
import {Textarea} from "~/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";
import RecordEditor from "../../_components/record-editor";
import RecordExpand from "../../_components/record-expand";

import InvoiceDialog from "~/app/(protected)/admin/employees/_components/invoice-dialog";
import {router} from "next/client";
import {useRouter} from "next/navigation";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "700"],
});

interface CustomerInvoiceProps {
    invoiceData: {
        invoice_number: number;
        created_at: Date;
        total_amount: number;
        invoiceClerk: {
            Personal_Details: {
                first_name: string;
                last_name: string;
                company: string;
            };
        };
    }[];
    first_name: string;
    last_name: string;
    customerId: string;
}

export default function CustomerInvoice({
                                            invoiceData,
                                            // id,
                                            // first_name,
                                            // last_name,
                                            customerId,
                                        }: CustomerInvoiceProps) {
    const [showAll, setShowAll] = useState(false);
    const displayedData = showAll ? invoiceData : invoiceData.slice(0, 3);
    const totalCount = invoiceData.length;
    const shownCount = displayedData.length;
    const router = useRouter();

    // const [isEditing, setIsEditing] = useState(false);
    // const [isDialogOpen, setIsDialogOpen] = useState(false);
    // const [showWarning, setShowWarning] = useState(false);

    const handleInvoiceDoubleClick = () => {
        router.push(`/admin/invoice?customerId=${customerId}`);
    };
    // const handleEdit = () => {
    //     setIsEditing((prev) => !prev);
    //     setShowWarning(false);
    // };
    //
    // const handleKeyDown = (event: React.KeyboardEvent) => {
    //     if (event.key === "Escape" && isEditing) {
    //         setShowWarning(true);
    //         event.preventDefault();
    //     }
    // };

    return (
        <div className="rounded-lg bg-white/60 p-5 text-slate-400">
            <div className="flex items-center justify-between">
                <Link href={`/admin/invoice${customerId ? `?customerId=${customerId}` : ''}`}>
                    <div
                        className="flex w-fit items-center gap-2 rounded-lg px-5 py-1 tracking-wide text-slate-400 transition-colors duration-300 hover:bg-slate-200/50 hover:text-slate-500">
                        Invoices
                        <ArrowUpRight className="h-4 w-4"/>
                    </div>
                </Link>
                {totalCount > 0 && (
                    <p className='text-slate-400 text-sm pr-5'>
                        {shownCount} of {totalCount}
                    </p>
                )}
            </div>
            <div className='mt-2'>
                <div className="flex flex-col gap-1">
                    {/* //TODO: map restock data based on selected supplier */}

                    {displayedData.map((invoice) => (
                        <div
                            key={invoice.invoice_number}
                            onDoubleClick={handleInvoiceDoubleClick}
                            className="cursor-pointer hover:bg-slate-100/50 transition-colors"
                        >
                            <InvoiceDialog
                                invoice={invoice}
                                id={customerId}
                                activity={invoice}
                                context="customer"
                            />
                        </div>
                    ))}
                    {totalCount === 0 && (
                        <p className="text-center py-4 text-slate-400">No invoices found</p>
                    )}
                </div>
            </div>

            {totalCount > 3 && (
                <div className='mt-4'>
                    <p
                        className='text-center hover:underline cursor-pointer'
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Show less' : 'Show more'}
                    </p>
                </div>
            )}
        </div>
    );
};
{/*</div>*/
}
{/*<div className="mt-2">*/
}
{/*  <div className="flex flex-col gap-1">*/
}
{/*    */
}
{/*    /!* //TODO: map restock data based on selected supplier *!/*/
}
{/*<Dialog*/
}
{/*  open={isDialogOpen}*/
}
{/*  onOpenChange={(open) => {*/
}
{/*    if (!open) {*/
}
{/*      if (isEditing) {*/
}
{/*        setShowWarning(true);*/
}
{/*        return;*/
}
{/*      }*/
}
{/*    }*/
}
{/*    setIsDialogOpen(open);*/
}
{/*    if (!open) {*/
}
{/*      setShowWarning(false);*/
}
{/*    }*/
}
{/*  }}*/
}
{/*>*/
}
{/*  <DialogTrigger>*/
}
{/*    <CustomerRestockCard*/
}
{/*      invoiceData={invoiceData}*/
}
{/*      first_name={first_name}*/
}
{/*      last_name={last_name}*/
}
{/*    />*/
}
{/*  </DialogTrigger>*/
}
{/*  <DialogContent*/
}
{/*    className="flex max-h-[80%] !w-full !max-w-3xl flex-col [&>button]:hidden"*/
}
{/*    onKeyDown={handleKeyDown}*/
}
{/*  >*/
}
{/*    <DialogHeader*/
}
{/*      className={`text-xl ${poppins.className} font-normal`}*/
}
{/*    >*/
}
{/*      <div className="flex items-center justify-between">*/
}
{/*        <div className="flex h-full flex-col justify-between gap-2">*/
}
{/*          <DialogTitle className="text-xl font-normal text-slate-700">*/
}
{/*            #12345678 /!** Please pass real data here *!/*/
}
{/*          </DialogTitle>*/
}
{/*          <div className="flex items-center gap-3 text-slate-400">*/
}
{/*            <Calendar className="h-4 w-4" />*/
}
{/*            <DialogDescription className="text-sm tracking-wide">*/
}
{/*              2025-01-13 /!** Please pass real data here *!/*/
}
{/*            </DialogDescription>*/
}
{/*          </div>*/
}
{/*        </div>*/
}
{/*        <div className="flex items-center gap-3">*/
}
{/*          <RecordEditor*/
}
{/*            isEditing={isEditing}*/
}
{/*            handleEdit={handleEdit}*/
}
{/*          />*/
}
{/*          <RecordExpand />*/
}
{/*        </div>*/
}
{/*      </div>*/
}
{/*    </DialogHeader>*/
}

{/*    <Separator orientation="horizontal" className="h-[2px]" />*/
}

{/*    <div className="flex gap-3">*/
}
{/*      <div className="group flex w-1/2 flex-col gap-2">*/
}
{/*        <Label className="text-slate-400">Customer & Term</Label>*/
}
{/*        <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">*/
}
{/*          <Input*/
}
{/*            className="w-3/4 rounded-r-none bg-slate-100 text-slate-700 shadow-none"*/
}
{/*            disabled={!isEditing}*/
}
{/*            defaultValue={"Customer"}*/
}
{/*          />{" "}*/
}
{/*          /!** Please pass real data here *!/*/
}
{/*          <Separator orientation="vertical" className="w-[3px]" />*/
}
{/*          <Input*/
}
{/*            className="w-1/4 rounded-l-none bg-slate-100 text-slate-700 shadow-none"*/
}
{/*            disabled={!isEditing}*/
}
{/*          />*/
}
{/*        </div>*/
}
{/*      </div>*/
}
{/*      <div className="group flex w-1/2 flex-col gap-2">*/
}
{/*        <Label className="text-slate-400">Recorded by</Label>*/
}
{/*        <div className="flex items-center rounded-lg focus-within:outline focus-within:outline-2 focus-within:outline-slate-200">*/
}
{/*          <Input*/
}
{/*            className="bg-slate-100 text-slate-700 shadow-none"*/
}
{/*            disabled={!isEditing}*/
}
{/*            defaultValue={"Employee"}*/
}
{/*          />{" "}*/
}
{/*          /!** Please pass real data here *!/*/
}
{/*        </div>*/
}
{/*      </div>*/
}
{/*    </div>*/
}

{/*    /!* <InvoiceTable orderItem={line_items} isEditing={isEditing} /> *!/*/
}
{/*    <p>*/
}
{/*      Note: Gi tanggal ko ang RestockTable component and other*/
}
{/*      functionality for now kay di ko sure kung tama ang pag reference*/
}
{/*      sa db......... but this is how it should look like oke?*/
}
{/*    </p>*/
}

{/*    <Separator orientation="horizontal" className="h-[2px]" />*/
}

{/*    <Textarea*/
}
{/*      className="!min-h-16 resize-none border-none bg-slate-100 text-slate-700 focus:outline focus:outline-2 focus:outline-slate-200"*/
}
{/*      placeholder="Your record notes..."*/
}
{/*      disabled={!isEditing}*/
}
{/*    />*/
}

{/*    <div className="flex items-center justify-between">*/
}
{/*      <div className="flex h-full flex-col justify-between gap-1">*/
}
{/*        <p className="text-base font-normal text-slate-700">*/
}
{/*          ₱{5000}*/
}
{/*        </p>*/
}
{/*        <div className="flex items-center gap-3 text-slate-400">*/
}
{/*          <p className="text-sm tracking-wide">Grand Total</p>*/
}
{/*          <Separator*/
}
{/*            orientation="vertical"*/
}
{/*            className="h-4 w-[2px] bg-slate-200"*/
}
{/*          />*/
}
{/*          <p className="text-sm tracking-wide">{"0%"} discount</p>{" "}*/
}
{/*          /!** Please pass real data here *!/*/
}
{/*        </div>*/
}
{/*      </div>*/
}
{/*      <div className="flex items-center gap-2">*/
}
{/*        <DialogClose asChild disabled={isEditing}>*/
}
{/*          <Button*/
}
{/*            variant={"secondary"}*/
}
{/*            className="text-slate-700 hover:bg-slate-200"*/
}
{/*            disabled={isEditing}*/
}
{/*          >*/
}
{/*            Close*/
}
{/*          </Button>*/
}
{/*        </DialogClose>*/
}
{/*        <Button*/
}
{/*          className="bg-green hover:bg-green/80"*/
}
{/*          disabled={isEditing}*/
}
{/*        >*/
}
{/*          <Printer />*/
}
{/*          Print Invoice*/
}
{/*        </Button>*/
}
{/*      </div>*/
}
{/*    </div>*/
}
{/*    {showWarning && (*/
}
{/*      <p className="text-right text-sm text-orange-400">*/
}
{/*        Whoops! Don't forget to save your changes.*/
}
{/*      </p>*/
}
{/*    )}*/
}
{/*  </DialogContent>*/
}
{/*</Dialog>*/
}

{/*          */
}
{/*          <Separator orientation="horizontal" className="h-[1px]" />*/
}
{/*        </div>*/
}
{/*      </div>*/
}
{/*      <div className="mt-4">*/
}
{/*        <p className="cursor-pointer text-center hover:underline">Show more</p>*/
}
{/*      </div>*/
}
{/*    </div>*/
}
{/*  );*/
}
{/*}*/
}

const CustomerRestockCard = ({invoiceData}: CustomerInvoiceProps) => {
    // TODO: reflect restock data based on selected supplier

    return invoiceData.map((invoice, index) => (
        <div
            className="flex cursor-pointer flex-col gap-4 rounded-lg p-5 transition-all duration-300 hover:bg-slate-200/50"
            key={index}
        >
            <p className="text-left text-slate-600">#{invoice.invoice_number}</p>
            <div className="flex flex-grow items-center gap-3 overflow-hidden">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <IdCard className="h-4 w-4"/>
                        </TooltipTrigger>
                        <TooltipContent
                            className="my-4 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-none">
                            Recorded by Stacey Andrew Moralidad Gonzaga
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <p className="truncate text-sm">
                    {invoice.invoiceClerk.Personal_Details.company}
                </p>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-3 text-slate-400">
                    {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Calendar className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent className="my-4 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-none">
                Recorded on 2025-01-13
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
                    <p className="text-sm">{invoice.created_at.toLocaleDateString()}</p>
                </div>
                <Separator
                    orientation="vertical"
                    className="h-6 w-[2px] bg-slate-200"
                />
                <div className="flex items-center gap-3">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PhilippinePeso className="h-4 w-4"/>
                            </TooltipTrigger>
                            <TooltipContent
                                className="my-4 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-none">
                                ₱{invoice.total_amount} grand total
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <p className="text-sm">{invoice.total_amount}</p>
                </div>
            </div>
        </div>
    ));
};
