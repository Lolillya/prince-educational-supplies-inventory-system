import { Pencil } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

interface RecordEditorProps {
	isEditing: boolean;
	handleEdit: () => void;
};

const RecordEditor: React.FC<RecordEditorProps> = ({
	isEditing, handleEdit,
}) => {
	return (
		<div className='flex items-center justify-center gap-2 bg-slate-100 p-2 w-fit rounded-lg transition-all duration-300'>
			<div className={`flex items-center gap-2 transition-all duration-300
								${isEditing ? 'block' : 'hidden'}`}
			>
				<Button asChild onClick={handleEdit}>
					<div className='bg-slate-100 hover:bg-white hover:cursor-pointer h-9 px-2 text-slate-700'>
						Cancel
					</div>
				</Button>
				<Button asChild>
					<div className='bg-slate-100 hover:bg-white	hover:cursor-pointer h-9 px-2 text-slate-700'>
						Save
					</div>
				</Button>
			</div>
			<TooltipProvider delayDuration={0} skipDelayDuration={0}>
				<Tooltip>
					<TooltipTrigger>
						<Button asChild onClick={isEditing ? undefined : (handleEdit)} disabled={isEditing}>
							<div className={`h-9 w-9 p-0
													${isEditing
									? 'bg-white hover:bg-white hover:cursor-default'
									: 'bg-slate-100 hover:bg-slate-100 hover:cursor-pointer'
								}`}
							>
								<Pencil className='text-slate-700' />
							</div>
						</Button>
					</TooltipTrigger>
					{isEditing && (
						<TooltipContent className='text-slate-700 p-2 bg-slate-100 rounded-lg my-4 text-sm shadow-none'>
							You are editing this record
						</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>
		</div>
	)
}

export default RecordEditor