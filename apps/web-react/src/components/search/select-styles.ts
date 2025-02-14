import type { StylesConfig, CSSObjectWithLabel } from 'react-select'

interface CustomControlProps {
  hasError?: boolean;
  isFocused?: boolean;
}

export const customSelectStyles: StylesConfig<any, false> = {
  control: (base: CSSObjectWithLabel, state: CustomControlProps) => ({
    ...base,
    minHeight: '68px',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid',
    borderColor: state.hasError ? 'rgb(239, 68, 68)' : state.isFocused ? 'rgb(96, 165, 250)' : 'rgb(55, 65, 81)',
    borderRadius: '1rem',
    boxShadow: 'none',
    padding: '0 1rem',
    paddingLeft: '3rem',
    transition: 'all 150ms',
    '&:hover': {
      borderColor: state.hasError ? 'rgb(239, 68, 68)' : 'rgb(96, 165, 250)',
      backgroundColor: 'rgb(31, 41, 55)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'rgb(31, 41, 55)',
    border: '1px solid rgb(55, 65, 81)',
    borderRadius: '1rem',
    boxShadow: '0 10px 40px -5px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    animation: 'selectMenuAppear 150ms ease',
    padding: '0.5rem',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? 'rgb(37, 99, 235)' : isFocused ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
    color: isSelected ? 'white' : 'rgb(209, 213, 219)',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'rgb(37, 99, 235)',
    },
  }),
  input: (base) => ({
    ...base,
    color: 'rgb(209, 213, 219)',
    margin: 0,
    padding: 0,
  }),
  valueContainer: (base) => ({
    ...base,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: 'rgb(209, 213, 219)',
    margin: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
    margin: 0,
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
  }),
  loadingMessage: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'rgb(156, 163, 175)',
    cursor: 'pointer',
    padding: '8px',
    '&:hover': {
      color: 'rgb(209, 213, 219)',
    },
  }),
}
