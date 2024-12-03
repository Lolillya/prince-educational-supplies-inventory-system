"use client";

import * as React from "react";
import { cn } from "~/lib/utils"; // Replace with your class merging utility like clsx or classnames.

const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary",
      className,
    )}
    role="status"
    {...props}
  >
    <span className="sr-only">Loading...</span>
  </div>
));

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
