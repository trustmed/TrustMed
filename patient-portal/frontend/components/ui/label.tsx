"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * Label component for form field labels.
 * Renders an accessible label element using Radix UI primitive with disabled and peer states support.
 * Automatically handles disabled state styling and cursor behavior.
 * 
 * @param {React.ComponentProps<typeof LabelPrimitive.Root>} props - Label props from Radix UI
 * @param {string} props.className - Additional CSS classes
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
