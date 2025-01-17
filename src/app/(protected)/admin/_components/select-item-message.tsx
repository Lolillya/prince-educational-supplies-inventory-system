import { MousePointerClick } from 'lucide-react'
import React from 'react'

const SelectItemMessage = () => {
	return (
		<div className='flex items-center justify-center text-center w-full'>
			<div className='flex flex-col gap-8 items-center '>
				<MousePointerClick className="w-20 h-20 text-slate-500" strokeWidth={1.5} />
				<p className="text-slate-500">
					Search and select an item<br />to view its details.
				</p>
			</div>
		</div>
	)
}

export default SelectItemMessage