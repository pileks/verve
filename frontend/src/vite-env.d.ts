/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLET_URL: string;
  readonly VITE_PAYER_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
