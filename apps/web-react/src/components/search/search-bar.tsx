'use client';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import 'react-datepicker/dist/react-datepicker.css';
import './search-bar.css';

import { SearchBarProps, SearchFormData, searchFormSchema, SearchParams } from './types';
import { getHotelImageUrl } from '../../lib/images';
import { useHotelSearch } from '../../hooks/use-hotel-search';
import {
  SearchBarIcon,
  NoOptionsMessage,
  LoadingMessage,
  CustomOption,
  CustomValue,
  ClearIndicator,
  CustomInput,
} from './select-components';

export type { SearchParams };

const getCustomSelectStyles = (errors: any) => ({
  control: (base: any, state: any) => ({
    ...base,
    minHeight: '68px',
    backgroundColor: state.isFocused ? 'rgb(255 255 255)' : 'rgb(249 250 251)',
    borderColor: errors?.hotel
      ? 'rgb(239 68 68)'
      : state.isFocused
        ? 'rgb(96 165 250)'
        : 'rgb(229 231 235)',
    '.dark &': {
      backgroundColor: state.isFocused ? 'rgb(31 41 55)' : 'rgb(31 41 55 / 0.8)',
      borderColor: errors?.hotel
        ? 'rgb(239 68 68)'
        : state.isFocused
          ? 'rgb(96 165 250)'
          : 'rgb(55 65 81)',
    },
    borderRadius: '1rem',
    borderWidth: '1px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: errors?.hotel
        ? 'rgb(239 68 68)'
        : 'rgb(96 165 500)',
      backgroundColor: 'rgb(255 255 255)',
      '.dark &': {
        backgroundColor: 'rgb(31 41 55)',
      },
    },
    paddingLeft: '3rem',
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'rgb(255 255 255)',
    borderRadius: '1rem',
    overflow: 'hidden',
    border: '1px solid rgb(229 231 235)',
    '.dark &': {
      backgroundColor: 'rgb(31 41 55)',
      border: '1px solid rgb(55 65 81)',
    },
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    animation: 'selectMenuAppear 0.2s ease-out',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused
      ? 'rgb(243 244 246)'
      : 'transparent',
    color: 'rgb(17 24 39)',
    '.dark &': {
      backgroundColor: state.isFocused
        ? 'rgb(55 65 81)'
        : 'transparent',
      color: 'rgb(229 231 235)',
    },
    cursor: 'pointer',
    ':active': {
      backgroundColor: 'rgb(229 231 235)',
      '.dark &': {
        backgroundColor: 'rgb(75 85 99)',
      },
    },
  }),
  input: (base: any) => ({
    ...base,
    color: 'rgb(17 24 39)',
    '.dark &': {
      color: 'rgb(229 231 235)',
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'rgb(17 24 39)',
    '.dark &': {
      color: 'rgb(229 231 235)',
    },
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'rgb(156 163 175)',
  }),
});

