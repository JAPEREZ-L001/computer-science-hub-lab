import type { SVGProps } from "react"

export function CshDeltaMark({
  className,
  "aria-label": ariaLabel = "CSH",
  ...props
}: SVGProps<SVGSVGElement> & { "aria-label"?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 227"
      aria-label={ariaLabel}
      className={className}
      style={{ isolation: "isolate" as const }}
      {...props}
    >
      <path
        d="m248 217-12.62-21.76h-188.7l80.63-140.7 74.82 129.4h26.5l-101.3-175.7-119.9 208.8h240.6z"
        fill="currentColor"
      />
    </svg>
  )
}
