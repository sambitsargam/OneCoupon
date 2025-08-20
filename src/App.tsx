import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@onelabs/dapp-kit';
import '@onelabs/dapp-kit/dist/index.css';

import LandingPage from './components/LandingPage';
import Header from './components/Header';
import MerchantTab from './components/MerchantTab';
import MyCouponsTab from './components/MyCouponsTab';
import FaucetTab from './components/FaucetTab';
import ActivityTab from './components/ActivityTab';
import NetworkDebug from './components/NetworkDebug';

import './App.css';

// OneChain network configuration
const networkConfig = {
  'onechain-testnet': { 
    url: 'https://rpc-testnet.onelabs.cc',
    variables: {
      chainName: 'OneChain Testnet',
      chainId: '0x1',
    },
  },
};

const queryClient = new QueryClient();

type Tab = 'merchant' | 'coupons' | 'faucet' | 'activity';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('merchant');
  const [network, setNetwork] = useState<'onechain-testnet' | 'onechain-mainnet'>('onechain-testnet');

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'merchant':
        return <MerchantTab network={network} />;
      case 'coupons':
        return <MyCouponsTab network={network} />;
      case 'faucet':
        return <FaucetTab />;
      case 'activity':
        return <ActivityTab />;
      default:
        return <MerchantTab network={network} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider 
        networks={networkConfig} 
        defaultNetwork="onechain-testnet"
        onNetworkChange={(network: string) => {
          console.log('Network changed to:', network);
        }}
      >
        <WalletProvider 
          autoConnect={false}
          enableUnsafeBurner={false}
          preferredWallets={["OneChain Wallet", "OneLabs Wallet"]}
        >
          {showLanding ? (
            <LandingPage onGetStarted={handleGetStarted} />
          ) : (
            <div className="app">
              <Header 
                network={network} 
                onNetworkChange={setNetwork}
              />
              
              <div className="container">
                <nav className="tabs">
                  <button 
                    className={`tab ${activeTab === 'merchant' ? 'active' : ''}`}
                    onClick={() => setActiveTab('merchant')}
                  >
                    Issue Coupons
                  </button>
                  <button 
                    className={`tab ${activeTab === 'coupons' ? 'active' : ''}`}
                    onClick={() => setActiveTab('coupons')}
                  >
                    My Coupons
                  </button>
                  <button 
                    className={`tab ${activeTab === 'faucet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('faucet')}
                  >
                    Faucet
                  </button>
                  <button 
                    className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                  >
                    Activity
                  </button>
                </nav>

                <main className="tab-content">
                  {renderTabContent()}
                </main>
              </div>
            </div>
          )}
          
          <NetworkDebug />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
