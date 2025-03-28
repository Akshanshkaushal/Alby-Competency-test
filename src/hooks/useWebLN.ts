import { useState, useEffect, useCallback } from 'react';
import { requestProvider, WebLNProvider } from 'webln';
import { albyOAuthService } from '../services/AlbyOAuthService';

export interface UseWebLNReturn {
  webln: WebLNProvider | null;
  isEnabled: boolean;
  isLoading: boolean;
  error: Error | null;
  enable: () => Promise<void>;
  isAlbyFallback: boolean;
}

export function useWebLN(): UseWebLNReturn {
  const [webln, setWebln] = useState<WebLNProvider | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAlbyFallback, setIsAlbyFallback] = useState<boolean>(false);

  const enableAlbyOAuth = useCallback(async () => {
    try {
      // Check if we're already authenticated with Alby OAuth
      if (albyOAuthService.isAuthenticated()) {
        const albyProvider = albyOAuthService.createWebLNProvider();
        setWebln(albyProvider);
        setIsEnabled(true);
        setIsAlbyFallback(true);
        return true;
      } else {
        // Start the OAuth flow
        albyOAuthService.startOAuthFlow();
        return false;
      }
    } catch (err) {
      console.error('Alby OAuth error:', err);
      return false;
    }
  }, []);

  // Create a mock WebLN provider that shows helpful messages
  const createMockProvider = useCallback((): WebLNProvider => {
    const notInstalledMessage = 'No Lightning wallet detected. Please install the Alby browser extension from https://getalby.com';
    
    return {
      enable: async () => {
        // Try Alby OAuth instead of just showing an error
        const success = await enableAlbyOAuth();
        if (!success) {
          throw new Error(notInstalledMessage);
        }
      },
      getInfo: async () => {
        throw new Error(notInstalledMessage);
      },
      makeInvoice: async () => {
        throw new Error(notInstalledMessage);
      },
      sendPayment: async () => {
        throw new Error(notInstalledMessage);
      },
      getBalance: async () => {
        throw new Error(notInstalledMessage);
      },
      keysend: async () => {
        throw new Error(notInstalledMessage);
      },
      signMessage: async () => {
        throw new Error(notInstalledMessage);
      },
      verifyMessage: async () => {
        throw new Error(notInstalledMessage);
      }
    };
  }, [enableAlbyOAuth]);

  const enable = useCallback(async () => {
    if (isEnabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get a native WebLN provider
      const provider = await requestProvider();
      setWebln(provider);
      setIsEnabled(true);
      setIsAlbyFallback(false);
    } catch (err) {
      console.error('WebLN enable error:', err);
      
      // Try Alby OAuth as fallback
      const success = await enableAlbyOAuth();
      
      if (!success) {
        // If OAuth flow started, we'll be redirected
        // If it failed, create a mock provider
        const mockProvider = createMockProvider();
        setWebln(mockProvider);
        
        // Set a helpful error message with a link
        setError(new Error('No Lightning wallet detected. Please install the Alby browser extension or connect with your Alby account.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, enableAlbyOAuth, createMockProvider]);

  useEffect(() => {
    // Check if WebLN is available on page load
    if (typeof window !== 'undefined') {
      if ('webln' in window) {
        enable();
      } else if (albyOAuthService.isAuthenticated()) {
        // If we have Alby OAuth tokens, use them
        enableAlbyOAuth();
      } else {
        // If no WebLN provider and no OAuth tokens, set up the mock provider
        const mockProvider = createMockProvider();
        setWebln(mockProvider);
        console.log('No WebLN provider detected. Using mock provider with helpful messages.');
      }
    }
  }, [enable, enableAlbyOAuth, createMockProvider]);

  return { 
    webln, 
    isEnabled, 
    isLoading, 
    error, 
    enable, 
    isAlbyFallback 
  };
} 