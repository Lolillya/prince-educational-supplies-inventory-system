import { ListFilter } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'

const Filter = () => {
	return (
		<Button
			className="bg-slate-100 hover:bg-slate-200 p-3">
			<ListFilter className="text-slate-500 hover:text-slate-600" strokeWidth={2.5} />
		</Button>
	)
}

export default Filter