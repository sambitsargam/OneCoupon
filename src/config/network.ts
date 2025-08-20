import { createNetworkConfig } from '@mysten/dapp-kit';

export type Network = 'testnet' | 'mainnet';

export const networkConfig = createNetworkConfig({
  testnet: {
    url: import.meta.env.VITE_TESTNET_RPC_URL || 'https://rpc-testnet.onelabs.cc',
    variables: {
      packageId: import.meta.env.VITE_PACKAGE_ID || '',
      faucetUrl: import.meta.env.VITE_FAUCET_URL || 'https://faucet-testnet.onelabs.cc/v1/gas',
    },
  },
  mainnet: {
    url: import.meta.env.VITE_MAINNET_RPC_URL || 'https://rpc-mainnet.onelabs.cc',
    variables: {
      packageId: import.meta.env.VITE_PACKAGE_ID || '',
      faucetUrl: '',
    },
  },
});

export const DEFAULT_NETWORK: Network = (import.meta.env.VITE_DEFAULT_NETWORK as Network) || 'testnet';

// Module and function names
export const MODULE_NAME = 'coupon';
export const MERCHANT_TYPE = 'Merchant';
export const COUPON_TYPE = 'Coupon';
