import { Mail, MapPin, Phone, User2 } from 'lucide-react'
import React from 'react'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Separator } from '~/components/ui/separator'
import Edit from '../../_components/edit'
import RecordInfo from '../../_components/record-info'
import RecordNotes from '../../_components/record-notes'
import SupplierRestock from './supplier-restock'
import { useRouter } from 'next/navigation'

type SelectedSupplierProps = {
	id: string;
	role_Id: number;
	emoji: string;
	company: string | undefined | null;
	representative?: string | undefined | null;
	contact?: string | undefined | null;
	email?: string | undefined | null;
	location?: string | undefined | null;
	notes?: string | undefined | null;
	restockData?: {
		restocks: any[];
	};
	clerkId: string;
}

const SelectedSupplier = ({
	id,
	role_Id,
	emoji,
	company,
	representative,
	contact,
	email,
	location,
	notes,
	restockData,
	clerkId,
}: SelectedSupplierProps) => {
	const router = useRouter();

	const handleEditSupplier = (e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/admin/suppliers/edit-supplier/${id}`);
	};

	return (
		<div className='flex flex-col w-full p-5'>
			<div className="flex items-center justify-between">
				<div className='flex gap-5 items-center'>
					<Avatar className='h-16 w-16 !rounded-lg'>
						<AvatarFallback className="bg-black text-slate-700 !rounded-lg text-3xl">
							{emoji}
						</AvatarFallback>
					</Avatar>
					<div className='flex flex-col gap-2'>
						<div className="flex items-center gap-2">
							<p className='text-slate-700 text-lg'>
								{company}
							</p>
							{role_Id === 4 && (
								<p className="rounded-full px-2 py-[3px] text-sm tracking-wide bg-cyan-200 text-cyan-700">
									Supplier
								</p>
							)}
						</div>
						<p className='text-slate-400 text-sm'>
							{id}
						</p>
					</div>
				</div>
				<div onClick={handleEditSupplier} className="cursor-pointer">
					<Edit/>
				</div>
			</div>


			<Separator className='h-[1px] bg-slate-300 mt-5'/>

			<div className="flex flex-col gap-3 mt-5">
				<RecordInfo icon={User2} recordType={'Representative'} info={representative}/>
				<RecordInfo icon={Phone} recordType={'Contact'} info={contact}/>
				<RecordInfo icon={Mail} recordType={'Email'} info={email}/>
				<RecordInfo icon={MapPin} recordType={'Location'} info={location}/>
				<RecordNotes notes={notes}/>
			</div>

			<Separator className='h-[1px] bg-slate-300w mt-5'/>

			<div className='mt-5'>

				{/* //TODO: reflect restock data based on selected supplier */}
				<SupplierRestock
					restockData={restockData?.restocks}
					clerkId={clerkId}
				/>
			</div>

		</div>
	)
}

export default SelectedSupplier