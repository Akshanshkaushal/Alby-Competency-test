import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useWebLNContext } from '../../context/WebLNContext';
import Button from '../common/Button';
import { albyOAuthService } from '../../services/AlbyOAuthService';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isEnabled, enable, isLoading, error, isAlbyFallback } = useWebLNContext();

  const handleConnectClick = () => {
    if (!isEnabled) {
      enable().catch(() => {
        // If WebLN fails, try Alby OAuth
        albyOAuthService.startOAuthFlow();
      });
    }
  };

  const handleLogout = () => {
    if (isAlbyFallback) {
      albyOAuthService.logout();
      window.location.reload();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-lightning-primary dark:text-lightning-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 21h-1l1-7H7.5c-.58 0-.65-.31-.4-.75l4.35-7.5c.19-.37.44-.37.62 0l1.7 2.95H19c.39 0 .64.31.4.75l-6.9 11.5c-.18.31-.52.31-.7 0l-.8-1.25z" />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Lightning App</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-lightning-primary dark:focus:ring-lightning-accent"
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {isEnabled && isAlbyFallback && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout from Alby
              </Button>
            )}
            
            <Button
              variant={isEnabled ? "outline" : "primary"}
              size="sm"
              onClick={handleConnectClick}
              isLoading={isLoading}
              disabled={isEnabled && !isAlbyFallback}
            >
              {isEnabled 
                ? (isAlbyFallback ? 'Connected via Alby' : 'WebLN Connected') 
                : 'Connect Lightning Wallet'}
            </Button>
            
            {error && !isEnabled && (
              <a 
                href="https://getalby.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-lightning-primary hover:underline dark:text-lightning-accent"
              >
                Install Alby
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 