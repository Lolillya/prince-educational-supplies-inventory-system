import React from 'react'

interface RecordNotesProps {
	notes?: string | undefined | null;	
}

const RecordNotes = ({ notes }: RecordNotesProps) => {
	return (
		<div className='p-4 bg-white/60 rounded-lg text-slate-700 flex flex-col gap-2'>
			<p className='text-slate-400 text-sm'>
				Notes
			</p>
			{notes ? (
				<p className='text-slate-600'>
					{notes}
				</p>
			) : (
				<p className='text-slate-300'>
					No notes available...
				</p>
			)}
		</div>
	)
}

export default RecordNotes