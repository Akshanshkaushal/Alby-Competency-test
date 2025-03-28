import React, { useState, useEffect } from 'react';
import { useFiatConversion } from '../../hooks/useFiatConversion';
import Input from './Input';
import Button from './Button';

interface FiatConverterProps {
  onSatsChange?: (sats: number) => void;
  initialSats?: number;
}

const FiatConverter: React.FC<FiatConverterProps> = ({ onSatsChange, initialSats = 0 }) => {
  const [sats, setSats] = useState<string>(initialSats.toString());
  const [fiat, setFiat] = useState<string>('0');
  const { 
    convertSatsToFiat, 
    convertFiatToSats, 
    fiatCurrency,
    setPreferredFiatCurrency,
    getAvailableCurrencies,
    loading: isLoading,
    error 
  } = useFiatConversion();
  
  // Get available currencies
  const availableCurrencies = getAvailableCurrencies();
  const selectedCurrency = fiatCurrency;
  const setSelectedCurrency = setPreferredFiatCurrency;

  // Update fiat value when sats change
  useEffect(() => {
    if (sats && !isNaN(Number(sats))) {
      const satsValue = Number(sats);
      const fiatValue = convertSatsToFiat(satsValue);
      setFiat(fiatValue.toFixed(2));
    }
  }, [sats, convertSatsToFiat, selectedCurrency]);

  // Update sats value when fiat changes
  useEffect(() => {
    if (initialSats && initialSats > 0) {
      setSats(initialSats.toString());
      const fiatValue = convertSatsToFiat(initialSats);
      setFiat(fiatValue.toFixed(2));
    }
  }, [initialSats, convertSatsToFiat]);

  const handleSatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSats = e.target.value.replace(/[^0-9]/g, '');
    setSats(newSats);
    
    if (newSats && !isNaN(Number(newSats))) {
      const satsValue = Number(newSats);
      const fiatValue = convertSatsToFiat(satsValue);
      setFiat(fiatValue.toFixed(2));
      
      if (onSatsChange) {
        onSatsChange(satsValue);
      }
    } else {
      setFiat('0');
      if (onSatsChange) {
        onSatsChange(0);
      }
    }
  };

  const handleFiatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiat = e.target.value.replace(/[^0-9.]/g, '');
    setFiat(newFiat);
    
    if (newFiat && !isNaN(Number(newFiat))) {
      const fiatValue = Number(newFiat);
      const satsValue = convertFiatToSats(fiatValue);
      setSats(satsValue.toString());
      
      if (onSatsChange) {
        onSatsChange(satsValue);
      }
    } else {
      setSats('0');
      if (onSatsChange) {
        onSatsChange(0);
      }
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Amount (sats)"
          type="text"
          value={sats}
          onChange={handleSatsChange}
          placeholder="0"
          fullWidth
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount ({selectedCurrency})
          </label>
          <div className="flex">
            <Input
              type="text"
              value={fiat}
              onChange={handleFiatChange}
              placeholder="0.00"
              className="rounded-r-none"
              fullWidth
            />
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="h-full rounded-r-md border-l-0 border-gray-300 dark:border-gray-700 bg-transparent py-0 pl-2 pr-7 text-gray-500 dark:text-gray-400 focus:ring-0 focus:border-lightning-primary dark:focus:border-lightning-accent"
              >
                {availableCurrencies.map((currency: string) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading exchange rates...
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default FiatConverter; 