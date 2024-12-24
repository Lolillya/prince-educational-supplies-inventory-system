import { ArrowRight } from 'lucide-react'
import React from 'react'
import { cn } from '~/lib/utils';

interface LeaderboardProps {
	rank: number;
	record: string;
	stockCount?: number;
	salesCount?: number;
};

const LeaderboardItem: React.FC<LeaderboardProps> = ({
	rank,
	record,
	stockCount,
	salesCount,
}) => {
	return (
		<div className='flex items-center bg-white/70 hover:bg-white rounded-xl w-full group'>
			<div className={cn('h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl text-white',
				rank === 1 && 'bg-teal-600',
				rank === 2 && 'bg-teal-500',
				rank === 3 && 'bg-teal-400',)}
			>
				{rank}
			</div>
			<div className='py-2 pl-4 pr-6 flex items-center justify-between w-full'>
				<p className='text-slate-700'>
					{record}
					<span className='pl-4 text-teal-400 tracking-wide text-sm'>
						{stockCount !== undefined ? (
							<span>+{stockCount} stocks</span>
						) : salesCount !== undefined ? (
							<span>+₱{salesCount} in sales</span>
						) : (
							<span>---</span>
						)}
					</span>
				</p>
				<div className='flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
					<p className='text-slate-400'>Veiw record</p>
					<ArrowRight className='text-slate-400 h-5 w-5' />
				</div>
			</div>
		</div>
	)
}

export default LeaderboardItem