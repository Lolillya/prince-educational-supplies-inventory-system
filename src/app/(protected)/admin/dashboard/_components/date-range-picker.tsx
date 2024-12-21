"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"


import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover"
import { cn } from "~/lib/utils"

export function CalendarDateRangePicker({
	className,
}: React.HTMLAttributes<HTMLDivElement>) {
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: new Date(2024, 10, 12),
		to: addDays(new Date(2024, 10, 12), 20),
	})

	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild className="bg-slate-100 border-none text-slate-500 hover:text-slate-600">
					<Button
						id="date"
						variant={"outline"}
						className={cn(
							"w-[260px] justify-start text-left",
							!date && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "LLL dd, y")} -{" "}
									{format(date.to, "LLL dd, y")}
								</>
							) : (
								format(date.from, "LLL dd, y")
							)
						) : (
							<span>Pick a date</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="end">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}