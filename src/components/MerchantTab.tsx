import React, { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

interface MerchantTabProps {
  network: 'testnet' | 'mainnet';
}

const MerchantTab: React.FC<MerchantTabProps> = () => {
  const currentAccount = useCurrentAccount();
  // const { mutate: signAndExecute } = useSignAndExecuteTransaction(); // For future use
  
  const [formData, setFormData] = useState({
    recipient: '',
    code: '',
    valueBps: '',
    maxUses: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // Mock transaction for now - replace with actual Move call when contract is deployed
      const mockTxDigest = `0x${Math.random().toString(16).slice(2)}`;
      
      // Simulate transaction execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult(`Coupon issued successfully! Transaction: ${mockTxDigest}`);
      setFormData({
        recipient: '',
        code: '',
        valueBps: '',
        maxUses: '',
        expiryDate: ''
      });
      
      /*
      // Actual implementation when Move package is deployed:
      const tx = new Transaction();
      
      tx.moveCall({
        target: `0x1::coupon::issue`,
        arguments: [
          tx.pure.address(formData.recipient),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(formData.code))),
          tx.pure.u16(parseInt(formData.valueBps)),
          tx.pure.u8(parseInt(formData.maxUses)),
          tx.pure.u64(expiryMs)
        ]
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            setResult(`Coupon issued successfully! Transaction: ${result.digest}`);
            setFormData({
              recipient: '',
              code: '',
              valueBps: '',
              maxUses: '',
              expiryDate: ''
            });
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            setResult(`Transaction failed: ${error.message}`);
          }
        }
      );
      */
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="card">
        <h2>Issue Coupons</h2>
        <p>Please connect your wallet to issue coupons.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Issue New Coupon</h2>
      <p>Create tokenized coupons for your customers</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Recipient Address</label>
          <input
            type="text"
            className="form-input"
            value={formData.recipient}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
            placeholder="0x..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Coupon Code</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Enter or generate code"
              required
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={generateRandomCode}
            >
              Generate
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Discount Value (basis points, 1-10000)</label>
          <input
            type="number"
            className="form-input"
            value={formData.valueBps}
            onChange={(e) => setFormData(prev => ({ ...prev, valueBps: e.target.value }))}
            placeholder="e.g., 1000 = 10%"
            min="1"
            max="10000"
            required
          />
          <small style={{ color: '#6b7280' }}>
            {formData.valueBps && `= ${(parseInt(formData.valueBps) / 100).toFixed(2)}% discount`}
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Max Uses</label>
          <input
            type="number"
            className="form-input"
            value={formData.maxUses}
            onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
            placeholder="e.g., 1"
            min="1"
            max="255"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Expiry Date</label>
          <input
            type="datetime-local"
            className="form-input"
            value={formData.expiryDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
            required
          />
        </div>

        <button 
          type="submit" 
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Issuing...' : 'Issue Coupon'}
        </button>
      </form>

      {result && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          borderRadius: '0.375rem',
          background: result.includes('success') ? '#f0fdf4' : '#fef2f2',
          color: result.includes('success') ? '#166534' : '#dc2626'
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default MerchantTab;
