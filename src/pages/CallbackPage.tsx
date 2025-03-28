import React, { useEffect, useState } from 'react';
import { albyOAuthService } from '../services/AlbyOAuthService';
import { useNavigate } from 'react-router-dom';

const CallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setStatus('error');
          setError('No authorization code found in the URL');
          return;
        }

        await albyOAuthService.handleCallback(code);
        setStatus('success');
        
        // Redirect back to the main page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          {status === 'loading' && 'Completing Authentication...'}
          {status === 'success' && 'Authentication Successful!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>
        
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightning-primary"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 mb-4">
              You have successfully connected your Alby account.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you back to the application...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error || 'An error occurred during authentication.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-lightning-primary text-white rounded hover:bg-lightning-primary-dark"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallbackPage; 