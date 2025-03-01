import { Mail, MapPin, Phone, User2 } from 'lucide-react'
import React from 'react'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Separator } from '~/components/ui/separator'
import Edit from '../../_components/edit'
import RecordInfo from '../../_components/record-info'
import RecordNotes from '../../_components/record-notes'
import SupplierRestock from './supplier-restock'
import EditRecord from './edit-record'

type SelectedSupplierProps = {
	id: string;
	company: string | undefined | null;
	representative?: string | undefined | null;
	contact?: string | undefined | null;
	email?: string | undefined | null;
	location?: string | undefined | null;
	notes?: string | undefined | null;
	restockData?: any;
}

const SelectedSupplier = ({
	id,
	company,
	representative,
	contact,
	email,
	location,
	notes,
	restockData,
}: SelectedSupplierProps) => {
	return (
		<div className='flex flex-col w-full p-5'>
			<div className="flex items-center justify-between">
				<div className='flex gap-5 items-center'>
					<Avatar className='h-16 w-16 !rounded-lg'>
						<AvatarFallback className="bg-black text-slate-700 !rounded-lg text-3xl">
							👑
						</AvatarFallback>
					</Avatar>
					<div className='flex flex-col gap-2'>
						<p className='text-slate-700 text-lg'>
							{company}
						</p>
						<p className='text-slate-400 text-sm'>
							{id}
						</p>
					</div>
				</div>
				<EditRecord />
			</div>

			<Separator className='h-[1px] bg-slate-300 mt-5' />

			<div className="flex flex-col gap-3 mt-5">
				<RecordInfo icon={User2} recordType={'Representative'} info={representative} />
				<RecordInfo icon={Phone} recordType={'Contact'} info={contact} />
				<RecordInfo icon={Mail} recordType={'Email'} info={email} />
				<RecordInfo icon={MapPin} recordType={'Location'} info={location} />
				<RecordNotes notes={notes} />
			</div>

			<Separator className='h-[1px] bg-slate-300w mt-5' />

			<div className='mt-5'>

				{/* //TODO: reflect restock data based on selected supplier */}
				<SupplierRestock />
			</div>

		</div>
	)
}

export default SelectedSupplier