import { ArrowRight, Award, PersonStanding, Truck, Users2 } from 'lucide-react'
import React from 'react'
import { Separator } from '~/components/ui/separator'
import LeaderboardItem from './leaderboard-item'

interface LeaderboardProps {
	rank: number;
	record: string;
};

const supplierLeaderboard: LeaderboardProps[] = [
	{ rank: 1, record: "Adrian Huang" },
	{ rank: 2, record: "Kenji Azriel Mende" },
	{ rank: 3, record: "Stacey Andrew Gonzaga" },
];

const customerLeaderboard: LeaderboardProps[] = [
	{ rank: 1, record: "Joshua Sevilla" },
	{ rank: 2, record: "John Doe" },
	{ rank: 3, record: "Jerald Dagaang" },
];

const Ranking = () => {
	return (
		<div className="bg-slate-100 p-6 rounded-lg h-full" >

			<div className='flex justify-between items-center'>
				<div className=' flex items-center gap-2'>
					<Award className='text-slate-700 h-6 w-6' strokeWidth={2.5} />
					<p className='text-slate-700 font-bold text-2xl'>Leaderboard</p>
				</div>
				<p className='text-slate-500 tracking-wide'>Your top performing partners!</p>
			</div>

			<Separator orientation="horizontal" className="mt-4 h-[2px]" />

			<div className='mt-4 flex flex-col gap-4'>
				<div className='flex items-center justify-between w-full'>
					<div className="flex items-center">
						<div className='h-12 w-12 rounded-xl flex items-center justify-center bg-pink-200'>
							<Truck className='text-pink-500' />
						</div>
						<p className='font-bold text-xl text-slate-700 pl-4'>Suppliers</p>
					</div>
					<div className='flex gap-2 mt-4 items-center group'>
						<p className='text-slate-400 group-hover:text-slate-500 transition-colors duration-300'>View full ranking</p>
						<ArrowRight className='text-slate-400 h-5 w-5 group-hover:text-slate-500 transition-colors duration-300' />
					</div>
				</div>
				<div className='flex flex-col items-center gap-4'>
					{supplierLeaderboard.map((item, index) => {
						return (
							<LeaderboardItem key={index} rank={item.rank} record={item.record} />
						)
					})}
				</div>

				<div className='flex items-center justify-between w-full'>
					<div className="flex items-center">
						<div className='h-12 w-12 rounded-xl flex items-center justify-center bg-pink-200'>
							<Users2 className='text-pink-500' />
						</div>
						<p className='font-bold text-xl text-slate-700 pl-4'>Suppliers</p>
					</div>
					<div className='flex gap-2 mt-4 items-center group'>
						<p className='text-slate-400 group-hover:text-slate-500 transition-colors duration-300'>View full ranking</p>
						<ArrowRight className='text-slate-400 h-5 w-5 group-hover:text-slate-500 transition-colors duration-300' />
					</div>
				</div>
				<div className='flex flex-col items-center gap-4'>
					{customerLeaderboard.map((item, index) => {
						return (
							<LeaderboardItem key={index} rank={item.rank} record={item.record} />
						)
					})}
				</div>
			</div>

		</div>
	)
}

export default Ranking