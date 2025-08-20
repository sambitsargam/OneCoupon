import React from 'react';
import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useWallets } from '@onelabs/dapp-kit';

interface HeaderProps {
  network: 'testnet' | 'mainnet';
  onNetworkChange: (network: 'testnet' | 'mainnet') => void;
}

const Header: React.FC<HeaderProps> = ({ network, onNetworkChange }) => {
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();

  const handleConnect = () => {
    const firstWallet = wallets[0];
    if (firstWallet) {
      connect({ wallet: firstWallet });
    }
  };

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address);
      // You can add a toast notification here
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '1rem 2rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h1 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem', fontWeight: 'bold' }}>
          OneCoupon
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
          Tokenized Retail Coupons on OneChain
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Network Selector */}
        <select 
          value={network} 
          onChange={(e) => onNetworkChange(e.target.value as 'testnet' | 'mainnet')}
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            background: 'white'
          }}
        >
          <option value="testnet">Testnet</option>
          <option value="mainnet">Mainnet</option>
        </select>

        {/* Wallet Connection */}
        {currentAccount ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={copyAddress}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              {formatAddress(currentAccount.address)}
            </button>
            <button onClick={() => disconnect()} className="btn btn-secondary">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={handleConnect} className="btn btn-primary">
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
