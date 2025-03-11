import EmojiPicker, {
  EmojiStyle,
  SuggestionMode,
} from "emoji-picker-react"; // ✅ Import SuggestionMode
import { useState } from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface EmojiPopoverProps {
  isEditing: boolean;
}

const EmojiPopover = ({ isEditing }: EmojiPopoverProps) => {
  const [emoji, setEmoji] = useState({ emoji: "👑" });

  return (
    <div>
      <Popover>
        <PopoverTrigger disabled={!isEditing}>
          <Avatar className="h-16 w-16 !rounded-lg">
            <AvatarFallback className="!rounded-lg bg-black text-3xl text-slate-700 transition-all duration-300 hover:text-4xl">
              {emoji.emoji}
            </AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className="w-auto border-none p-0 shadow-none">
          <EmojiPicker
            emojiStyle={EmojiStyle.NATIVE}
            skinTonesDisabled
            suggestedEmojisMode={SuggestionMode.RECENT}
            previewConfig={{ showPreview: false }}
            onEmojiClick={(e) => {
              setEmoji(e);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPopover;
