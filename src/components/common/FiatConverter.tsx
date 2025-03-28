import React, { useState } from 'react';
import { useFiatConversion } from '../../hooks/useFiatConversion';
import Input from './Input';
import Button from './Button';

interface FiatConverterProps {
  onSatsChange?: (sats: number) => void;
  initialSats?: number;
  className?: string;
}

const FiatConverter: React.FC<FiatConverterProps> = ({
  onSatsChange,
  initialSats = 0,
  className = ''
}) => {
  const [sats, setSats] = useState(initialSats.toString());
  const [fiat, setFiat] = useState('');
  const [mode, setMode] = useState<'sats' | 'fiat'>('sats');
  
  const {
    selectedCurrency,
    setSelectedCurrency,
    convertSatsToFiat,
    convertFiatToSats,
    availableCurrencies,
    isLoading
  } = useFiatConversion();

  const handleSatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSats(value);
    
    if (value && !isNaN(Number(value))) {
      const satsValue = Number(value);
      setFiat(convertSatsToFiat(satsValue).replace(/[^0-9.]/g, ''));
      
      if (onSatsChange) {
        onSatsChange(satsValue);
      }
    } else {
      setFiat('');
    }
    
    setMode('sats');
  };

  const handleFiatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFiat(value);
    
    if (value && !isNaN(Number(value))) {
      const fiatValue = Number(value);
      const satsValue = convertFiatToSats(fiatValue);
      setSats(satsValue.toString());
      
      if (onSatsChange) {
        onSatsChange(satsValue);
      }
    } else {
      setSats('');
    }
    
    setMode('fiat');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurrency(e.target.value);
    
    // Recalculate values based on new currency
    if (mode === 'sats' && sats) {
      setTimeout(() => {
        setFiat(convertSatsToFiat(Number(sats)).replace(/[^0-9.]/g, ''));
      }, 0);
    } else if (mode === 'fiat' && fiat) {
      setTimeout(() => {
        setSats(convertFiatToSats(Number(fiat)).toString());
        
        if (onSatsChange) {
          onSatsChange(convertFiatToSats(Number(fiat)));
        }
      }, 0);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Amount (sats)"
          type="number"
          placeholder="0"
          value={sats}
          onChange={handleSatsChange}
          fullWidth
        />
        
        <div className="flex space-x-2">
          <Input
            label={`Amount (${selectedCurrency})`}
            type="number"
            placeholder="0.00"
            value={fiat}
            onChange={handleFiatChange}
            fullWidth
          />
          
          <div className="mt-6">
            <select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className="h-10 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-lightning-primary focus:border-lightning-primary dark:focus:ring-lightning-accent dark:focus:border-lightning-accent"
            >
              {availableCurrencies.map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {isLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Updating exchange rates...
        </p>
      )}
    </div>
  );
};

export default FiatConverter; 