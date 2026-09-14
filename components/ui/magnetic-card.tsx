"use client"

import * as React from "react"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface MagneticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string
}

const MagneticCard = React.forwardRef<HTMLDivElement, MagneticCardProps>(({
  className,
  children,
  glowColor = "rgba(74, 222, 128, 0.15)", // Default glow (emerald-400 slightly transparent)
  ...props
}, ref) => {
  const localRef = useRef<HTMLDivElement>(null)
  
  // Combine forwarded ref and local ref
  const divRef = (node: HTMLDivElement) => {
    // local ref
    (localRef as React.MutableRefObject<HTMLDivElement | null>).current = node
    // forwarded ref
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!localRef.current || isFocused) return

    const div = localRef.current
    const rect = div.getBoundingClientRect()

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setIsFocused(true)
    setOpacity(1)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md transition-colors duration-300",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
})
MagneticCard.displayName = "MagneticCard"

export { MagneticCard }
