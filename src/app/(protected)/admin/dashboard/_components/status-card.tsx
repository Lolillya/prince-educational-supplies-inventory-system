import { ArrowBigDownDashIcon, ArrowBigUpDashIcon, ChevronsDown, ChevronsRight, ChevronsUp, Truck, UsersRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

type StatusProps = {
	percentage?: number,
	count: number
}


export const StockInStatus: React.FC<StatusProps> = ({
	percentage = 0,
	count
}) => {

	const router = useRouter();

	return (
		<div className='p-6 bg-slate-100 hover:bg-slate-200/80 hover:cursor-pointer transition-colors duration-300 rounded-lg w-1/4' onClick={() => router.push("/admin/restock")}>
			<div className='flex gap-3 items-center justify-between'>
				<div className='flex flex-col gap-3'>
					<div className='flex gap-3'>
						<p className='text-slate-500'>Stocked In</p>
						{percentage > 0 ? (
							<div className='text-green flex items-center'>
								<ChevronsUp className='w-4 h-4' />
								<p className='tracking-wide'><span>{percentage.toFixed(1)}</span>%</p>
							</div>
						) : percentage < 0 ? (
							<div className='text-red flex items-center'>
								<ChevronsDown className='w-4 h-4' />
									<p className='tracking-wide'><span>{(percentage * -1).toFixed(1)}</span>%</p>
							</div>
						) : (
							<div className='text-amber-500 flex items-center'>
								<ChevronsRight className='w-4 h-4' />
								<p className='tracking-wide'><span>{percentage.toFixed(1)}</span>%</p>
							</div>
						)}
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

	const router = useRouter();

	return (
		<div className='p-6 bg-slate-100 hover:bg-slate-200/80 hover:cursor-pointer transition-colors duration-300 rounded-lg w-1/4' onClick={() => router.push("/admin/invoice")}>
			<div className='flex gap-3 items-center justify-between'>
				<div className='flex flex-col gap-3'>
					<div className='flex gap-3'>
						<p className='text-slate-500'>Stocked Out</p>
						{percentage > 0 ? (
							<div className='text-green flex items-center'>
								<ChevronsUp className='w-4 h-4' />
								<p className='tracking-wide'><span>{percentage.toFixed(1)}</span>%</p>
							</div>
						) : percentage < 0 ? (
							<div className='text-red flex items-center'>
								<ChevronsDown className='w-4 h-4' />
								<p className='tracking-wide'><span>{(percentage * -1).toFixed(1)}</span>%</p>
							</div>
						) : (
							<div className='text-amber-500 flex items-center'>
								<ChevronsRight className='w-4 h-4' />
								<p className='tracking-wide'><span>{percentage.toFixed(1)}</span>%</p>
							</div>
						)}
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

	const router = useRouter();

	return (
		<div className='p-6 bg-slate-100 hover:bg-slate-200/80 hover:cursor-pointer transition-colors duration-300 rounded-lg w-1/4' onClick={() => router.push("/admin/customers")}>
			<div className='flex gap-3 items-center justify-between'>
				<div className='flex flex-col gap-3'>
					<p className='text-slate-500'>Customers</p>
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

	const router = useRouter();

	return (
		<div className='p-6 bg-slate-100 hover:bg-slate-200/80 hover:cursor-pointer transition-colors duration-300 rounded-lg w-1/4' onClick={() => router.push("/admin/suppliers")}>
			<div className='flex gap-3 items-center justify-between'>
				<div className='flex flex-col gap-3'>
					<p className='text-slate-500'>Suppliers</p>
					<p className='font-bold text-2xl text-slate-700'>{count.toLocaleString()}</p>
				</div>
				<div className='h-16 w-16 rounded-2xl bg-pink-200 flex justify-center items-center'>
					<Truck className='text-pink-500 h-10 w-10' strokeWidth={1.5} />
				</div>
			</div>
		</div>
	)
}