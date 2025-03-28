import React, { useState } from 'react';
import { useWebLN } from '../../hooks/useWebLN';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const KeysendPayment: React.FC = () => {
  const { webln, isEnabled, enable } = useWebLN();
  const [pubkey, setPubkey] = useState('');
  const [amount, setAmount] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleKeysendPayment = async () => {
    if (!webln || !isEnabled) {
      await enable();
      return;
    }

    if (!pubkey || !amount) {
      setError('Public key and amount are required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare custom records if provided
      const customRecords: Record<string, string> = {};
      if (customKey && customValue) {
        customRecords[customKey] = customValue;
      }

      // Add default TLV record for text messages (record 34349334)
      if (customValue && !customKey) {
        customRecords['34349334'] = customValue;
      }

      const response = await webln.keysend({
        destination: pubkey,
        amount: parseInt(amount),
        customRecords: Object.keys(customRecords).length > 0 ? customRecords : undefined
      });
      
      setSuccess(`Keysend payment sent successfully! Preimage: ${response.preimage}`);
    } catch (err) {
      console.error('Keysend error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send keysend payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Keysend Payment" className="mb-8">
      <div className="space-y-4">
        <Input
          label="Node Public Key"
          placeholder="03xxxxxx..."
          value={pubkey}
          onChange={(e) => setPubkey(e.target.value)}
          fullWidth
        />
        
        <Input
          label="Amount (sats)"
          type="number"
          placeholder="Amount in satoshis"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Custom Record Key (optional)"
            placeholder="TLV record key"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            fullWidth
          />
          
          <Input
            label="Message or Custom Value"
            placeholder="Message or custom value"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            fullWidth
          />
        </div>
        
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
          onClick={handleKeysendPayment}
          isLoading={isLoading}
          disabled={!pubkey || !amount}
          fullWidth
        >
          {isEnabled ? 'Send Keysend Payment' : 'Connect WebLN to Send Keysend Payment'}
        </Button>
      </div>
    </Card>
  );
};

export default KeysendPayment; 