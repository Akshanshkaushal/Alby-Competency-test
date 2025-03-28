import { useState, useEffect } from 'react';
import { AlbyProvider } from '@getalby/sdk';

interface UseAlbyReturn {
  alby: AlbyProvider | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  connect: () => Promise<void>;
}

export function useAlby(): UseAlbyReturn {
  const [alby, setAlby] = useState<AlbyProvider | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = async (): Promise<void> => {
    if (isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a new Alby provider with empty options
      const provider = new AlbyProvider({});
      // No need to call init() as it's not in the type definition
      
      setAlby(provider);
      setIsConnected(true);
    } catch (err) {
      console.error('Alby connect error:', err);
      setError(err instanceof Error ? err : new Error('Failed to connect to Alby'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Try to connect on mount
    connect();
  }, []);

  return { 
    alby, 
    isConnected, 
    isLoading, 
    error, 
    connect 
  };
} 