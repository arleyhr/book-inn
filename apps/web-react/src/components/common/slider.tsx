import { FC, useEffect, useRef, useState } from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  defaultValue?: [number, number]
  value?: [number, number]
  onValueChange?: (value: [number, number]) => void
  onValueChangeEnd?: (value: [number, number]) => void
  className?: string
}

export const Slider: FC<SliderProps> = ({
  min,
  max,
  step = 1,
  defaultValue,
  value,
  onValueChange,
  onValueChangeEnd,
  className = ''
}) => {
  const [internalValues, setInternalValues] = useState<[number, number]>(defaultValue || [min, max])
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const values = value || internalValues

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100
  }

  const handleMouseDown = (handle: 'min' | 'max') => {
    setDragging(handle)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const newValue = Math.round((percentage * (max - min)) / 100 + min)

    const newValues: [number, number] = [...values]
    if (dragging === 'min') {
      newValues[0] = Math.min(newValue, values[1] - step)
    } else {
      newValues[1] = Math.max(newValue, values[0] + step)
    }

    if (!value) {
      setInternalValues(newValues)
    }
    onValueChange?.(newValues)
  }

  const handleMouseUp = () => {
    if (dragging) {
      onValueChangeEnd?.(values)
      setDragging(null)
    }
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, values])

  return (
    <div
      ref={sliderRef}
      className={`relative h-2 bg-gray-200 rounded-full ${className}`}
    >
      <div
        className="absolute h-full bg-blue-500 rounded-full"
        style={{
          left: `${getPercentage(values[0])}%`,
          right: `${100 - getPercentage(values[1])}%`
        }}
      />
      <button
        type="button"
        className={`absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white border-2
          border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${dragging === 'min' ? 'z-30' : 'z-20'}`}
        style={{ left: `${getPercentage(values[0])}%` }}
        onMouseDown={() => handleMouseDown('min')}
      />
      <button
        type="button"
        className={`absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white border-2
          border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${dragging === 'max' ? 'z-30' : 'z-20'}`}
        style={{ left: `${getPercentage(values[1])}%` }}
        onMouseDown={() => handleMouseDown('max')}
      />
    </div>
  )
}
