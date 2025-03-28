import React, { useState } from 'react';
import { useWebLN } from '../../hooks/useWebLN';
import { useFiatConversion } from '../../hooks/useFiatConversion';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const KeysendPayment: React.FC = () => {
  const { webln, isEnabled, enable } = useWebLN();
  const [pubkey, setPubkey] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handleSatsChange = (sats: number) => {
    setAmount(sats.toString());
  };

  const handleKeysendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPaymentResult(null);

    try {
      // Validate inputs
      if (!pubkey || pubkey.trim() === '') {
        throw new Error('Node pubkey is required');
      }

      if (!amount || parseInt(amount) <= 0) {
        throw new Error('Valid amount is required');
      }

      if (!webln) {
        throw new Error('WebLN not available');
      }

      // Ensure WebLN is enabled
      if (!isEnabled) {
        await enable();
      }

      // Send keysend payment
      const result = await webln.keysend({
        destination: pubkey.trim(),
        amount: parseInt(amount),
        customRecords: memo ? { '1': memo } : undefined
      });

      setSuccess(true);
      setPaymentResult(result);
    } catch (err) {
      console.error('Keysend payment error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Keysend Payment">
      <form onSubmit={handleKeysendPayment} className="space-y-4">
        <Input
          label="Node Public Key"
          value={pubkey}
          onChange={(e) => setPubkey(e.target.value)}
          placeholder="03xxxxxx..."
          required
          fullWidth
        />

        <Input
          label="Amount (sats)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in satoshis"
          required
          isSatsInput={true}
          onSatsChange={handleSatsChange}
          showFiatConversion={true}
          fullWidth
        />

        <Input
          label="Memo (optional)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Optional message"
          fullWidth
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!isEnabled || !pubkey.trim() || !amount}
          className="w-full"
        >
          Send Keysend Payment
        </Button>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md dark:bg-green-900/30 dark:text-green-400">
            <p>Payment successful!</p>
            {paymentResult && (
              <div className="mt-2 text-xs overflow-auto">
                <p>Preimage: {paymentResult.preimage}</p>
                {paymentResult.paymentHash && <p>Payment Hash: {paymentResult.paymentHash}</p>}
              </div>
            )}
          </div>
        )}
      </form>
    </Card>
  );
};

export default KeysendPayment; 