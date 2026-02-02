import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card component for content containers.
 * Renders a styled card container with border, background, and shadow.
 * Commonly used to group related content in a visually distinct container.
 * 
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div element props
 * @param {string} props.className - Additional CSS classes
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * CardHeader component for card headers.
 * Renders the header section of a card with vertical spacing for title and description.
 * 
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div element props
 * @param {string} props.className - Additional CSS classes
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * CardTitle component for card titles.
 * Renders the title heading within a card header.
 * 
 * @param {React.HTMLAttributes<HTMLHeadingElement>} props - Standard heading element props
 * @param {string} props.className - Additional CSS classes
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * CardDescription component for card descriptions.
 * Renders descriptive text within a card header.
 * 
 * @param {React.HTMLAttributes<HTMLParagraphElement>} props - Standard paragraph element props
 * @param {string} props.className - Additional CSS classes
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CardContent component for card body content.
 * Renders the main content area of a card with appropriate padding.
 * 
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div element props
 * @param {string} props.className - Additional CSS classes
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * CardFooter component for card footers.
 * Renders the footer section of a card, typically used for actions or additional information.
 * 
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div element props
 * @param {string} props.className - Additional CSS classes
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
