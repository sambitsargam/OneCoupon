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
    try {
      // Prioritize OneChain wallet detection
      let availableWallet = wallets.find(wallet => {
        return wallet && wallet.name && (
          wallet.name.toLowerCase().includes('onechain') ||
          wallet.name.toLowerCase().includes('onelabs')
        ) && wallet.features && wallet.features['standard:connect']
      });
      
      // Fallback to any wallet with connect feature
      if (!availableWallet) {
        availableWallet = wallets.find(wallet => {
          return wallet && wallet.features && wallet.features['standard:connect']
        });
      }
      
      if (!availableWallet) {
        console.error("No OneChain wallet found. Please install the OneChain wallet extension.");
        return;
      }

      console.log('Connecting to wallet:', availableWallet.name);

      connect(
        { wallet: availableWallet },
        {
          onSuccess: () => {
            console.log(`Connected to ${availableWallet.name} successfully!`);
          },
          onError: (error) => {
            console.error("Wallet connection error:", error);
          },
        },
      );
    } catch (error) {
      console.error("Connect function error:", error);
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
            Revolutionary Tokenized Retail Coupons on OneChain Blockchain
          </p>
          <p className="hero-description">
            Transform traditional coupon systems with blockchain technology. Create, distribute, 
            and redeem digital coupons as secure, transferable tokens on OneChain's high-performance network.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏪</div>
            <h3>For Merchants</h3>
            <ul>
              <li>Issue digital coupons as blockchain tokens</li>
              <li>Set custom discount amounts and expiration dates</li>
              <li>Track coupon usage with transparent analytics</li>
              <li>Prevent fraud with immutable coupon verification</li>
              <li>Integrate with existing POS systems</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>For Customers</h3>
            <ul>
              <li>Own your coupons as transferable digital assets</li>
              <li>Trade coupons with other users securely</li>
              <li>Access coupon history and usage analytics</li>
              <li>Receive coupons instantly via blockchain</li>
              <li>No more lost or expired paper coupons</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Blockchain Advantages</h3>
            <ul>
              <li>Built on OneChain's high-speed infrastructure</li>
              <li>Sub-second transaction finality</li>
              <li>Ultra-low gas fees (fractions of a cent)</li>
              <li>Immutable coupon records prevent fraud</li>
              <li>Decentralized and censorship-resistant</li>
            </ul>
          </div>
        </div>

        <div className="tech-specs">
          <h2>Technical Specifications</h2>
          <div className="specs-grid">
            <div className="spec-item">
              <strong>Smart Contract Language:</strong> Move on OneChain
            </div>
            <div className="spec-item">
              <strong>Network:</strong> OneChain Testnet/Mainnet
            </div>
            <div className="spec-item">
              <strong>Transaction Speed:</strong> Sub-second finality
            </div>
            <div className="spec-item">
              <strong>Gas Fees:</strong> Ultra-low (less than $0.01 per transaction)
            </div>
            <div className="spec-item">
              <strong>Wallet Support:</strong> OneChain Wallet, OneLabs Wallet
            </div>
            <div className="spec-item">
              <strong>Standards:</strong> OneChain Object Model
            </div>
          </div>
        </div>

        <div className="use-cases">
          <h2>Real-World Use Cases</h2>
          <div className="use-case-grid">
            <div className="use-case">
              <h4>🛍️ Retail Stores</h4>
              <p>Issue seasonal discounts, loyalty rewards, and promotional coupons that customers can own and trade</p>
            </div>
            <div className="use-case">
              <h4>🍕 Restaurants</h4>
              <p>Create limited-time offers and referral coupons that build viral marketing through sharing</p>
            </div>
            <div className="use-case">
              <h4>🎮 Gaming</h4>
              <p>Distribute in-game discount codes and exclusive offers as collectible digital assets</p>
            </div>
            <div className="use-case">
              <h4>✈️ Travel & Hospitality</h4>
              <p>Issue transferable travel vouchers and booking discounts with transparent expiration tracking</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <div className="wallet-status">
            {currentAccount ? (
              <div className="connected-wallet">
                <span className="status-indicator connected"></span>
                <span>OneChain Wallet Connected</span>
                <p className="wallet-address">
                  {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-6)}
                </p>
              </div>
            ) : (
              <div className="connect-wallet">
                <span className="status-indicator disconnected"></span>
                <span>Connect your OneChain wallet to get started</span>
                {wallets.length > 0 && (
                  <p className="detected-wallets">
                    Detected: {wallets.map(w => w.name).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {!currentAccount ? (
            <button 
              className="cta-button"
              onClick={handleConnectWallet}
              disabled={wallets.length === 0}
            >
              {wallets.length === 0 ? 'Install OneChain Wallet' : 'Connect OneChain Wallet'}
            </button>
          ) : (
            <button 
              className="cta-button"
              onClick={onGetStarted}
            >
              Launch OneCoupon App
            </button>
          )}
          
          {wallets.length === 0 && (
            <div className="wallet-install-section">
              <p className="wallet-hint">
                Please install a OneChain compatible wallet to continue
              </p>
              <div className="wallet-options">
                <button 
                  className="wallet-install-btn"
                  onClick={() => window.open('https://chrome.google.com/webstore/detail/onechain-wallet', '_blank')}
                >
                  Install OneChain Wallet
                </button>
                <button 
                  className="wallet-install-btn"
                  onClick={() => window.open('https://chrome.google.com/webstore/detail/onelabs-wallet', '_blank')}
                >
                  Install OneLabs Wallet
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="network-info">
          <div className="network-badge">
            <span className="network-dot"></span>
            <span>Connected to OneChain Testnet</span>
          </div>
          <p>Free test tokens available via built-in faucet</p>
          <p>Ready for mainnet deployment with production features</p>
        </div>

        <div className="footer-links">
          <a href="https://doc-testnet.onelabs.cc" target="_blank" rel="noopener noreferrer">
            OneChain Documentation
          </a>
          <a href="https://github.com/sambitsargam/OneCoupon" target="_blank" rel="noopener noreferrer">
            View Source Code
          </a>
          <a href="https://onescan.cc" target="_blank" rel="noopener noreferrer">
            OneChain Explorer
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
