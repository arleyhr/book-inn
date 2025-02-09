import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { components } from 'react-select';
import { Hotel } from './types';

export const SearchBarIcon = ({ hasError }: { hasError?: boolean }) => (
  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
    <MagnifyingGlassIcon className={`h-5 w-5 ${hasError ? 'text-red-500' : 'text-gray-400'}`} />
  </div>
);

export const CustomInput = (props: any) => {
  const { selectProps, ...rest } = props;
  return (
    <components.Input
      {...rest}
      aria-activedescendant={rest['aria-activedescendant'] || undefined}
    />
  );
};

export const NoOptionsMessage = (props: any) => (
  <components.NoOptionsMessage {...props}>
    <div className="text-gray-500 px-4 py-3 text-sm">No hotels found</div>
  </components.NoOptionsMessage>
);

export const LoadingMessage = (props: any) => (
  <components.LoadingMessage {...props}>
    <div className="text-gray-500 px-4 py-3 text-sm flex items-center gap-2">
      <ArrowPathIcon
        className="animate-spin h-4 w-4 text-blue-500"
      />
      Searching hotels...
    </div>
  </components.LoadingMessage>
);

export const CustomOption = ({ innerProps, label, data, isSelected }: any) => (
  <div
    {...innerProps}
    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
  >
    <div className="flex items-center gap-3">
      <img
        src={data.image}
        alt={label}
        className="w-12 h-12 rounded-xl object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-500 truncate">{data.description}</div>
      </div>
      {isSelected && (
        <div className="text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  </div>
);

export const CustomValue = ({ data }: { data: Hotel }) => (
  <div className="flex items-center gap-3 h-full pr-9">
    <img
      src={data.image}
      alt={data.label}
      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <div className="font-medium text-gray-900 leading-tight truncate">
        {data.label}
      </div>
      <div className="text-sm text-gray-500 truncate leading-tight">
        {data.description}
      </div>
    </div>
  </div>
);

export const ClearIndicator = (props: any) => {
  const {
    innerProps: { ref, ...restInnerProps },
  } = props;
  return (
    <div
      {...restInnerProps}
      ref={ref}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1.5 hover:bg-gray-100 rounded-full"
    >
      <XMarkIcon className="h-4 w-4" />
    </div>
  );
};
