import { Bell, Dot } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'

const Notifications = () => {
	return (
		<>
			<Button
				className="relative bg-slate-100 hover:bg-slate-200 p-3">
				<Bell className="text-slate-500 hover:text-slate-600" strokeWidth={2.5} />
				<div className='h-3 w-3 bg-yellow-200 absolute -top-1 -right-1 rounded-full outline outline-white outline-3'/>
			</Button>
		</>
	)
}

export default Notifications