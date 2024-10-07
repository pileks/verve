import { PublicKey } from "@solana/web3.js";

export interface WalletGuardian {
  wallet: PublicKey;
  guardian: PublicKey;
}
