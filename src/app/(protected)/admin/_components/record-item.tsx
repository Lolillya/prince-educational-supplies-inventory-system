
import React from 'react'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Separator } from '~/components/ui/separator'
import Favorite from './favorite'
import MoreOptions from './more-options'
import Delete from './delete'

type RecordItemProps = {
	id: string;
	name: string | null;
	onClick: () => void;
	isSelected: boolean;
	recordType: string;
}

const RecordItem: React.FC<RecordItemProps> = ({ id, name, onClick, isSelected, recordType }) => {
	return (
		<>
			<div
				onClick={onClick}
				className={`w-full py-5 px-7 flex-grow-0 h-auto hover:bg-slate-50 hover:cursor-pointer rounded-lg mt-1 ${isSelected ? 'bg-slate-100 hover:!bg-slate-100' : ''}`}>
				<div className='flex items-center justify-between'>
					<div className='flex gap-6 items-center'>
						<Avatar className='h-12 w-12 !rounded-lg'>
							<AvatarFallback className="bg-black text-slate-700 !rounded-lg text-xl">
								👑
							</AvatarFallback>
						</Avatar>
						<div className='flex flex-col gap-2'>
							<p className='text-slate-700'>
								{name}
							</p>
							<p className='text-slate-400 text-sm'>
								{id}
							</p>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<Favorite />
						<Delete recordInfo={name} recordType={recordType} />
					</div>
				</div>
			</div>
			<Separator className='w-full h-[1px] bg-slate-100 mt-1' />
		</>
	)
}

export default RecordItem;
