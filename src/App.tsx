import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { WebLNProvider } from './context/WebLNContext';
import Layout from './components/layout/Layout';
import SendPayment from './components/lightning/SendPayment';
import KeysendPayment from './components/lightning/KeysendPayment';
import ScrollPayment from './components/lightning/ScrollPayment';
import WalletDashboard from './components/lightning/WalletDashboard';
import InvoiceGenerator from './components/lightning/InvoiceGenerator';
import { useWebLNContext } from './context/WebLNContext';
import WebLNNotification from './components/common/WebLNNotification';
import CallbackPage from './pages/CallbackPage';
import MainContent from './components/MainContent';

// Create a component to display connection status
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

// Create router with the new API to avoid deprecation warnings
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <MainContent />
      </Layout>
    ),
  },
  {
    path: "/callback",
    element: <CallbackPage />,
  }
]);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <WebLNProvider>
        <RouterProvider router={router} />
      </WebLNProvider>
    </ThemeProvider>
  );
};

export default App; 