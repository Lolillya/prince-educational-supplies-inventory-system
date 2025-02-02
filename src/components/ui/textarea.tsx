import * as React from "react";

import { cn } from "~/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-gray px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground placeholder:text-textGray disabled:cursor-default disabled:bg-slate-50 disabled:opacity-100 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
