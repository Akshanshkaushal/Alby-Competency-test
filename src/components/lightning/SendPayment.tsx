import React, { useState } from 'react';
import { useWebLNContext } from '../../context/WebLNContext';
import Button from '../common/Button';
import Card from '../common/Card';

const SendPayment: React.FC = () => {
  const { webln, isEnabled } = useWebLNContext();
  const [paymentRequest, setPaymentRequest] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPaymentResult(null);

    try {
      // Validate payment request
      if (!paymentRequest || paymentRequest.trim() === '') {
        throw new Error('Payment request is required');
      }

      if (!webln) {
        throw new Error('WebLN not available');
      }

      // Ensure WebLN is enabled
      if (!isEnabled) {
        await webln.enable();
      }

      // Send payment
      const result = await webln.sendPayment(paymentRequest.trim());
      setSuccess(true);
      setPaymentResult(result);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Send Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="paymentRequest" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Lightning Invoice
          </label>
          <textarea
            id="paymentRequest"
            value={paymentRequest}
            onChange={(e) => setPaymentRequest(e.target.value)}
            placeholder="lnbc..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lightning-primary focus:ring-lightning-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={3}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!isEnabled || !paymentRequest.trim()}
          className="w-full"
        >
          Pay Invoice
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

export default SendPayment; 