export function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { searchInput, isLoading, hotels, setSearchInput } = useHotelSearch('limit=5');

  const hotelOptions = hotels?.map(hotel => ({
    value: hotel.id.toString(),
    label: hotel.name,
    description: `${hotel.city}, ${hotel.country}`,
    image: getHotelImageUrl(hotel.placeId, hotel.images[0]),
  })) || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      hotel: '',
      checkIn: '',
      checkOut: '',
    },
  });

  const onSubmit = (data: SearchFormData) => {
    const selectedHotel = hotels?.find(h => h.id.toString() === data.hotel.toString());

    onSearch({
      hotel: selectedHotel?.id.toString() || '',
      checkIn: data.checkIn,
      checkOut: data.checkOut,
    });
  };

  const datePickerCustomInput = ({ value, onClick, placeholder }: any) => (
    <div
      onClick={onClick}
      className={`w-full h-[68px] px-5 pl-12 rounded-2xl border transition-all bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-200 text-[15px] cursor-pointer relative flex items-center ${
        isDatePickerOpen
          ? 'border-blue-400 outline outline-2 outline-blue-400 outline-offset-[-2px] bg-white dark:bg-gray-800'
          : errors.checkIn || errors.checkOut
          ? 'border-rose-500 hover:border-rose-600'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-white dark:hover:bg-gray-800'
      }`}
    >
      <CalendarDaysIcon className={`w-5 h-5 absolute left-4 ${errors.checkIn || errors.checkOut ? 'text-rose-500' : 'text-gray-400'}`} />
      <span className={value ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-400'}>
        {value || placeholder}
      </span>
      {(errors.checkIn || errors.checkOut) && (
        <span className="absolute -bottom-5 left-0 text-rose-500 text-sm">
          {errors.checkIn?.message || errors.checkOut?.message}
        </span>
      )}
    </div>
  );

  const [startDate, endDate] = [watch('checkIn'), watch('checkOut')].map(
    (date) => (date ? new Date(date) : null),
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`bg-white dark:bg-gray-900/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row gap-5 max-w-6xl mx-auto border border-gray-200 dark:border-gray-800/50 ${className}`}
    >
      <div className="flex-[2] group">
        <label className="text-gray-700 dark:text-gray-300 font-medium text-sm block mb-2.5 ml-1">
          Where to?
        </label>
        <div className="relative">
          <SearchBarIcon hasError={!!errors.hotel} />
          <Controller
            name="hotel"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Select
                options={hotelOptions}
                placeholder="Search hotels..."
                onChange={(option) => onChange(option?.value || '')}
                value={hotelOptions.find((option) => option.value === value)}
                styles={getCustomSelectStyles(errors)}
                components={{
                  Option: CustomOption,
                  SingleValue: CustomValue,
                  DropdownIndicator: null,
                  NoOptionsMessage,
                  LoadingMessage,
                  ClearIndicator,
                  Input: CustomInput,
                }}
                onInputChange={(newValue: string) => setSearchInput(newValue)}
                className="text-gray-900 dark:text-gray-200 text-[15px]"
                isSearchable={true}
                isClearable={true}
                isLoading={isLoading}
                instanceId="hotel-select"
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length > 0 ? "No hotels found" : "Type to search hotels"
                }
              />
            )}
          />
          {errors.hotel && (
            <span className="absolute -bottom-5 left-0 text-rose-500 text-sm">
              {errors.hotel.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex-[1.5] group">
        <label className="text-gray-700 dark:text-gray-300 font-medium text-sm block mb-2.5 ml-1">
          When?
        </label>
        <Controller
          name="checkIn"
          control={control}
          render={({ field: { onChange } }) => (
            <Controller
              name="checkOut"
              control={control}
              render={({ field: { onChange: onChangeCheckOut } }) => (
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(dates) => {
                    const [start, end] = dates;
                    onChange(start?.toISOString() || '');
                    onChangeCheckOut(end?.toISOString() || '');
                  }}
                  minDate={new Date()}
                  placeholderText="Select dates"
                  customInput={datePickerCustomInput({
                    placeholder: 'Select dates',
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
                  wrapperClassName="w-full"
                  monthsShown={2}
                  showPopperArrow={false}
                  calendarClassName="shadow-xl border-0 bg-white dark:bg-gray-800 rounded-xl [&_.react-datepicker__month-container]:mx-2 [&_.react-datepicker__month-container]:p-4 [&_.react-datepicker__header]:bg-white dark:[&_.react-datepicker__header]:bg-gray-800 [&_.react-datepicker__header]:border-0 [&_.react-datepicker__day-name]:text-gray-400 [&_.react-datepicker__day-name]:font-medium [&_.react-datepicker__day-name]:w-10 [&_.react-datepicker__day-name]:text-sm [&_.react-datepicker__day]:w-10 [&_.react-datepicker__day]:h-10 [&_.react-datepicker__day]:leading-10 [&_.react-datepicker__day]:text-sm [&_.react-datepicker__day]:font-normal [&_.react-datepicker__day]:m-0.5 [&_.react-datepicker__day]:text-gray-600 dark:[&_.react-datepicker__day]:text-gray-200 hover:[&_.react-datepicker__day]:bg-gray-100 dark:hover:[&_.react-datepicker__day]:bg-gray-700 [&_.react-datepicker__day--selected]:bg-blue-600 [&_.react-datepicker__day--selected]:text-white [&_.react-datepicker__day--selected]:font-medium [&_.react-datepicker__day--in-range]:bg-blue-100 dark:[&_.react-datepicker__day--in-range]:bg-blue-900/50 [&_.react-datepicker__day--in-selecting-range]:bg-blue-100 dark:[&_.react-datepicker__day--in-selecting-range]:bg-blue-900/50 [&_.react-datepicker__day--keyboard-selected]:bg-blue-600 [&_.react-datepicker__day--today]:font-bold [&_.react-datepicker__day--in-range:hover]:bg-blue-200 dark:[&_.react-datepicker__day--in-range:hover]:bg-blue-800 [&_.react-datepicker__current-month]:hidden [&_.react-datepicker__day--range-start]:bg-blue-600 [&_.react-datepicker__day--range-start]:text-white [&_.react-datepicker__day--range-end]:bg-blue-600 [&_.react-datepicker__day--range-end]:text-white"
                  onCalendarOpen={() => setIsDatePickerOpen(true)}
                  onCalendarClose={() => setIsDatePickerOpen(false)}
                  popperClassName="!w-fit"
                  popperPlacement="bottom"
                />
              )}
            />
          )}
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-5 rounded-2xl w-full md:w-[68px] h-[68px] flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          <RocketLaunchIcon className="h-6 w-6" />
        </button>
      </div>
      <style jsx global>{`
        @keyframes selectMenuAppear {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .react-datepicker-popper {
          z-index: 40 !important;
          position: absolute !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          top: 100% !important;
          margin-top: 4px !important;
        }

        .react-datepicker-wrapper {
          width: 100%;
        }

        .react-datepicker {
          font-family: inherit;
          border: none;
          background-color: rgb(255, 255, 255);
          box-shadow: 0 10px 40px -5px rgba(0,0,0,0.15);
          border-radius: 16px;
          overflow: hidden;
          width: fit-content;
          display: flex !important;
        }

        .dark .react-datepicker {
          background-color: rgb(31, 41, 55);
          box-shadow: 0 10px 40px -5px rgba(0,0,0,0.3);
        }

        .react-datepicker__month-container {
          float: none;
          padding: 1rem;
        }

        @media (max-width: 768px) {
          .react-datepicker-popper {
            position: fixed !important;
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
            margin: 0;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.7);
          }

          .react-datepicker {
            margin: 0 auto;
            border-radius: 16px;
          }
        }
      `}</style>
    </form>
  );
}
