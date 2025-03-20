import { ArrowDownRight, ArrowLeft, CornerDownRight, Plus, X } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import Conversion from './conversion'
import ViewConversion from './view-conversion'
import { ScrollArea } from '~/components/ui/scroll-area'
import { api } from "~/trpc/react"

interface StockCardV2Props {
	item: {
		inventory_id: number;
		variant: {
			name: string | undefined;
			item: {
				name: string;
				brand: {
					name: string;
				};
			};
		};
	};
	onRemove: () => void;
	onStockChange: (inventoryId: number, totalStock: string) => void;
	onPriceChange: (inventoryId: number, price: string) => void;
	onUnitChange: (inventoryId: number, unit: string) => void;
	onConversionChange: (conversions: { qty: string; unit: string; price: string; }[]) => void;
}

interface ConversionData {
	id: number;
	qty: string;
	unit: string;
	stock: string;
	price: string;
}

const StockCardV2 = ({ item, onRemove, onStockChange, onPriceChange, onUnitChange, onConversionChange }: StockCardV2Props) => {
	const [mainStock, setMainStock] = useState("0")
	const [mainPrice, setMainPrice] = useState("0.00")
	const [inputValue, setInputValue] = useState("")
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
	const [conversions, setConversions] = useState<ConversionData[]>([])
	const [nextId, setNextId] = useState(1)
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)

	const { data: units } = api.restock.getUnits.useQuery()
	const unitOptions = units?.map(unit => unit.name) ?? []

	const inputRef = React.useRef<HTMLInputElement>(null)
	const dropdownRef = React.useRef<HTMLDivElement>(null)

	// Compute filtered units directly without state
	const filteredUnits = inputValue
		? unitOptions.filter(name =>
			name.toLowerCase().includes(inputValue.toLowerCase())
		)
		: []

	const handleSelectUnit = (unitName: string) => {
		setInputValue(unitName)
		setHighlightedIndex(-1)
		setIsDropdownVisible(false)
		onUnitChange(item.inventory_id, unitName)
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

	// Move the conversion data update to a separate effect with a debounce
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			const conversionData = conversions.map(conv => ({
				qty: conv.qty,
				unit: conv.unit,
				price: conv.price
			}));
			onConversionChange(conversionData);
		}, 100); // Small delay to prevent rapid updates

		return () => clearTimeout(timeoutId);
	}, [conversions, onConversionChange]);

	// Simplify the stock update effect
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			const totalStockValue = Number(mainStock) + conversions.reduce((sum, conv) =>
				sum + Number(conv.stock), 0
			);
			onStockChange(item.inventory_id, totalStockValue.toString());
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [mainStock, conversions, item.inventory_id, onStockChange]);

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
		<div className='bg-slate-100 p-4 rounded-lg'>
			<div className='flex justify-between items-center'>
				<p className='text-slate-700'>
					{item.variant.item.name} - {item.variant.item.brand.name} - {item.variant.name || "N/A"}
				</p>
				<Button
					className="flex h-10 w-10 items-center justify-center !p-1 bg-slate-100 hover:!bg-slate-100"
					onClick={onRemove}
				>
					<X
						className="!h-5 !w-5 text-slate-400"
						strokeWidth={2.5}
					/>
				</Button>
			</div>
			<div className='mt-4'>
				<div className="flex gap-4">
					<div className="w-1/2 flex flex-col gap-1">
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
												className={`cursor-pointer px-4 py-2 hover:bg-slate-100 ${highlightedIndex === index ? "bg-slate-200" : ""
													}`}
												onMouseDown={() => handleSelectUnit(unitName)}
											>
												{unitName}
											</div>
										))}
									</ScrollArea>
								</div>
							)}

							<div className="absolute right-2 top-1/2 -translate-y-1/2">
								<DropdownMenu>
									<DropdownMenuTrigger className="rounded-full p-1 cursor-pointer border-2 border-dashed border-slate-400">
										<Plus className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48 shadow-none mt-2">
										<DropdownMenuLabel className='text-slate-700'>Preset Conversions</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<ViewConversion />
										<ViewConversion />
										<ViewConversion />
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>
					<Separator orientation="vertical" className="h-auto w-px bg-slate-300" />
					<div className="w-1/2 flex flex-col gap-2">
						<div className="flex gap-2 items-end">
							<div className="flex flex-col gap-1">
								<Label className="text-sm text-slate-400">Stock</Label>
								<Input
									type="number"
									step="1"
									min="1"
									className="bg-white text-slate-700 shadow-none"
									placeholder='Stock'
									value={mainStock}
									onKeyDown={(e) => {
										if (e.key === '.') {
											e.preventDefault();
										}
									}}
									onChange={(e) => {
										const value = e.target.value.replace(/[^\d]/g, '');
										setMainStock(value || "1");
									}}
									onBlur={(e) => {
										if (!e.target.value) {
											setMainStock("1");
										}
									}}
								/>
							</div>
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
										onPriceChange(item.inventory_id, value);
									}}
									onBlur={(e) => {
										if (!e.target.value) {
											const value = "0.00";
											setMainPrice(value);
											onPriceChange(item.inventory_id, value);
										} else {
											const value = Number.parseFloat(e.target.value).toFixed(2);
											setMainPrice(value);
											onPriceChange(item.inventory_id, value);
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

			<Button
				className='bg-slate-200/70 p-2 rounded-lg border-[3px] border-dashed border-slate-300 w-full hover:bg-slate-200 cursor-pointer mt-4'
				onClick={handleAddConversion}
				disabled={conversions.length >= 5}
			>
				<p className='text-slate-500 text-sm text-center'>
					+ Add a conversion
				</p>
			</Button>

		</div>
	)
}

export default StockCardV2