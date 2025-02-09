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
import { hotelOptions } from './constants';
import { customSelectStyles } from './select-styles';
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

export function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
    onSearch({
      hotel: data.hotel,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
    });
  };

  const datePickerCustomInput = ({ value, onClick, placeholder }: any) => (
    <div
      onClick={onClick}
      className={`w-full h-[68px] px-5 pl-12 rounded-2xl border transition-all bg-white/80 text-gray-700 text-[15px] cursor-pointer relative flex items-center ${
        isDatePickerOpen
          ? 'border-blue-500 outline outline-2 outline-blue-500 outline-offset-[-2px] bg-white'
          : errors.checkIn || errors.checkOut
          ? 'border-rose-500 hover:border-rose-600'
          : 'border-gray-200 hover:border-blue-500 hover:bg-white'
      }`}
    >
      <CalendarDaysIcon className={`w-5 h-5 absolute left-4 ${errors.checkIn || errors.checkOut ? 'text-rose-500' : 'text-gray-400'}`} />
      <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
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
      className={`bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row gap-5 max-w-6xl mx-auto border border-white/20 ${className}`}
    >
      <div className="flex-[2] group">
        <label className="text-gray-700 font-medium text-sm block mb-2.5 ml-1">
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
                styles={{
                  ...customSelectStyles,
                  control: (base, state) => customSelectStyles.control(base, { ...state, hasError: !!errors.hotel }),
                }}
                components={{
                  Option: CustomOption,
                  SingleValue: CustomValue,
                  DropdownIndicator: null,
                  NoOptionsMessage,
                  LoadingMessage,
                  ClearIndicator,
                  Input: CustomInput,
                }}
                className="text-gray-700 text-[15px]"
                isSearchable={true}
                isClearable={true}
                instanceId="hotel-select"
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
        <label className="text-gray-700 font-medium text-sm block mb-2.5 ml-1">
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
                  calendarClassName="shadow-xl border-0 p-4"
                  onCalendarOpen={() => setIsDatePickerOpen(true)}
                  onCalendarClose={() => setIsDatePickerOpen(false)}
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
      `}</style>
    </form>
  );
}
