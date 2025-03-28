import React, { forwardRef, useState } from 'react';
import { useFiatConversion } from '../../hooks/useFiatConversion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  isSatsInput?: boolean;
  onSatsChange?: (sats: number) => void;
  showFiatConversion?: boolean;
  containerClassName?: string;
  labelClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  isSatsInput = false,
  onSatsChange,
  showFiatConversion = false,
  ...props
}, ref) => {
  const [displayMode, setDisplayMode] = useState<'sats' | 'fiat'>('sats');
  const { convertSatsToFiat, convertFiatToSats, fiatCurrency } = useFiatConversion();

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (isSatsInput && onSatsChange) {
      if (displayMode === 'sats') {
        const satsValue = parseFloat(value) || 0;
        onSatsChange(satsValue);
      } else {
        const fiatValue = parseFloat(value) || 0;
        const satsValue = convertFiatToSats(fiatValue);
        onSatsChange(satsValue);
      }
    }
    
    if (props.onChange) {
      props.onChange(e);
    }
  };
  
  const toggleDisplayMode = () => {
    if (isSatsInput && showFiatConversion) {
      setDisplayMode(displayMode === 'sats' ? 'fiat' : 'sats');
    }
  };
  
  const getDisplayValue = () => {
    if (!isSatsInput || !showFiatConversion) return props.value;
    
    const numericValue = typeof props.value === 'string' ? parseFloat(props.value) || 0 : 0;
    
    if (displayMode === 'fiat') {
      const fiatValue = convertSatsToFiat(numericValue);
      return fiatValue.toFixed(2);
    }
    
    return props.value;
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${labelClassName}`}>
          {label}
          {isSatsInput && showFiatConversion && (
            <button 
              type="button"
              onClick={toggleDisplayMode}
              className="ml-2 text-xs text-blue-500 hover:text-blue-700"
            >
              {displayMode === 'sats' ? `Show in ${fiatCurrency}` : 'Show in sats'}
            </button>
          )}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            block rounded-md shadow-sm border-gray-300 dark:border-gray-700 
            focus:ring-lightning-primary focus:border-lightning-primary dark:focus:ring-lightning-accent dark:focus:border-lightning-accent
            dark:bg-gray-800 dark:text-white
            ${error ? 'border-red-500 dark:border-red-500' : ''}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${fullWidth ? 'w-full' : ''}
          `}
          {...props}
          value={getDisplayValue()}
          onChange={handleValueChange}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 