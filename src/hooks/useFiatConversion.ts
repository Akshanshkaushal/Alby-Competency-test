import { useState, useEffect } from 'react';

interface ExchangeRates {
  [currency: string]: number;
}

export const useFiatConversion = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [fiatCurrency, setFiatCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        // Using CoinGecko API to get BTC price in various currencies
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,gbp,jpy,cad,aud,cny'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        
        const data = await response.json();
        
        // Convert BTC prices to satoshi prices (1 BTC = 100,000,000 sats)
        const rates: ExchangeRates = {};
        Object.entries(data.bitcoin).forEach(([currency, rate]) => {
          rates[currency.toUpperCase()] = Number(rate) / 100000000;
        });
        
        setExchangeRates(rates);
        setError(null);
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError('Failed to load exchange rates');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Refresh exchange rates every hour
    const intervalId = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const convertSatsToFiat = (sats: number): number => {
    if (!exchangeRates[fiatCurrency]) return 0;
    return sats * exchangeRates[fiatCurrency];
  };

  const convertFiatToSats = (fiatAmount: number): number => {
    if (!exchangeRates[fiatCurrency] || exchangeRates[fiatCurrency] === 0) return 0;
    return Math.round(fiatAmount / exchangeRates[fiatCurrency]);
  };

  const setPreferredFiatCurrency = (currency: string) => {
    if (exchangeRates[currency.toUpperCase()]) {
      setFiatCurrency(currency.toUpperCase());
    }
  };

  const getAvailableCurrencies = (): string[] => {
    return Object.keys(exchangeRates);
  };

  return {
    convertSatsToFiat,
    convertFiatToSats,
    fiatCurrency,
    setPreferredFiatCurrency,
    getAvailableCurrencies,
    loading,
    error
  };
}; 