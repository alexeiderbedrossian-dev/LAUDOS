import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-line bg-paper px-3 text-base text-ink shadow-sm",
        "placeholder:text-faint",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35 focus-visible:border-teal",
        "disabled:opacity-50 tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-line bg-paper px-3 py-2 text-base text-ink shadow-sm",
        "placeholder:text-faint",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/35 focus-visible:border-teal",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("block text-xs font-medium tracking-wide text-muted mb-1.5", className)}
      {...props}
    />
  );
}
