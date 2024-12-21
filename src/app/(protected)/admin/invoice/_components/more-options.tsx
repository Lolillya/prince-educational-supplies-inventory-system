import { Ellipsis } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'

const MoreOptions = () => {
	return (
		<Button
			className="bg-transparent hover:bg-slate-200 h-12 w-12">
			<Ellipsis className="text-slate-500 hover:text-slate-600 !h-5 !w-5" strokeWidth={2.5}/>
		</Button>
	)
}

export default MoreOptions