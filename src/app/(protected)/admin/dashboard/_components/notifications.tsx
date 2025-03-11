import { Bell, BellOff } from 'lucide-react'
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import NotificationItem from './notification-item'

interface Notifications {
	date: string;
	time: string;
	type: 'restocked' | 'stocked out' | 'edit' | 'delete';
	employee: string;
	details: {
		supplier?: string;
		customer?: string;
		recordType?: 'inventory' | 'suppliers' | 'customers' | 'other';
		recordName?: string;
	};
}

interface NotificationProps {
	notifications: Notifications[];
}

const Notification: React.FC<NotificationProps> = ({
	notifications
}) => {
	return (
		<Popover>
			<PopoverTrigger>
				<div className="relative bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition-colors duration-300 p-3 h-10 w-10 flex items-center justify-center rounded-lg">
					<Bell className="text-slate-500 hover:text-slate-600" strokeWidth={2.5} />
					{notifications.length === 0 ? (
						<></>
					) : (
						<div className='h-3 w-3 bg-yellow-200 absolute -top-1 -right-1 rounded-full outline outline-white outline-3' />
					)}

				</div>
			</PopoverTrigger>
			<PopoverContent className='shadow-none w-[480px]'>
				<div className="flex flex-col gap-3">
					<div className='flex justify-between items-center'>
						<p className='text-slate-700'>Notifications<span className='pl-4 text-slate-400 text-sm'>{notifications.length}</span></p>
						<div className='flex items-center gap-3'>
							<div className="relative bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition-colors duration-300 p-2 h-8 w-8 flex items-center justify-center rounded-lg">
								<BellOff className="text-slate-500 hover:text-slate-600" strokeWidth={2.5} />
							</div>
							<div className="relative bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition-colors duration-300 h-8 px-3 flex items-center justify-center rounded-lg text-sm text-slate-700">
								Clear all
							</div>
						</div>
					</div>
					<Separator />
					<ScrollArea className='h-96'>
						<div className='flex flex-col gap-1 pr-3'>
							{notifications.map((notif, index) => (
								<NotificationItem
									key={index}
									date={notif.date}
									time={notif.time}
									type={notif.type}
									employee={notif.employee}
									details={notif.details} />
							))}
						</div>
					</ScrollArea>
				</div>
			</PopoverContent>
		</Popover>
	)
}

export default Notification