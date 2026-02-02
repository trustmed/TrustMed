import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Textarea component for multi-line text input.
 * Renders a styled textarea element with automatic content-based sizing, focus states, and validation styling.
 * Includes aria-invalid styling for form validation feedback.
 * 
 * @param {React.ComponentProps<"textarea">} props - Standard textarea element props
 * @param {string} props.className - Additional CSS classes
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
