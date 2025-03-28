import { useState, useEffect, useCallback } from 'react';

interface ExchangeRates {
  [currency: string]: number;
}

export function useFiatConversion() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchExchangeRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,gbp,jpy,cad,aud,cny');
      const data = await response.json();
      
      if (!data.bitcoin) {
        throw new Error('Failed to fetch exchange rates');
      }

      // Convert BTC rates to satoshi rates (1 BTC = 100,000,000 sats)
      const satoshiRates: ExchangeRates = {};
      Object.entries(data.bitcoin).forEach(([currency, rate]) => {
        satoshiRates[currency.toUpperCase()] = Number(rate) / 100000000;
      });

      setExchangeRates(satoshiRates);
    } catch (err) {
      console.error('Exchange rate error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch exchange rates'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRates();
    
    // Refresh rates every 15 minutes
    const intervalId = setInterval(fetchExchangeRates, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchExchangeRates]);

  const convertSatsToFiat = useCallback((sats: number): string => {
    if (!exchangeRates[selectedCurrency]) {
      return 'N/A';
    }
    
    const fiatValue = sats * exchangeRates[selectedCurrency];
    
    // Format based on currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(fiatValue);
  }, [exchangeRates, selectedCurrency]);

  const convertFiatToSats = useCallback((fiat: number): number => {
    if (!exchangeRates[selectedCurrency]) {
      return 0;
    }
    
    return Math.round(fiat / exchangeRates[selectedCurrency]);
  }, [exchangeRates, selectedCurrency]);

  const availableCurrencies = Object.keys(exchangeRates);

  return {
    exchangeRates,
    selectedCurrency,
    setSelectedCurrency,
    convertSatsToFiat,
    convertFiatToSats,
    availableCurrencies,
    isLoading,
    error,
    refreshRates: fetchExchangeRates
  };
} 