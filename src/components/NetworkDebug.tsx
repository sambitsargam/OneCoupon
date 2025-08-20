import React from 'react';
import { useSuiClient, useCurrentAccount } from '@onelabs/dapp-kit';

const NetworkDebug: React.FC = () => {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [chainId, setChainId] = React.useState<string>('');

  React.useEffect(() => {
    const checkNetwork = async () => {
      if (suiClient) {
        try {
          // Get chain identifier
          const chainIdentifier = await suiClient.getChainIdentifier();
          setChainId(chainIdentifier);
          
          // Get RPC URL from the client
          const url = (suiClient as any).options?.url || 'Unknown';
          setRpcUrl(url);
          
          console.log('=== NETWORK DEBUG ===');
          console.log('Chain ID:', chainIdentifier);
          console.log('Connected Account:', currentAccount?.address);
          console.log('==================');
        } catch (error) {
          console.error('Error checking network:', error);
        }
      }
    };

    checkNetwork();
  }, [suiClient, currentAccount]);

  if (!suiClient) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <div><strong>Network Debug</strong></div>
      <div>Chain ID: {chainId || 'Loading...'}</div>
      <div>Wallet: {currentAccount ? 'Connected' : 'Not connected'}</div>
      {currentAccount && (
        <div>Address: {currentAccount.address.slice(0, 10)}...</div>
      )}
    </div>
  );
};

export default NetworkDebug;
