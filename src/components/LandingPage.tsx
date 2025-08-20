import React from 'react';
import { useCurrentAccount, useConnectWallet, useWallets } from '@onelabs/dapp-kit';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const currentAccount = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const wallets = useWallets();

  const handleConnectWallet = async () => {
    const firstWallet = wallets[0];
    if (firstWallet) {
      connect({ wallet: firstWallet });
    }
  };

  React.useEffect(() => {
    if (currentAccount) {
      onGetStarted();
    }
  }, [currentAccount, onGetStarted]);

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="hero-section">
          <h1 className="hero-title">OneCoupon</h1>
          <p className="hero-subtitle">
            Revolutionary tokenized retail coupons on OneChain
          </p>
          <p className="hero-description">
            Create, distribute, and redeem digital coupons as blockchain tokens. 
            Secure, transparent, and efficient coupon management for merchants and customers.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏪</div>
            <h3>For Merchants</h3>
            <p>Issue digital coupons as blockchain tokens with custom discounts and expiration dates</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>For Customers</h3>
            <p>Collect, transfer, and redeem tokenized coupons with full ownership and transparency</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Blockchain Security</h3>
            <p>Built on OneChain with immutable records and fraud-proof coupon verification</p>
          </div>
        </div>

        <div className="cta-section">
          <div className="wallet-status">
            {currentAccount ? (
              <div className="connected-wallet">
                <span className="status-indicator connected"></span>
                <span>Wallet Connected</span>
                <p className="wallet-address">
                  {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                </p>
              </div>
            ) : (
              <div className="connect-wallet">
                <span className="status-indicator disconnected"></span>
                <span>Connect your OneChain wallet to get started</span>
              </div>
            )}
          </div>
          
          {!currentAccount ? (
            <button 
              className="cta-button"
              onClick={handleConnectWallet}
              disabled={wallets.length === 0}
            >
              {wallets.length === 0 ? 'Install OneChain Wallet' : 'Connect Wallet'}
            </button>
          ) : (
            <button 
              className="cta-button"
              onClick={onGetStarted}
            >
              Launch App
            </button>
          )}
          
          {wallets.length === 0 && (
            <p className="wallet-hint">
              Please install a OneChain compatible wallet to continue
            </p>
          )}
        </div>

        <div className="network-info">
          <p>Running on OneChain Testnet</p>
          <p>Ready for production deployment</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
