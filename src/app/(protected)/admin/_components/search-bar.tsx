import { Search } from 'lucide-react'
import React from 'react'
import { Input } from '~/components/ui/input'

const SearchBar = () => {
	return (
		<div className='flex items-center px-3 rounded-lg bg-slate-100 focus-within:outline focus-within:outline-2 focus-within:outline-slate-200 w-[400px]'>
			<Search className='text-slate-500' />
			<Input placeholder='Search...' className='shadow-none bg-transparent w-full text-slate-700' />
		</div>
	)
}

export default SearchBar
