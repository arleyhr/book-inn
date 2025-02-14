import { FC, ReactNode, useState } from 'react'
import DatePicker from 'react-datepicker'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import 'react-datepicker/dist/react-datepicker.css'

interface DateRangePickerProps {
  startName: string
  endName: string
  startDate?: string | null
  endDate?: string | null
  className?: string
  icon?: ReactNode
  onDateChange?: (dates: { startDate: Date | null; endDate: Date | null }) => void
}

export const DateRangePicker: FC<DateRangePickerProps> = ({
  startName,
  endName,
  startDate,
  endDate,
  className = '',
  icon,
  onDateChange
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedStartDate, selectedEndDate] = [
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  ]

  const datePickerCustomInput = ({ value, onClick }: any) => (
    <div
      onClick={onClick}
      className={`w-full h-[48px] px-5 pl-12 rounded-xl border transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-[15px] cursor-pointer relative flex items-center ${
        isDatePickerOpen
          ? 'border-blue-500 dark:border-blue-400 outline outline-2 outline-blue-500 dark:outline-blue-400 outline-offset-[-2px] bg-white dark:bg-gray-800'
          : 'border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
      }`}
    >
      <CalendarDaysIcon className="w-5 h-5 absolute left-4 text-gray-400 dark:text-gray-500" />
      <span className={value ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400 dark:text-gray-500'}>
        {value || 'Select dates'}
      </span>
    </div>
  )

  return (
    <div className={`flex gap-4 ${className}`}>
      <input type="hidden" name={startName} value={selectedStartDate?.toISOString() || ''} />
      <input type="hidden" name={endName} value={selectedEndDate?.toISOString() || ''} />
      <DatePicker
        selectsRange={true}
        startDate={selectedStartDate}
        endDate={selectedEndDate}
        onChange={(dates) => {
          const [start, end] = dates
          if (onDateChange) {
            onDateChange({ startDate: start, endDate: end })
          }
        }}
        minDate={new Date()}
        customInput={datePickerCustomInput({
          value:
            selectedStartDate && selectedEndDate
              ? `${selectedStartDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })} - ${selectedEndDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}`
              : '',
        })}
        wrapperClassName="w-full"
        monthsShown={2}
        showPopperArrow={false}
        calendarClassName="shadow-xl border-0 bg-white dark:bg-gray-800 rounded-xl [&_.react-datepicker__month-container]:mx-2 [&_.react-datepicker__month-container]:p-4 [&_.react-datepicker__header]:bg-white [&_.react-datepicker__header]:dark:bg-gray-800 [&_.react-datepicker__header]:border-0 [&_.react-datepicker__day-name]:text-gray-400 [&_.react-datepicker__day-name]:dark:text-gray-500 [&_.react-datepicker__day-name]:font-medium [&_.react-datepicker__day-name]:w-10 [&_.react-datepicker__day-name]:text-sm [&_.react-datepicker__day]:w-10 [&_.react-datepicker__day]:h-10 [&_.react-datepicker__day]:leading-10 [&_.react-datepicker__day]:text-sm [&_.react-datepicker__day]:font-normal [&_.react-datepicker__day]:m-0.5 [&_.react-datepicker__day]:dark:text-gray-300 hover:[&_.react-datepicker__day]:bg-gray-100 hover:[&_.react-datepicker__day]:dark:bg-gray-700 [&_.react-datepicker__day--selected]:bg-blue-600 [&_.react-datepicker__day--selected]:dark:bg-blue-500 [&_.react-datepicker__day--selected]:text-white [&_.react-datepicker__day--selected]:font-medium [&_.react-datepicker__day--in-range]:bg-blue-50 [&_.react-datepicker__day--in-range]:dark:bg-blue-900/50 [&_.react-datepicker__day--in-selecting-range]:bg-blue-50 [&_.react-datepicker__day--in-selecting-range]:dark:bg-blue-900/50 [&_.react-datepicker__day--keyboard-selected]:bg-blue-600 [&_.react-datepicker__day--keyboard-selected]:dark:bg-blue-500 [&_.react-datepicker__day--today]:font-bold [&_.react-datepicker__day--in-range:hover]:bg-blue-100 [&_.react-datepicker__day--in-range:hover]:dark:bg-blue-900 [&_.react-datepicker__current-month]:hidden [&_.react-datepicker__day--range-start]:bg-blue-600 [&_.react-datepicker__day--range-start]:dark:bg-blue-500 [&_.react-datepicker__day--range-start]:text-white [&_.react-datepicker__day--range-end]:bg-blue-600 [&_.react-datepicker__day--range-end]:dark:bg-blue-500 [&_.react-datepicker__day--range-end]:text-white"
        onCalendarOpen={() => setIsDatePickerOpen(true)}
        onCalendarClose={() => setIsDatePickerOpen(false)}
      />
    </div>
  )
}
