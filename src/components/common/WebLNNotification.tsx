import React from 'react';
import { useWebLNContext } from '../../context/WebLNContext';
import { albyOAuthService } from '../../services/AlbyOAuthService';

const WebLNNotification: React.FC = () => {
  const { error, enable } = useWebLNContext();
  
  if (!error) return null;
  
  const handleConnectWithAlby = (e: React.MouseEvent) => {
    e.preventDefault();
    albyOAuthService.startOAuthFlow();
  };
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 dark:bg-yellow-900/30 dark:border-yellow-600">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            No Lightning wallet detected. This app requires a WebLN-compatible wallet or an Alby account.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href="https://getalby.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:bg-yellow-700 dark:hover:bg-yellow-600"
            >
              Install Alby Extension
            </a>
            <button
              onClick={handleConnectWithAlby}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-lightning-primary hover:bg-lightning-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lightning-primary dark:bg-lightning-accent dark:hover:bg-lightning-accent-dark"
            >
              Connect with Alby Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebLNNotification; 