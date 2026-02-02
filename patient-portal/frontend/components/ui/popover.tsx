"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * Popover root component using Radix UI primitive.
 * Base component for creating popover overlays.
 */
const Popover = PopoverPrimitive.Root

/**
 * PopoverTrigger component for triggering popover display.
 * Element that triggers the popover to open when interacted with.
 */
const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * PopoverContent component for popover content container.
 * Renders the popover content with animations, positioning, and portal rendering.
 * Opens with fade-in and zoom animations from the trigger side.
 * 
 * @param {string} align - Horizontal alignment (center, start, end)
 * @param {number} sideOffset - Distance from the trigger
 * @param {string} className - Additional CSS classes
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
