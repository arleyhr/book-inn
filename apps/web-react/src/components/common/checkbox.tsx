import { FC, InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox: FC<CheckboxProps> = ({
  className = '',
  onCheckedChange,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    onCheckedChange?.(e.target.checked)
  }

  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 text-blue-600
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      onChange={handleChange}
      {...props}
    />
  )
}
