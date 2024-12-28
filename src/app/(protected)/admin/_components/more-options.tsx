import { Ellipsis } from 'lucide-react'
import React from 'react'
import { string } from 'zod'
import { Button } from '~/components/ui/button'

type MoreOptionsProps = {
	className?: string,
};

const MoreOptions: React.FC<MoreOptionsProps> = ({ className = "" }) => {
	return (
		<Button asChild>
			<div className={`flex items-center justify-center rounded-xl bg-transparent hover:bg-slate-200 h-12 w-12 transition-colors duration-300 ${className}`}>
				<Ellipsis className="text-slate-500 hover:text-slate-600 !h-5 !w-5" strokeWidth={2.5}/>
			</div>
		</Button>
	)
}

export default MoreOptions