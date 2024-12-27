"use client"

import { FileSearch, MousePointerClick, Plus } from 'lucide-react'
import { useRouter } from "next/navigation"
import { Button } from '~/components/ui/button'
import Filter from '../../_components/filter'
import SearchBar from '../../_components/search-bar'

const Suppliers = () => {
	const router = useRouter();

	return (
		<section className='px-20 py-10 text-base min-h-screen flex flex-col'>

			<div className="flex justify-between items-center">
				<div className="flex gap-3 items-center">
					<SearchBar value={''} onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
						throw new Error('Function not implemented.')
					} } />
					<Filter />
				</div>
				<Button
					onClick={() => router.push("/admin/suppliers/new-supplier")}
					className="bg-green hover:bg-green/80">
					<Plus strokeWidth={3} /> New Supplier
				</Button>
			</div>

			<div className="mt-8 flex gap-3 flex-grow">
				<div className="flex flex-col gap-3 w-3/5 flex-grow">
					<div className="bg-slate-100 w-full rounded-lg text-lg px-6 py-3">
						<p className="text-slate-500">Records</p>
					</div>
					<div className="flex-grow p-6 rounded-lg flex items-center justify-center text-center">

						{/** if there are no  */}
						<div className='flex flex-col gap-8 items-center '>
							<FileSearch className="w-20 h-20 text-slate-500" strokeWidth={1.5} />
							<p className="text-slate-500">
								We can't find anything for now...
								<br />
								<span className='text-green hover:underline hover:cursor-pointer'>
									Add a new supplier
								</span>
							</p>
						</div>

					</div>
				</div>
				<div className="flex flex-col gap-3 w-2/5 flex-grow">
					<div className="bg-slate-100 w-full rounded-lg text-lg px-6 py-3">
						<p className="text-slate-500">Details</p>
					</div>
					<div className="bg-slate-100 flex-grow p-6 rounded-lg flex items-center justify-center text-center">

						{/** if no item is selected */}
						<div className='flex flex-col gap-8 items-center '>
							<MousePointerClick className="w-20 h-20 text-slate-500" strokeWidth={1.5} />
							<p className="text-slate-500">
								Search and select an item<br />to view its details.
							</p>
						</div>

					</div>
				</div>
			</div>


		</section>
	)
}

export default Suppliers