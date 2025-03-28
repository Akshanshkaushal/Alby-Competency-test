import React from 'react';
import SendPayment from './lightning/SendPayment';
import KeysendPayment from './lightning/KeysendPayment';
import ScrollPayment from './lightning/ScrollPayment';
import WalletDashboard from './lightning/WalletDashboard';
import InvoiceGenerator from './lightning/InvoiceGenerator';
import { useWebLNContext } from '../context/WebLNContext';
import WebLNNotification from './common/WebLNNotification';

// Connection status component
const ConnectionStatus: React.FC = () => {
  const { isEnabled, isAlbyFallback } = useWebLNContext();
  
  if (!isEnabled) return null;
  
  return (
    <div className="text-center mb-4">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        {isAlbyFallback ? 'Connected via Alby Account' : 'Connected via WebLN'}
        <span className="ml-1.5 h-2 w-2 rounded-full bg-green-500"></span>
      </span>
    </div>
  );
};

const MainContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Lightning Network Web App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          A powerful Lightning Network application with WebLN and Alby integration
        </p>
        <ConnectionStatus />
      </div>
      
      <WebLNNotification />
      
      <div>
        
          <WalletDashboard /> 
           
      </div>
    </div>
  );
};

export default MainContent; 