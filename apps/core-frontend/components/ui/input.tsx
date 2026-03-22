import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-neutral-900 dark:file:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 selection:bg-indigo-500/30 selection:text-indigo-900 border-neutral-200 dark:border-neutral-800 h-10 w-full min-w-0 rounded-lg border bg-white dark:bg-neutral-900 px-3.5 py-2 text-[15px] shadow-sm transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 focus-visible:ring-[4px]",
        "hover:border-neutral-300 dark:hover:border-neutral-700",
        "aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
