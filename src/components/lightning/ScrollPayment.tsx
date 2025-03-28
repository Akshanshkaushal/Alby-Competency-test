import React, { useState, useEffect, useRef } from 'react';
import { useWebLN } from '../../hooks/useWebLN';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useFiatConversion } from '../../hooks/useFiatConversion';

interface ScrollPaymentConfig {
  enabled: boolean;
  recipient: string;
  amountPerScroll: number;
  scrollThreshold: number;
  maxPayments: number;
}

const ScrollPayment: React.FC = () => {
  const { webln, isEnabled, enable } = useWebLN();
  const [config, setConfig] = useState<ScrollPaymentConfig>({
    enabled: false,
    recipient: '',
    amountPerScroll: 10,
    scrollThreshold: 1000,
    maxPayments: 5
  });
  
  const [paymentCount, setPaymentCount] = useState(0);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const scrollRef = useRef<number>(0);
  const [amount, setAmount] = useState<string>('');
  
  const { convertSatsToFiat, convertFiatToSats, fiatCurrency } = useFiatConversion();
  
  const handleConfigChange = (key: keyof ScrollPaymentConfig, value: string | boolean | number) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const toggleScrollPayments = async () => {
    if (!config.enabled) {
      // Enable scroll payments
      if (!webln || !isEnabled) {
        try {
          await enable();
        } catch (err) {
          setError('Failed to enable WebLN. Please make sure you have a compatible wallet installed.');
          return;
        }
      }
      
      if (!config.recipient) {
        setError('Please enter a recipient Lightning address');
        return;
      }
      
      // Reset payment count and scroll position
      setPaymentCount(0);
      setLastScrollPosition(window.scrollY);
      scrollRef.current = window.scrollY;
      
      // Enable scroll payments
      handleConfigChange('enabled', true);
      setSuccess('Scroll payments enabled! Scroll down to trigger payments.');
    } else {
      // Disable scroll payments
      handleConfigChange('enabled', false);
      setSuccess('Scroll payments disabled.');
    }
  };
  
  const sendScrollPayment = async () => {
    if (!webln || !isEnabled || !config.enabled || paymentCount >= config.maxPayments) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Send payment to the recipient
      const response = await webln.sendPayment({
        paymentRequest: config.recipient,
        amount: config.amountPerScroll,
        memo: `Scroll payment #${paymentCount + 1}`
      });
      
      setPaymentCount(prev => prev + 1);
      setSuccess(`Payment #${paymentCount + 1} sent successfully! Preimage: ${response.preimage.substring(0, 10)}...`);
    } catch (err) {
      console.error('Scroll payment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send scroll payment');
      // Disable scroll payments on error
      handleConfigChange('enabled', false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSatsChange = (sats: number) => {
    setAmount(sats.toString());
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (!config.enabled || isLoading || paymentCount >= config.maxPayments) {
        return;
      }
      
      const currentPosition = window.scrollY;
      scrollRef.current = currentPosition;
      
      // Check if user has scrolled past the threshold
      if (currentPosition > lastScrollPosition + config.scrollThreshold) {
        setLastScrollPosition(currentPosition);
        sendScrollPayment();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [config.enabled, config.scrollThreshold, lastScrollPosition, isLoading, paymentCount, config.maxPayments]);
  
  return (
    <Card title="Scroll Payments" className="mb-8">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure automatic micropayments that trigger as you scroll down a page.
        </p>
        
        <Input
          label="Recipient Lightning Address"
          placeholder="lightning@address.com"
          value={config.recipient}
          onChange={(e) => handleConfigChange('recipient', e.target.value)}
          disabled={config.enabled}
          fullWidth
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount (sats)"
            type="number"
            placeholder="10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={config.enabled}
            fullWidth
            isSatsInput={true}
            onSatsChange={handleSatsChange}
            showFiatConversion={true}
          />
          
          <Input
            label="Scroll Threshold (pixels)"
            type="number"
            placeholder="1000"
            value={config.scrollThreshold.toString()}
            onChange={(e) => handleConfigChange('scrollThreshold', parseInt(e.target.value) || 100)}
            disabled={config.enabled}
            fullWidth
          />
        </div>
        
        <Input
          label="Maximum Payments"
          type="number"
          placeholder="5"
          value={config.maxPayments.toString()}
          onChange={(e) => handleConfigChange('maxPayments', parseInt(e.target.value) || 1)}
          disabled={config.enabled}
          fullWidth
        />
        
        {paymentCount > 0 && (
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
            Payments sent: {paymentCount} / {config.maxPayments}
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md">
            {success}
          </div>
        )}
        
        <Button
          variant={config.enabled ? 'secondary' : 'primary'}
          onClick={toggleScrollPayments}
          isLoading={isLoading}
          disabled={!isEnabled && !config.enabled}
          fullWidth
        >
          {config.enabled ? 'Disable Scroll Payments' : 'Enable Scroll Payments'}
        </Button>
      </div>
    </Card>
  );
};

export default ScrollPayment; 