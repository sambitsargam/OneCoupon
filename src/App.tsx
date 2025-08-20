import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { networkConfig } from './config/network';
import Header from './components/Header';
import MerchantTab from './components/MerchantTab';
import MyCouponsTab from './components/MyCouponsTab';
import FaucetTab from './components/FaucetTab';
import ActivityTab from './components/ActivityTab';
import './App.css';

const queryClient = new QueryClient();

type Tab = 'merchant' | 'coupons' | 'faucet' | 'activity';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('merchant');
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

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
      <SuiClientProvider networks={networkConfig.networkConfig} defaultNetwork="testnet">
        <WalletProvider>
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
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
