import { createNetworkConfig } from '@onelabs/dapp-kit';
import { SuiClient } from '@mysten/sui/client';

export type Network = 'onechain-testnet' | 'onechain-mainnet';

// Create OneChain-specific network configuration
export const networkConfig = createNetworkConfig({
  'onechain-testnet': {
    url: import.meta.env.VITE_TESTNET_RPC_URL || 'https://rpc-testnet.onelabs.cc',
    variables: {
      packageId: import.meta.env.VITE_PACKAGE_ID || '',
      faucetUrl: import.meta.env.VITE_FAUCET_URL || 'https://faucet-testnet.onelabs.cc/v1/gas',
    },
  },
  'onechain-mainnet': {
    url: import.meta.env.VITE_MAINNET_RPC_URL || 'https://rpc-mainnet.onelabs.cc',
    variables: {
      packageId: import.meta.env.VITE_PACKAGE_ID || '',
      faucetUrl: '',
    },
  },
});

// Create OneChain client instances
export const onechainTestnetClient = new SuiClient({
  url: 'https://rpc-testnet.onelabs.cc'
});

export const onechainMainnetClient = new SuiClient({
  url: 'https://rpc-mainnet.onelabs.cc'
});

export const DEFAULT_NETWORK: Network = (import.meta.env.VITE_DEFAULT_NETWORK as Network) || 'onechain-testnet';

// Module and function names
export const MODULE_NAME = 'coupon';
export const MERCHANT_TYPE = 'Merchant';
export const COUPON_TYPE = 'Coupon';
