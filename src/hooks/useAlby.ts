import { useState, useCallback } from 'react';
import { AlbyProvider } from '@getalby/sdk';

interface UseAlbyReturn {
  alby: AlbyProvider | null;
  connect: () => Promise<void>;
  getBalance: () => Promise<number>;
  getInfo: () => Promise<any>;
  createInvoice: (amount: number, memo?: string) => Promise<string>;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useAlby(): UseAlbyReturn {
  const [alby, setAlby] = useState<AlbyProvider | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = new AlbyProvider();
      await provider.init();
      setAlby(provider);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect to Alby'));
      console.error('Alby connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBalance = useCallback(async (): Promise<number> => {
    if (!alby) throw new Error('Alby not connected');
    
    try {
      const balance = await alby.getBalance();
      return balance.balance;
    } catch (err) {
      console.error('Failed to get balance:', err);
      throw err;
    }
  }, [alby]);

  const getInfo = useCallback(async () => {
    if (!alby) throw new Error('Alby not connected');
    
    try {
      return await alby.getInfo();
    } catch (err) {
      console.error('Failed to get info:', err);
      throw err;
    }
  }, [alby]);

  const createInvoice = useCallback(async (amount: number, memo?: string): Promise<string> => {
    if (!alby) throw new Error('Alby not connected');
    
    try {
      const invoice = await alby.createInvoice({
        amount,
        memo: memo || 'Invoice from Lightning App'
      });
      return invoice.paymentRequest;
    } catch (err) {
      console.error('Failed to create invoice:', err);
      throw err;
    }
  }, [alby]);

  return {
    alby,
    connect,
    getBalance,
    getInfo,
    createInvoice,
    isConnected,
    isLoading,
    error
  };
} 