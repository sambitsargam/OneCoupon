import React, { useState } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

const FaucetTab: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Query for current balance
  const { data: balance, refetch: refetchBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address ?? '',
      coinType: '0x2::sui::SUI'
    },
    {
      enabled: !!currentAccount?.address
    }
  );

  const requestFaucetTokens = async () => {
    if (!currentAccount?.address) {
      setResult('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // OneChain Testnet faucet endpoint (adjust URL as needed)
      const faucetUrl = 'https://faucet-testnet.onelabs.cc/v1/gas';
      
      const response = await fetch(faucetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: currentAccount.address
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`Success! Received test tokens. Transaction: ${data.transferredGasObjects?.[0]?.transferTxDigest || 'N/A'}`);
        
        // Start cooldown (typically 60 seconds)
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Refetch balance after successful faucet request
        setTimeout(() => {
          refetchBalance();
        }, 2000);
      } else {
        const errorData = await response.json();
        setResult(`Error: ${errorData.message || 'Failed to get test tokens'}`);
      }
    } catch (error) {
      console.error('Faucet error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance) / 1_000_000_000; // Convert from MIST to SUI
    return num.toFixed(6);
  };

  if (!currentAccount) {
    return (
      <div className="card">
        <h2>Testnet Faucet</h2>
        <p>Please connect your wallet to request test tokens.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>OneChain Testnet Faucet</h2>
      <p>Get free OCT tokens for testing on OneChain Testnet</p>
      
      <div style={{ 
        background: '#f8fafc', 
        padding: '1rem', 
        borderRadius: '0.5rem', 
        marginBottom: '1.5rem' 
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Current Balance</h3>
        <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>
          {balance ? formatBalance(balance.totalBalance) : '0.000000'} OCT
        </p>
        <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
          Address: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3>Faucet Information</h3>
        <ul style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          <li>Each request provides 1 OCT for testing</li>
          <li>Rate limit: 1 request per minute per address</li>
          <li>Testnet tokens have no real value</li>
          <li>Use tokens to test coupon creation and redemption</li>
        </ul>
      </div>

      <button
        className={`btn btn-primary ${loading ? 'loading' : ''}`}
        onClick={requestFaucetTokens}
        disabled={loading || cooldown > 0}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {loading 
          ? 'Requesting...' 
          : cooldown > 0 
            ? `Wait ${cooldown}s` 
            : 'Request Test Tokens'
        }
      </button>

      {result && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '0.375rem',
          background: result.includes('Success') ? '#f0fdf4' : '#fef2f2',
          color: result.includes('Success') ? '#166534' : '#dc2626',
          fontSize: '0.875rem'
        }}>
          {result}
        </div>
      )}

      <div style={{ 
        marginTop: '1.5rem', 
        fontSize: '0.875rem', 
        color: '#6b7280' 
      }}>
        <p><strong>Need more tokens?</strong></p>
        <p>If you need larger amounts for testing, you can:</p>
        <ul>
          <li>Wait for the cooldown and request again</li>
          <li>Use multiple test addresses</li>
          <li>Contact the OneChain team for developer grants</li>
        </ul>
      </div>
    </div>
  );
};

export default FaucetTab;
