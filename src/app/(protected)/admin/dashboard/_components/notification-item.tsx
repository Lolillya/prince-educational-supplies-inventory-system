import { X } from 'lucide-react';
import React from 'react';

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

const NotificationItem: React.FC<Notifications> = ({
	date,
	time,
	type,
	employee,
	details,
}) => {
	return (
		<div className='bg-transparent hover:bg-slate-100 transition-colors duration-300 w-full py-3 px-4 rounded-xl'>
			<div className="flex items-center justify-between">
				<div className='flex gap-3 w-5/6'>
					<div className='h-2 w-2 bg-sky-300 rounded-full mt-2' />
					<div className='flex flex-col gap-3 w-5/6'>
						<p className='text-slate-700 line-clamp-2'>
							{type === 'restocked' ? (
								<>{employee} restocked from {details.supplier}.</>
							) : type === 'stocked out' ? (
								<>{employee} stocked out to {details.customer}.</>
							) : type === 'edit' ? (
								<>{employee} made an edit to {details.recordType}.</>
							) : type === 'delete' ? (
								<>{employee} deleted from {details.recordType}.</>
							) : (
								<>---</>
							)}
						</p>
						<div className='flex gap-3 text-slate-400'>
							<p>{date}</p>
							<p>{time}</p>
						</div>
					</div>
				</div>
				<X className='w-4 h-4 text-slate-400 hover:cursor-pointer hover:text-slate-600 transition-colors duration-300' />
			</div>
		</div>
	)
}

export default NotificationItem