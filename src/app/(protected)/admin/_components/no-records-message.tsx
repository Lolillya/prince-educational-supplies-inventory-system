import { FileSearch } from 'lucide-react'
import Link from 'next/link';
import React from 'react'

type RecordsMessageProps ={
	records: string;
	link: string;
	item: string;
}

const NoRecordsMessage: React.FC<RecordsMessageProps> = ({ records, link, item }) => {
	return (
		<div className='flex items-center justify-center text-center w-full'>
			<div className='flex flex-col gap-8 items-center '>
				<FileSearch className="w-20 h-20 text-slate-500" strokeWidth={1.5} />
				<p className="text-slate-500">
					We can't find any {records} for now...
					<br />
					<Link href={link} className='text-green hover:underline hover:cursor-pointer'>
						Add a new {item}
					</Link>
				</p>
			</div>
		</div>
	)
}

export default NoRecordsMessage