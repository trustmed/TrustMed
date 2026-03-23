import { DottedSurface } from "@/components/ui/dotted-surface";
import { cn } from "@/lib/utils";

export default function Bottom() {
  return (
    <div className="relative w-full h-[300px] overflow-hidden">
      <DottedSurface className="size-full" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          aria-hidden="true"
          className={cn(
            "absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full",
            "bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.1),transparent_50%)]",
            "blur-[30px]",
          )}
        />
      </div>
    </div>
  );
}
