"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Accordion root component using Radix UI primitive.
 * Base component for creating collapsible content sections.
 */
const Accordion = AccordionPrimitive.Root

/**
 * AccordionItem component for individual accordion sections.
 * Renders a single collapsible item within an accordion with a bottom border.
 * 
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>} props - Accordion item props from Radix UI
 * @param {string} props.className - Additional CSS classes
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

/**
 * AccordionTrigger component for accordion headers.
 * Renders a clickable trigger that expands/collapses accordion content.
 * Includes a chevron icon that rotates when expanded.
 * 
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>} props - Accordion trigger props from Radix UI
 * @param {string} props.className - Additional CSS classes
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

/**
 * AccordionContent component for collapsible content.
 * Renders the expandable/collapsible content section of an accordion item
 * with smooth slide-down/up animations.
 * 
 * @param {React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>} props - Accordion content props from Radix UI
 * @param {string} props.className - Additional CSS classes
 */
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
