import { ArrowBigDownDashIcon, ArrowBigUpDashIcon, ChevronsUp, Package, UsersRound } from 'lucide-react'

type StatusProps = {
	percentage?: number,
	count: number
}

export const StockInStatus: React.FC<StatusProps> = ({ 
	percentage = 0,
	count
 }) => {
	return (
		<div className='p-6 bg-slate-100 rounded-lg w-1/4'>
			<div className='flex gap-3 items-center justify-between'>
				<div className='flex flex-col gap-3'>
					<div className='flex gap-3'>
						<h3 className='text-slate-500'>Stocked In</h3>
						<div className='text-green flex items-center'>
							<ChevronsUp className='w-4 h-4' />
							<p className='tracking-wide'><span>{percentage.toFixed(1)}</span>%</p>
						</div>
					</div>
					<p className='font-bold text-2xl text-slate-700'>{count.toLocaleString()}</p>
				</div>
				<div className='h-16 w-16 rounded-2xl bg-sky-200 flex justify-center items-center'>
					<ArrowBigUpDashIcon className='text-sky-500 h-10 w-10' strokeWidth={1.5} />
				</div>
			</div>
		</div>
	)
}

export const StockOutStatus: React.FC<StatusProps> = ({
	percentage = 0,
	count
}) => {
	return (
		<div className='p-6 bg-slate-100 rounded-lg w-1/4'>
			<div className='flex gap-3 items-center justify-between'>
				<div className='flex flex-col gap-3'>
					<div className='flex gap-3'>
						<h3 className='text-slate-500'>Stocked Out</h3>
						<div className='text-green flex items-center'>
							<ChevronsUp className='w-4 h-4' />
							<p className='tracking-wide'><span>{percentage.toFixed(1)}</span>%</p>
						</div>
					</div>
					<p className='font-bold text-2xl text-slate-700'>{count.toLocaleString()}</p>
				</div>
				<div className='h-16 w-16 rounded-2xl bg-sky-200 flex justify-center items-center'>
					<ArrowBigDownDashIcon className='text-sky-500 h-10 w-10' strokeWidth={1.5} />
				</div>
			</div>
		</div>
	)
}

export const CustomerStatus: React.FC<StatusProps> = ({ count }) => {
	return (
		<div className='p-6 bg-slate-100 rounded-lg w-1/4'>
			<div className='flex gap-3 items-center justify-between'>
				<div className='flex flex-col gap-3'>
					<h3 className='text-slate-500'>Customer</h3>
					<p className='font-bold text-2xl text-slate-700'>{count.toLocaleString()}</p>
				</div>
				<div className='h-16 w-16 rounded-2xl bg-pink-200 flex justify-center items-center'>
					<UsersRound className='text-pink-500 h-10 w-10' strokeWidth={1.5} />
				</div>
			</div>
		</div>
	)
}

export const SupplierStatus: React.FC<StatusProps> = ({ count }) => {
	return (
		<div className='p-6 bg-slate-100 rounded-lg w-1/4'>
			<div className='flex gap-3 items-center justify-between'>
				<div className='flex flex-col gap-3'>
					<h3 className='text-slate-500'>Supplier</h3>
					<p className='font-bold text-2xl text-slate-700'>{count.toLocaleString()}</p>
				</div>
				<div className='h-16 w-16 rounded-2xl bg-pink-200 flex justify-center items-center'>
					<Package className='text-pink-500 h-10 w-10' strokeWidth={1.5} />
				</div>
			</div>
		</div>
	)
}