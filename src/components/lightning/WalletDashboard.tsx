import React, { useState, useEffect } from 'react';
import { useWebLN } from '../../hooks/useWebLN';
import Card from '../common/Card';
import Button from '../common/Button';

interface WalletInfo {
  balance: {
    total: number;
    confirmed: number;
    unconfirmed: number;
  };
  alias?: string;
  pubkey?: string;
  connectedPeers?: number;
  activeChannels?: number;
  pendingChannels?: number;
  version?: string;
}

const WalletDashboard: React.FC = () => {
  const { webln, isEnabled, enable } = useWebLN();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletInfo = async () => {
    if (!webln || !isEnabled) {
      try {
        await enable();
      } catch (err) {
        setError('Failed to enable WebLN. Please make sure you have a compatible wallet installed.');
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get node info
      const info = await webln.getInfo();
      
      // Get balance
      const balance = await webln.getBalance();
      
      setWalletInfo({
        balance: {
          total: balance.total || 0,
          confirmed: balance.confirmed || 0,
          unconfirmed: balance.unconfirmed || 0
        },
        alias: info.alias,
        pubkey: info.pubkey,
        connectedPeers: info.connectedPeers,
        activeChannels: info.activeChannels,
        pendingChannels: info.pendingChannels,
        version: info.version
      });
    } catch (err) {
      console.error('Failed to fetch wallet info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEnabled) {
      fetchWalletInfo();
    }
  }, [isEnabled]);

  return (
    <Card title="Wallet Dashboard" className="mb-8">
      <div className="space-y-6">
        {!isEnabled ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your Lightning wallet to view your dashboard
            </p>
            <Button
              onClick={enable}
              isLoading={isLoading}
            >
              Connect WebLN
            </Button>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightning-primary dark:border-lightning-accent"></div>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}
            
            {walletInfo && !isLoading && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</h3>
                    <p className="mt-2 text-3xl font-bold text-lightning-primary dark:text-lightning-accent">
                      {walletInfo.balance.total.toLocaleString()} sats
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Confirmed</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-700 dark:text-gray-300">
                      {walletInfo.balance.confirmed.toLocaleString()} sats
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unconfirmed</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-700 dark:text-gray-300">
                      {walletInfo.balance.unconfirmed.toLocaleString()} sats
                    </p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Node Information</h3>
                  
                  <div className="space-y-3">
                    {walletInfo.alias && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Alias:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{walletInfo.alias}</span>
                      </div>
                    )}
                    
                    {walletInfo.pubkey && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Public Key:</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {walletInfo.pubkey.substring(0, 10)}...{walletInfo.pubkey.substring(walletInfo.pubkey.length - 10)}
                        </span>
                      </div>
                    )}
                    
                    {walletInfo.activeChannels !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Active Channels:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{walletInfo.activeChannels}</span>
                      </div>
                    )}
                    
                    {walletInfo.pendingChannels !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Pending Channels:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{walletInfo.pendingChannels}</span>
                      </div>
                    )}
                    
                    {walletInfo.connectedPeers !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Connected Peers:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{walletInfo.connectedPeers}</span>
                      </div>
                    )}
                    
                    {walletInfo.version && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Version:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{walletInfo.version}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchWalletInfo}
                    isLoading={isLoading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default WalletDashboard; 