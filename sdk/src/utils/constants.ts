import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID: PublicKey = new PublicKey("");

export enum AaError {
  GuardianMismatch = "Guardian mismatch",
  WalletMismatch = "Wallet mismatch",
  InvalidGuardianSignature = "Invalid guardian signature",
}

export const PDA_WALLET_SEED: Uint8Array = Buffer.from("w");
export const PDA_WALLET_GUARDIAN_SEED: Uint8Array = Buffer.from("wg");
