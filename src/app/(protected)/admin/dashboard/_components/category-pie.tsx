import { Box } from 'lucide-react';
import React from 'react';
import { Label, Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '~/components/ui/chart';
import PieContainer from './pie-chart-container';

interface CategoryPieCardProps {
	pieChartData: { category: string; sales: number; fill: string }[];
	pieChartConfig: { [key: string]: { label: string; color: string } };
	totalSales: number;
}

export const CategoryPieCard: React.FC<CategoryPieCardProps> = ({ pieChartData, pieChartConfig, totalSales }) => {
	return (
		<div className="bg-slate-100 p-6 rounded-lg w-full h-full flex" >
			<div className='w-1/4 flex flex-col gap-1 items-start justify-end'>
				<p className='text-slate-500'>Sales per</p>
				<div className=' flex items-center gap-2'>
					<Box className='text-slate-700 h-6 w-6' strokeWidth={2.5} />
					<p className='text-slate-700 font-bold text-2xl'>Category</p>
				</div>
			</div>
			<div className='w-3/4 flex items-center justify-center'>
				<PieContainer pieChartData={pieChartData} pieChartConfig={pieChartConfig} totalSales={totalSales}/>
			</div>
		</div>
	)
}

export const CategoryPie: React.FC<CategoryPieCardProps> = ({ pieChartData, pieChartConfig, totalSales }) => {
	return (
		<ChartContainer
			config={pieChartConfig}
			className="h-full"
		>
			<PieChart>
				<ChartTooltip
					cursor={false}
					content={<ChartTooltipContent hideLabel />}
				/>
				<Pie
					data={pieChartData}
					dataKey="sales"
					nameKey="category"
					innerRadius={50}
				>
					<Label
						content={({ viewBox }) => {
							if (viewBox && "cx" in viewBox && "cy" in viewBox) {
								return (
									<text
										x={viewBox.cx}
										y={viewBox.cy}
										textAnchor="middle"
										dominantBaseline="middle"
									>
										<tspan
											x={viewBox.cx}
											y={viewBox.cy}
											className="fill-slate-700 text-2xl font-bold"
										>
											{totalSales.toLocaleString()}
										</tspan>
										<tspan
											x={viewBox.cx}
											y={(viewBox.cy || 0) + 20}
											className="fill-muted-foreground"
										>
											total sales
										</tspan>
									</text>
								)
							}
						}}
					/>
					</Pie>
			</PieChart>
		</ChartContainer>
	)
}