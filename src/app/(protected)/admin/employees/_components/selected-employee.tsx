import { IdCard, Mail, MapPin, Phone } from 'lucide-react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Separator } from '~/components/ui/separator';
import RecordInfo from '../../_components/record-info';
import RecordNotes from '../../_components/record-notes';
import AccountRecovery from './account-recovery';
import EditRecord from './edit-record';
import EmployeeActivity from './employee-activity';

type SelectedEmployeeProps = {
	id: string;
	name: string | undefined | null;
	contact?: string | undefined | null;
	email?: string | undefined | null;
	location?: string | undefined | null;
	notes?: string | undefined | null;
	activityData?: any;
}

const SelectedEmployee = ({
	id,
	name,
	contact,
	email,
	location,
	notes,
	activityData,
}: SelectedEmployeeProps) => {
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
						<div className='flex items-center gap-3'>
							<p className='text-slate-700 text-lg'>
								{name}
							</p>
							{/* //TODO: reflect admin status */}
							<p className='bg-emerald-200 text-emerald-700 rounded-full px-2 py-[3px] text-sm tracking-wide'>
								admin
							</p>
						</div>
						<p className='text-slate-400 text-sm'>
							{id}
						</p>
					</div>
				</div>
				<EditRecord />
			</div>

			<Separator className='h-[1px] bg-slate-300 mt-5' />

			<div className="flex flex-col gap-3 mt-5">
				<RecordInfo icon={IdCard} recordType={'Position'} info={'Manager'}
				//TODO: reflect position data
				/>
				<RecordInfo icon={Phone} recordType={'Contact'} info={contact} />
				<RecordInfo icon={Mail} recordType={'Email'} info={email} />
				<RecordInfo icon={MapPin} recordType={'Location'} info={location} />
				<RecordNotes notes={notes} />
				<AccountRecovery />
			</div>

			<Separator className='h-[1px] bg-slate-300 mt-5' />

			<div className='mt-5'>

				{/* //TODO: reflect restock data based on selected supplier */}
				<EmployeeActivity />
			</div>
		</div>
	)
}

export default SelectedEmployee