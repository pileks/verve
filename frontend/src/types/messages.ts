export type WalletResponse = {
  // base64 encoded secret key
  secretKey: string;
  type: "secretkey";
};

export type PubkeyResponse = {
  // base64 encoded secret key
  pubkey: string;
  type: "pubkey";
};

export type TransactionRequest = {
  type: "transactionRequest",
  buffer: ArrayBuffer
}

export type TransactionResponse = {
  type: "transactionResponse",
  buffer: ArrayBuffer
}