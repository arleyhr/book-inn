import { HTMLAttributes, forwardRef } from 'react'

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal'
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className = '', orientation = 'vertical', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative overflow-auto ${
          orientation === 'vertical' ? 'overflow-y-auto' : 'overflow-x-auto'
        } ${className}`}
        {...props}
      />
    )
  }
)

ScrollArea.displayName = 'ScrollArea'
