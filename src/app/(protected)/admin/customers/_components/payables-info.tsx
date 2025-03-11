import { ArrowUpRight, PhilippinePeso } from 'lucide-react';

interface PayablesInfoProps {
	sum: number | 0;
}

const PayablesInfo = ({ sum }: PayablesInfoProps) => {
	return (
		<div className="flex gap-5 bg-white/60 p-3 rounded-lg cursor-pointer group transition-all">
			<div className="p-2 rounded-lg h-12 w-12 flex items-center justify-center bg-emerald-200">
				<PhilippinePeso className="text-emerald-500 h-6 w-6" strokeWidth={1.5} />
			</div>
			<div className="flex flex-col gap-1">
				<p className="text-slate-600 text-left">{sum}</p>
				<div className="flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
					<p className="text-slate-400 text-sm tracking-wide">Amount in Payables</p>
					<ArrowUpRight className="h-4 w-4 text-slate-400" />
				</div>
			</div>
		</div>
	);
};

export default PayablesInfo;
