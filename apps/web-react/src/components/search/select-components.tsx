import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { components } from 'react-select';
import { Hotel } from './types';

export const SearchBarIcon = ({ hasError }: { hasError: boolean }) => (
  <MagnifyingGlassIcon
    className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 ${
      hasError ? 'text-rose-500' : 'text-gray-700 dark:text-gray-400'
    }`}
  />
);

export const CustomInput = (props: any) => {
  const { selectProps, ...rest } = props;
  return (
    <components.Input
      {...rest}
      className="text-gray-200"
      aria-activedescendant={rest['aria-activedescendant'] || undefined}
    />
  );
};

export const NoOptionsMessage = (props: any) => (
  <components.NoOptionsMessage {...props}>
    <div className="px-4 py-2 text-sm text-gray-400">{props.children}</div>
  </components.NoOptionsMessage>
);

export const LoadingMessage = (props: any) => (
  <components.LoadingMessage {...props}>
    <div className="px-4 py-2 text-sm text-gray-400">Searching hotels...</div>
  </components.LoadingMessage>
);

export const CustomOption = ({ children, ...props }: any) => {
  const { image, description } = props.data;

  return (
    <components.Option {...props}>
      <div className="flex items-center gap-3 py-1">
        {image && (
          <img
            src={image}
            alt=""
            className="w-12 h-12 object-cover rounded-lg"
          />
        )}
        <div>
          <p className="font-medium">{children}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </components.Option>
  );
};

export const CustomValue = ({ children, ...props }: any) => {
  const { image, description } = props.data;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-3">
        {image && (
          <img
            src={image}
            alt=""
            className="w-10 h-10 object-cover rounded-lg"
          />
        )}
        <div>
          <p className="font-medium">{children}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </components.SingleValue>
  );
};

export const ClearIndicator = (props: any) => (
  <components.ClearIndicator {...props}>
    <svg
      className="w-5 h-5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M6.28 6.28a.75.75 0 0 0 0 1.06l2.47 2.47-2.47 2.47a.75.75 0 1 0 1.06 1.06l2.47-2.47 2.47 2.47a.75.75 0 1 0 1.06-1.06L10.87 9.81l2.47-2.47a.75.75 0 0 0-1.06-1.06L9.81 8.75 7.34 6.28a.75.75 0 0 0-1.06 0Z"
        fill="currentColor"
      />
    </svg>
  </components.ClearIndicator>
);
