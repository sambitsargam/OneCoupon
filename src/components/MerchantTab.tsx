import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';

interface MerchantTabProps {
  network: 'onechain-testnet' | 'onechain-mainnet';
}

const MerchantTab: React.FC<MerchantTabProps> = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [formData, setFormData] = useState({
    recipient: '',
    code: '',
    valueBps: '',
    maxUses: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [merchantCreating, setMerchantCreating] = useState(false);
  const [merchantCreated, setMerchantCreated] = useState(false);

  // Package ID from environment
  const packageId = import.meta.env.VITE_PACKAGE_ID;

  // Query for merchant objects owned by current account
  const { data: ownedObjects, refetch: refetchObjects } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: currentAccount?.address ?? '',
      filter: {
        StructType: `${packageId}::coupon::Merchant`
      },
      options: {
        showContent: true,
        showType: true
      }
    },
    {
      enabled: !!currentAccount?.address && !!packageId
    }
  );

  const merchantObjects = ownedObjects?.data || [];

  // Reset merchantCreated state when merchant objects are loaded
  useEffect(() => {
    if (merchantCreated && merchantObjects.length > 0) {
      // Small delay to show the success message briefly
      const timer = setTimeout(() => {
        setMerchantCreated(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [merchantCreated, merchantObjects.length]);

  // Add polling effect to periodically check for merchant objects after creation
  useEffect(() => {
    if (merchantCreated && merchantObjects.length === 0) {
      const interval = setInterval(() => {
        console.log('Polling for merchant objects...');
        refetchObjects();
      }, 3000); // Poll every 3 seconds

      // Stop polling after 30 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [merchantCreated, merchantObjects.length, refetchObjects]);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const createMerchant = async () => {
    if (!currentAccount || !packageId) {
      setResult('Please connect your wallet and ensure package is deployed');
      return;
    }

    setMerchantCreating(true);
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${packageId}::coupon::create_merchant`,
        arguments: []
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            setResult(`Merchant created successfully! Transaction: ${result.digest}`);
            setMerchantCreated(true); // Update local state immediately
            
            // Immediate refetch
            refetchObjects();
            
            // Additional refetches with delays to catch the blockchain state
            setTimeout(() => refetchObjects(), 2000);
            setTimeout(() => refetchObjects(), 5000);
            setTimeout(() => refetchObjects(), 10000);
          },
          onError: (error) => {
            console.error('Merchant creation failed:', error);
            setResult(`Merchant creation failed: ${error.message}`);
          }
        }
      );
    } catch (error) {
      console.error('Error creating merchant:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setMerchantCreating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount || !packageId) {
      setResult('Please connect your wallet and ensure package is deployed');
      return;
    }

    if (merchantObjects.length === 0) {
      setResult('Please create a merchant account first');
      return;
    }

    setLoading(true);
    try {
      const tx = new Transaction();
      
      // Convert expiry date to milliseconds
      const expiryMs = new Date(formData.expiryDate).getTime();
      
      // Get merchant object ID
      const merchantObjectId = merchantObjects[0].data?.objectId;
      
      if (!merchantObjectId) {
        throw new Error('Merchant object not found');
      }
      
      tx.moveCall({
        target: `${packageId}::coupon::issue`,
        arguments: [
          tx.object(merchantObjectId), // merchant object
          tx.pure.address(formData.recipient), // to
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(formData.code))), // code
          tx.pure.u16(parseInt(formData.valueBps)), // value_bps
          tx.pure.u8(parseInt(formData.maxUses)), // max_uses
          tx.pure.u64(expiryMs) // expires_at_ms
        ]
      });

      signAndExecute(
        { transaction: tx },
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

  if (!packageId) {
    return (
      <div className="card">
        <h2>Issue Coupons</h2>
        <p>Package not deployed. Please check your environment configuration.</p>
      </div>
    );
  }

  // If no merchant account exists, show merchant creation
  if (merchantObjects.length === 0 && !merchantCreated) {
    return (
      <div className="card">
        <h2>Create Merchant Account</h2>
        <p>You need to create a merchant account before you can issue coupons.</p>
        
        <div style={{ 
          background: '#f0fdf4', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>What is a Merchant Account?</h3>
          <ul style={{ margin: 0, color: '#065f46' }}>
            <li>A smart contract object that authorizes you to issue coupons</li>
            <li>Only the merchant admin (you) can issue coupons from this account</li>
            <li>This is a one-time setup per merchant</li>
          </ul>
        </div>

        <button 
          className={`btn btn-primary ${merchantCreating ? 'loading' : ''}`}
          onClick={createMerchant}
          disabled={merchantCreating}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {merchantCreating ? 'Creating Merchant Account...' : 'Create Merchant Account'}
        </button>

        {result && (
          <div style={{ 
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
  }

  // Show transition message if merchant was just created but blockchain hasn't updated yet
  if (merchantCreated && merchantObjects.length === 0) {
    return (
      <div className="card">
        <h2>Merchant Account Created!</h2>
        <div style={{ 
          background: '#f0fdf4', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1.5rem',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#166534' }}>✅ Success!</h3>
          <p style={{ margin: '0.5rem 0', color: '#065f46' }}>
            Your merchant account has been created successfully. The coupon issuance form will appear shortly.
          </p>
          <p style={{ margin: '0.5rem 0', color: '#065f46', fontSize: '0.875rem' }}>
            Waiting for blockchain confirmation...
          </p>
        </div>

        {result && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '0.375rem',
            background: '#f0fdf4',
            color: '#166534',
            marginBottom: '1rem'
          }}>
            {result}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => refetchObjects()}
          >
            Check Again
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setMerchantCreated(false)}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Issue New Coupon</h2>
      <p>Create tokenized coupons for your customers</p>
      
      <div style={{ 
        background: '#f8fafc', 
        padding: '1rem', 
        borderRadius: '0.5rem', 
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Merchant Account</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          ✅ Active • {merchantObjects[0]?.data?.objectId?.slice(0, 8)}...{merchantObjects[0]?.data?.objectId?.slice(-6)}
        </p>
      </div>
      
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
