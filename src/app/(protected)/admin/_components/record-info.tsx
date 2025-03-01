import { LucideIcon } from 'lucide-react';

interface RecordInfoProps {
	icon: LucideIcon;
	recordType: string;
	info: string | undefined | null;

}

const RecordInfo = ({ recordType, info, icon: Icon }: RecordInfoProps) => {
	const displayInfo =
		info ||
		`No ${recordType.toLowerCase()} available...`;

	return (
		<div className="flex gap-5 bg-white/60 p-3 rounded-lg">
			<div className="p-2 rounded-lg h-12 w-12 flex items-center justify-center bg-slate-200">
				<Icon className="text-slate-400 h-6 w-6" strokeWidth={1.5} />
			</div>
			<div className="flex flex-col gap-1">
				<p
					className={info ? "text-slate-600" : "text-slate-300"}
					style={recordType === "Location" || recordType === "Representative" ? { whiteSpace: "pre-wrap" } : undefined}
				>
					{displayInfo}
				</p>
				<p className="text-slate-400 text-sm tracking-wide">{recordType}</p>
			</div>
		</div>
	);
};

export default RecordInfo