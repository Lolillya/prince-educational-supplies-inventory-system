import { CornerDownRight, X } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { ScrollArea } from '~/components/ui/scroll-area'
import { api } from "~/trpc/react"

interface ConversionProps {
	data: {
		id: number;
		qty: string;
		unit: string;
		stock: string;
		price: string;
	};
	onRemove: () => void;
	onUpdate: (data: ConversionProps['data']) => void;
}

const Conversion = ({ data, onRemove, onUpdate }: ConversionProps) => {
	const [inputValue, setInputValue] = useState(data.unit)
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
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

	return (
		<div className='mt-4'>
			<div className="flex gap-4">
				<div className="w-1/2 flex flex-col gap-1">
					<div className="flex">
						<div className="flex items-center">
							<div className="flex h-10 w-12 items-end justify-center !p-1">
								<CornerDownRight
									className="!h-5 !w-5 text-slate-400"
									strokeWidth={2.5}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<div className="flex gap-2">
									<div className="flex flex-col gap-1">
										<Label className="text-sm text-slate-400">Conversion</Label>
										<div className="flex w-full">
											<div className="w-1/2">
												<Input
													className="bg-white shadow-none rounded-r-none text-slate-700"
													placeholder='Qty'
													type="number"
													min="1"
													step="1"
													defaultValue={1}
													onKeyDown={(e) => {
														if (e.key === '.') {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const value = e.target.value;
														if (!value) {
															onUpdate({ ...data, qty: "1" });
														} else {
															// Remove any decimals and non-numeric characters
															const cleanValue = value.replace(/[^\d]/g, '');
															onUpdate({ ...data, qty: cleanValue });
														}
													}}
													onBlur={(e) => {
														if (!e.target.value) {
															onUpdate({ ...data, qty: "1" });
														}
													}}
												/>
											</div>
											<Separator orientation="vertical" className="h-auto w-1 bg-slate-200" />
											<div className="w-1/2 relative">
												<Input
													ref={inputRef}
													className="bg-white shadow-none rounded-l-none text-slate-700"
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
														className="absolute left-0 top-full z-[9999] mt-1 w-full"
														style={{
															position: 'fixed',
															transform: 'translateY(0)',
															width: inputRef.current?.offsetWidth + 'px',
															left: inputRef.current?.getBoundingClientRect().left + 'px',
															top: (inputRef.current?.getBoundingClientRect().bottom || 0) + 4 + 'px'
														}}
													>
														<div className="bg-white rounded-md shadow-lg">
															<ScrollArea className="max-h-[200px]">
																{filteredUnits.map((unitName, index) => (
																	<div
																		key={index}
																		className={`cursor-pointer px-4 py-2 hover:bg-slate-100 ${highlightedIndex === index ? "bg-slate-200" : ""
																			}`}
																		onMouseDown={() => handleSelectUnit(unitName)}
																	>
																		{unitName}
																	</div>
																))}
															</ScrollArea>
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
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
								min="0"
								className="bg-white text-slate-700 shadow-none"
								placeholder='Stock'
								defaultValue={0}
								onKeyDown={(e) => {
									if (e.key === '.') {
										e.preventDefault();
									}
								}}
								onChange={(e) => {
									const value = e.target.value;
									if (!value) {
										e.target.value = "0";
									} else {
										// Remove any decimals and non-numeric characters
										e.target.value = value.replace(/[^\d]/g, '');
									}
								}}
								onBlur={(e) => {
									if (!e.target.value) {
										e.target.value = "0";
									}
								}}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label className="text-sm text-slate-400">Unit Price</Label>
							<Input
								type="number"
								step="0.01"
								min="0"
								className="bg-white text-slate-700 shadow-none"
								placeholder='Price'
								defaultValue={0}
								onChange={(e) => {
									if (!e.target.value) {
										e.target.value = "0.00";
									}
								}}
								onBlur={(e) => {
									if (!e.target.value) {
										e.target.value = "0";
									} else {
										const value = Number.parseFloat(e.target.value);
										e.target.value = value.toFixed(2);
									}
								}}
							/>
						</div>
						<Button
							className="flex h-10 w-12 items-center justify-center !p-1 bg-slate-100 hover:!bg-slate-200/50"
							onClick={onRemove}
						>
							<X
								className="!h-5 !w-5 text-slate-400"
								strokeWidth={2.5}
							/>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Conversion