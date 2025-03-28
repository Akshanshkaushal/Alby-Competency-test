import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-lightning-primary dark:text-lightning-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 21h-1l1-7H7.5c-.58 0-.65-.31-.4-.75l4.35-7.5c.19-.37.44-.37.62 0l1.7 2.95H19c.39 0 .64.31.4.75l-6.9 11.5c-.18.31-.52.31-.7 0l-.8-1.25z" />
            </svg>
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Lightning App</span>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by WebLN and Alby
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 