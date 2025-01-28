import { Maximize2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

const RecordExpand = () => {
	return (
		<div className='flex items-center justify-center gap-2 bg-slate-100 p-2 w-fit rounded-lg transition-all duration-300'>
			<TooltipProvider delayDuration={0} skipDelayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button asChild>
							<div className='h-9 w-9 p-0 bg-slate-100 hover:bg-slate-100 hover:cursor-pointer'>
								<Maximize2 className='text-slate-700' />
							</div>
						</Button>
					</TooltipTrigger>
					<TooltipContent className='text-slate-700 p-2 bg-white rounded-lg my-4 text-sm shadow-none border border-slate-200'>
						Expand view
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	)
}

export default RecordExpand