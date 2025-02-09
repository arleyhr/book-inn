type State = {
  isFocused: boolean;
  isDisabled: boolean;
  menuIsOpen: boolean;
  hasError?: boolean;
};

export const customSelectStyles = {
  control: (
    base: any,
    state: State,
  ) => ({
    ...base,
    minHeight: '68px',
    height: '68px',
    borderRadius: '16px',
    border: state.hasError
      ? '1px solid rgb(244 63 94)'
      : '1px solid rgb(229 231 235)',
    boxShadow: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: state.isFocused ? 'white' : 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      borderColor: state.hasError ? 'rgb(244 63 94)' : 'rgb(59 130 246)',
      backgroundColor: 'white',
      borderWidth: state.hasError ? '2px' : '1px',
    },
    borderColor: state.hasError
      ? 'rgb(244 63 94)'
      : state.isFocused
        ? 'rgb(59 130 246)'
        : 'rgb(229 231 235)',
    padding: state.hasError ? '3px' : '4px',
    cursor: 'text',
    position: 'relative',
    outline: state.isFocused && !state.hasError ? '2px solid rgb(59 130 246)' : 'none',
    outlineOffset: state.isFocused ? '-2px' : '0',
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgb(229 231 235)',
    boxShadow: '0 10px 40px -5px rgba(0,0,0,0.15)',
    marginTop: '8px',
    zIndex: 50,
    animation: 'selectMenuAppear 0.2s ease',
  }),
  menuList: (base: any) => ({
    ...base,
    padding: '4px',
  }),
  option: (base: any) => ({
    ...base,
    padding: 0,
    cursor: 'pointer',
    backgroundColor: 'transparent',
  }),
  input: (base: any) => ({
    ...base,
    color: 'rgb(55 65 81)',
    margin: 0,
    padding: 0,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: '44px',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'rgb(156 163 175)',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: '44px',
    fontSize: '15px',
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: 0,
    paddingLeft: '44px',
    height: '60px',
    position: 'relative',
  }),
  singleValue: (base: any) => ({
    ...base,
    position: 'relative',
    transform: 'none',
    top: 'auto',
    maxWidth: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    position: 'absolute',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
  }),
  clearIndicator: (base: any) => ({
    ...base,
    padding: '4px',
    cursor: 'pointer',
    position: 'relative',
    right: 0,
    color: 'rgb(156 163 175)',
    '&:hover': {
      color: 'rgb(107 114 128)',
    },
  }),
} as const;
