import React, { createContext, useContext, ReactNode } from 'react';
import { useWebLN, UseWebLNReturn } from '../hooks/useWebLN';

const WebLNContext = createContext<UseWebLNReturn | undefined>(undefined);

export const WebLNProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const webLNState = useWebLN();
  
  return (
    <WebLNContext.Provider value={webLNState}>
      {children}
    </WebLNContext.Provider>
  );
};

export const useWebLNContext = (): UseWebLNReturn => {
  const context = useContext(WebLNContext);
  if (context === undefined) {
    throw new Error('useWebLNContext must be used within a WebLNProvider');
  }
  return context;
}; 