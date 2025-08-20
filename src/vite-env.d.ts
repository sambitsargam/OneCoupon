/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TESTNET_RPC_URL: string
  readonly VITE_MAINNET_RPC_URL: string
  readonly VITE_PACKAGE_ID: string
  readonly VITE_DEFAULT_NETWORK: string
  readonly VITE_FAUCET_URL: string
  readonly VITE_EXPLORER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
