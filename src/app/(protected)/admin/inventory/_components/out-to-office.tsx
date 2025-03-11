import { PopoverClose } from '@radix-ui/react-popover'
import { Send } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

interface OutToOfficeProps {
	isEditing: boolean;
}

const OutToOffice = ({ isEditing } : OutToOfficeProps) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="bg-red hover:bg-red/80" disabled={isEditing}>
					<Send />
					Out to Office
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="shadow-none"
				popoverTarget=""
			>
				<p className="font-medium text-slate-700">
					Out to Office
				</p>
				<div className="mt-4">
					<Label className="text-slate-400">Enter your password to confirm</Label>
					<Input
						className="w-full bg-slate-100 text-slate-700 shadow-none focus:outline focus:outline-2 focus:outline-slate-200"
						placeholder="Password"
					/>
				</div>
				<div className="mt-4 flex w-full gap-2">
					<PopoverClose asChild>
						<Button className="w-1/2 bg-slate-200 text-slate-700 hover:bg-slate-300">
							Cancel
						</Button>
					</PopoverClose>
					<Button className="w-1/2 bg-rose-100 text-red hover:bg-rose-200">
						Out to Office
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}

export default OutToOffice