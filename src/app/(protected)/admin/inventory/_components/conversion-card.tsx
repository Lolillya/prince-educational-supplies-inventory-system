import { ArrowLeft, CornerDownRight, Plus, X } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import Conversion from './conversion'
import { ScrollArea } from '~/components/ui/scroll-area'
import { api } from "~/trpc/react"

interface ConversionData {
	id: number;
	qty: string;
	unit: string;
	stock: string;
	price: string;
}

interface ConversionCardProps {
	onRemove?: () => void;
}

const ConversionCard = ({ onRemove }: ConversionCardProps) => {
	const [mainStock, setMainStock] = useState("0")
	const [mainPrice, setMainPrice] = useState("0.00")
	const [inputValue, setInputValue] = useState("")
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
	const [conversions, setConversions] = useState<ConversionData[]>([])
	const [nextId, setNextId] = useState(1)
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)

	const { data: units } = api.restock.getUnits.useQuery()
	const unitOptions = units?.map(unit => unit.name) ?? []

	const inputRef = useRef<HTMLInputElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const filteredUnits = inputValue
		? unitOptions.filter(name =>
			name.toLowerCase().includes(inputValue.toLowerCase())
		)
		: []

	const handleSelectUnit = (unitName: string) => {
		setInputValue(unitName)
		setHighlightedIndex(-1)
		setIsDropdownVisible(false)
		if (inputRef.current) {
			inputRef.current.blur()
		}
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				inputRef.current &&
				dropdownRef.current &&
				!inputRef.current.contains(event.target as Node) &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownVisible(false)
				if (!unitOptions.includes(inputValue)) {
					setInputValue("")
				}
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [inputValue, unitOptions])

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault()
			setHighlightedIndex(prev =>
				prev < filteredUnits.length - 1 ? prev + 1 : prev
			)
		} else if (e.key === "ArrowUp") {
			e.preventDefault()
			setHighlightedIndex(prev =>
				prev > 0 ? prev - 1 : prev
			)
		} else if (e.key === "Enter" && highlightedIndex >= 0) {
			e.preventDefault()
			const selectedUnit = filteredUnits[highlightedIndex]
			if (selectedUnit) {
				handleSelectUnit(selectedUnit)
			}
		} else if (e.key === "Escape") {
			setInputValue("")
			setHighlightedIndex(-1)
		}
	}

	const handleUpdateConversion = useCallback((updatedData: ConversionData) => {
		setConversions(prev => {
			const newConversions = prev.map(conv =>
				conv.id === updatedData.id ? updatedData : conv
			);
			return newConversions;
		});
	}, []);

	const handleAddConversion = () => {
		setConversions(prev => [...prev, {
			id: nextId,
			qty: "",
			unit: "",
			stock: "0",
			price: "0.00"
		}]);
		setNextId(prev => prev + 1);
	};

	const handleRemoveConversion = (id: number) => {
		setConversions(prev => prev.filter(conv => conv.id !== id));
	};

	return (
		<div className="bg-slate-100 p-4 rounded-lg">
			<div className="flex gap-4">
				<div className="w-3/5 flex flex-col gap-1">
					<Label className="text-sm text-slate-400">Main Unit</Label>
					<div className="relative">
						<Input
							ref={inputRef}
							className="bg-white shadow-none text-slate-700"
							placeholder='Unit'
							value={inputValue}
							onChange={(e) => {
								const value = e.target.value
								if (/^[a-zA-Z ]*$/.test(value)) {
									setInputValue(value)
									setHighlightedIndex(-1)
									setIsDropdownVisible(true)
								}
							}}
							onFocus={() => {
								if (inputValue && filteredUnits.length > 0) {
									setIsDropdownVisible(true)
								}
							}}
							onBlur={() => {
								setTimeout(() => {
									if (!dropdownRef.current?.contains(document.activeElement)) {
										setIsDropdownVisible(false)
									}
								}, 100)
							}}
							onKeyDown={handleKeyDown}
						/>

						{isDropdownVisible && inputValue && filteredUnits.length > 0 && (
							<div
								ref={dropdownRef}
								className="absolute left-0 top-full z-50 mt-1 w-full rounded-md bg-white shadow-lg"
							>
								<ScrollArea className="max-h-[200px]">
									{filteredUnits.map((unitName, index) => (
										<div
											key={unitName}
											className={`cursor-pointer px-4 py-2 hover:bg-slate-100 ${highlightedIndex === index ? "bg-slate-200" : ""}`}
											onMouseDown={() => handleSelectUnit(unitName)}
										>
											{unitName}
										</div>
									))}
								</ScrollArea>
							</div>
						)}
					</div>
				</div>
				<Separator orientation="vertical" className="h-auto w-px bg-slate-300" />
				<div className="w-2/5 flex flex-col gap-2">
					<div className="flex gap-2 items-end">
						<div className="flex flex-col gap-1">
							<Label className="text-sm text-slate-400">Unit Price</Label>
							<Input
								type="number"
								step="0.25"
								min="0"
								className="bg-white text-slate-700 shadow-none"
								placeholder='Price'
								value={mainPrice}
								onChange={(e) => {
									const value = e.target.value || "0.00";
									setMainPrice(value);
								}}
								onBlur={(e) => {
									if (!e.target.value) {
										setMainPrice("0.00");
									} else {
										setMainPrice(Number.parseFloat(e.target.value).toFixed(2));
									}
								}}
							/>
						</div>
						<div className="flex h-10 w-12 items-center justify-center !p-1">
							<TooltipProvider>
								<Tooltip delayDuration={300}>
									<TooltipTrigger asChild>
										<ArrowLeft
											className="!h-5 !w-5 text-slate-400"
											strokeWidth={2.5}
										/>
									</TooltipTrigger>
									<TooltipContent className="my-4 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-700 shadow-none">
										This is your main unit.
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
					</div>
				</div>
			</div>
			<div className="mt-4 h-[1px] border-t-[3px] border-dashed border-slate-300" />

			<ScrollArea className='h-40'>
				<div className="px-1 pb-1">
					{conversions.length === 0 ? (
						<p className='text-slate-400 text-sm text-center mt-6 italic'>
							No conversions
						</p>
					) : (
						conversions.map(conversion => (
							<Conversion
								key={conversion.id}
								data={conversion}
								onRemove={() => handleRemoveConversion(conversion.id)}
								onUpdate={handleUpdateConversion}
							/>
						))
					)}
				</div>
			</ScrollArea>

			<div className="flex flex-col gap-2 mt-4">
				<Button
					className='bg-slate-100 rounded-lg p-2 w-full text-slate-400 hover:bg-emerald-100 border-[3px] border-dashed border-slate-300 hover:border-emerald-300 hover:text-emerald-400'
					onClick={handleAddConversion}
					disabled={conversions.length >= 5}
				>
					+ Add a conversion
				</Button>
				{onRemove && (
					<Button
						className="bg-slate-100 rounded-lg p-2 w-full text-slate-400 hover:bg-rose-100 border-[3px] border-dashed border-slate-300 hover:border-rose-300 hover:text-rose-400"
						onClick={onRemove}
					>
						Remove Preset
					</Button>
				)}
			</div>
		</div>
	)
}

export default ConversionCard