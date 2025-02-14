"use client"
import { FC, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarDaysIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Input } from '../common/input'
import { Button } from '../common/button'

export const HotelSearch: FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const params = new URLSearchParams(searchParams)

    params.set('name', formData.get('name') as string)
    params.set('checkIn', formData.get('checkIn') as string)
    params.set('checkOut', formData.get('checkOut') as string)

    router.push(`/hotels?${params.toString()}`)
  }

  const [startDate, endDate] = [
    searchParams.get('checkIn') ? new Date(searchParams.get('checkIn') as string) : null,
    searchParams.get('checkOut') ? new Date(searchParams.get('checkOut') as string) : null,
  ]

  const handleClearDates = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('checkIn')
    params.delete('checkOut')
    router.push(`/hotels?${params.toString()}`)
  }

  const datePickerCustomInput = ({ value, onClick }: any) => (
    <div
      onClick={onClick}
      className={`w-full h-[48px] px-5 pl-12 rounded-xl border transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[15px] cursor-pointer relative flex items-center ${
        isDatePickerOpen
          ? 'border-blue-500 outline outline-2 outline-blue-500 outline-offset-[-2px] bg-white dark:bg-gray-800'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
      }`}
    >
      <CalendarDaysIcon className="w-5 h-5 absolute left-4 text-gray-400" />
      <span className={value ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400 dark:text-gray-500'}>
        {value || 'Select dates'}
      </span>
      {value && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleClearDates()
          }}
          className="absolute right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  )

  const renderCustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: any) => (
    <div className="flex items-center justify-between px-2 py-2">
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        type="button"
        className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          prevMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h3>
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        type="button"
        className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          nextMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-4">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="relative md:col-span-3">
          <Input
            name="name"
            placeholder="Where are you going?"
            defaultValue={searchParams.get('name') || ''}
            className="pl-10 w-full h-[48px] text-[15px]"
          />
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        <div className="md:col-span-3">
          <input type="hidden" name="checkIn" value={startDate?.toISOString() || ''} />
          <input type="hidden" name="checkOut" value={endDate?.toISOString() || ''} />
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(dates) => {
              const [start, end] = dates
              const params = new URLSearchParams(searchParams)
              if (start) params.set('checkIn', start.toISOString())
              if (end) params.set('checkOut', end.toISOString())
              router.push(`/hotels?${params.toString()}`)
            }}
            minDate={new Date()}
            customInput={datePickerCustomInput({
              value:
                startDate && endDate
                  ? `${startDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })} - ${endDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}`
                  : '',
            })}
            renderCustomHeader={renderCustomHeader}
            wrapperClassName="w-full"
            monthsShown={2}
            showPopperArrow={false}
            calendarClassName="shadow-xl border-0 bg-white dark:bg-gray-800 rounded-xl [&_.react-datepicker__month-container]:mx-2 [&_.react-datepicker__month-container]:p-4 [&_.react-datepicker__header]:bg-white [&_.react-datepicker__header]:dark:bg-gray-800 [&_.react-datepicker__header]:border-0 [&_.react-datepicker__day-name]:text-gray-400 [&_.react-datepicker__day-name]:font-medium [&_.react-datepicker__day-name]:w-10 [&_.react-datepicker__day-name]:text-sm [&_.react-datepicker__day]:w-10 [&_.react-datepicker__day]:h-10 [&_.react-datepicker__day]:leading-10 [&_.react-datepicker__day]:text-sm [&_.react-datepicker__day]:font-normal [&_.react-datepicker__day]:m-0.5 hover:[&_.react-datepicker__day]:bg-gray-100 hover:[&_.react-datepicker__day]:dark:bg-gray-700 [&_.react-datepicker__day--selected]:bg-blue-600 [&_.react-datepicker__day--selected]:text-white [&_.react-datepicker__day--selected]:font-medium [&_.react-datepicker__day--in-range]:bg-blue-50 [&_.react-datepicker__day--in-range]:dark:bg-blue-900/50 [&_.react-datepicker__day--in-selecting-range]:bg-blue-50 [&_.react-datepicker__day--in-selecting-range]:dark:bg-blue-900/50 [&_.react-datepicker__day--keyboard-selected]:bg-blue-600 [&_.react-datepicker__day--today]:font-bold [&_.react-datepicker__day--in-range:hover]:bg-blue-100 [&_.react-datepicker__day--in-range:hover]:dark:bg-blue-900 [&_.react-datepicker__current-month]:hidden [&_.react-datepicker__day--range-start]:bg-blue-600 [&_.react-datepicker__day--range-start]:text-white [&_.react-datepicker__day--range-end]:bg-blue-600 [&_.react-datepicker__day--range-end]:text-white"
            onCalendarOpen={() => setIsDatePickerOpen(true)}
            onCalendarClose={() => setIsDatePickerOpen(false)}
          />
        </div>

        <div>
          <Button type="submit" className="w-full h-[48px] bg-blue-600 hover:bg-blue-700">
            Search
          </Button>
        </div>
      </div>
    </form>
  )
}
