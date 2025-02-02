import EmojiPicker, { Emoji } from 'emoji-picker-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

interface EmojiPopoverProps {
	isEditing: boolean;
}

const EmojiPopover = ({ isEditing } : EmojiPopoverProps) => {
	const [emoji, setEmoji] = useState({ emoji: '👑' });

	return (
		<div>
			<Popover>
				<PopoverTrigger disabled={!isEditing}>
					<Avatar className='h-16 w-16 !rounded-lg'>
						<AvatarFallback className='bg-black text-slate-700 !rounded-lg text-3xl hover:text-4xl transition-all duration-300'>
							{emoji.emoji}
						</AvatarFallback>
					</Avatar>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0 shadow-none border-none'>
					<EmojiPicker
						emojiStyle='native'
						skinTonesDisabled
						suggestedEmojisMode='recent'
						previewConfig={{ showPreview: false }}
						onEmojiClick={(e) => {
							setEmoji(e)
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default EmojiPopover;