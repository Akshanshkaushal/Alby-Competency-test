import React, { useState, useRef } from 'react';
import { useWebLN } from '../../hooks/useWebLN';
import { useFiatConversion } from '../../hooks/useFiatConversion';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import QRCode from '../common/QRCode';

const InvoiceGenerator: React.FC = () => {
  const { webln, isEnabled, enable } = useWebLN();
  const { convertSatsToFiat, convertFiatToSats, fiatCurrency } = useFiatConversion();
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState('');
  const [expiry, setExpiry] = useState('3600'); // Default: 1 hour
  const [invoice, setInvoice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const invoiceRef = useRef<HTMLInputElement>(null);

  const handleSatsChange = (sats: number) => {
    setAmount(sats.toString());
  };

  const generateInvoice = async () => {
    if (!webln || !isEnabled) {
      try {
        await enable();
      } catch (err) {
        setError('Failed to enable WebLN. Please make sure you have a compatible wallet installed.');
        return;
      }
    }

    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInvoice('');
    setCopySuccess(false);

    try {
      const response = await webln.makeInvoice({
        amount: parseInt(amount),
        defaultMemo: memo || 'Invoice from Lightning App',
        expiry: parseInt(expiry)
      });
      
      setInvoice(response.paymentRequest);
    } catch (err) {
      console.error('Invoice generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (invoiceRef.current) {
      invoiceRef.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
      
      // Reset copy success message after 3 seconds
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  return (
    <Card title="Invoice Generator" className="mb-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount (sats)"
            type="number"
            placeholder="Amount in satoshis"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            isSatsInput={true}
            onSatsChange={handleSatsChange}
            showFiatConversion={true}
          />
          
          <Input
            label="Expiry (seconds)"
            type="number"
            placeholder="3600"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            fullWidth
          />
        </div>
        
        <Input
          label="Memo (optional)"
          placeholder="Invoice description"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          fullWidth
        />
        
        <Button
          onClick={generateInvoice}
          isLoading={isLoading}
          disabled={!amount}
          fullWidth
        >
          {isEnabled ? 'Generate Invoice' : 'Connect WebLN to Generate Invoice'}
        </Button>
        
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        {invoice && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-center">
              <QRCode 
                value={invoice} 
                size={200}
                bgColor={document.documentElement.classList.contains('dark') ? '#1F2937' : '#FFFFFF'}
                fgColor={document.documentElement.classList.contains('dark') ? '#FFFFFF' : '#000000'}
              />
            </div>
            
            <div className="relative">
              <Input
                label="Lightning Invoice"
                value={invoice}
                readOnly
                ref={invoiceRef}
                fullWidth
              />
              <div className="absolute right-2 top-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default InvoiceGenerator; 