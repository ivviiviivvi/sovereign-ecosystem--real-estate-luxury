import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-background/50 border-input flex h-11 w-full min-w-0 rounded-2xl border border-border/50 backdrop-blur-sm px-4 py-2 text-base shadow-sm transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-light disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-light",
        "focus-visible:border-rose-blush focus-visible:ring-rose-blush/20 focus-visible:ring-[3px] focus-visible:shadow-lg focus-visible:shadow-rose-blush/10",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
