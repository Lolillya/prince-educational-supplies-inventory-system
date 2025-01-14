import { ArrowRight } from 'lucide-react';
import React from 'react'

interface UnitConversion {
	from: string;
	count: number;
	to: string;
}

const UnitLine: React.FC<UnitConversion> = ({
	from,
	count,
	to,
}) => {
	return (
		<div className='flex justify-between items-center w-full'>
			<p className='text-sm text-slate-500 flex items-center gap-2'>{from} <ArrowRight  className='w-3 h-3' strokeWidth={1.5}/> {count} {to}</p>
			<p className='text-sm text-slate-500'>500.00</p>
		</div>
	)
}

export default UnitLine