import { useId } from "react";

import { cn } from "@/lib/utils";

interface DotPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  [key: string]: unknown;
}

/**
 * DotPattern component for decorative dot pattern backgrounds.
 * Renders an SVG pattern of evenly spaced dots that can be used as a background.
 * Customizable dot size, spacing, and positioning.
 * 
 * @param {DotPatternProps} props - Component props
 * @param {number} props.width - Pattern width (default: 16)
 * @param {number} props.height - Pattern height (default: 16)
 * @param {number} props.x - Pattern X offset (default: 0)
 * @param {number} props.y - Pattern Y offset (default: 0)
 * @param {number} props.cx - Dot center X position (default: 1)
 * @param {number} props.cy - Dot center Y position (default: 1)
 * @param {number} props.cr - Dot radius (default: 1)
 * @param {string} props.className - Additional CSS classes
 */
function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}

export { DotPattern };
