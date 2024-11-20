import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID: PublicKey = new PublicKey(
  "Y3Fdm2T4ipYdaFBKxQb8M4QE8EgpxWAMa7c3q72vQhn",
);

export enum AaError {
  GuardianMismatch = "Guardian mismatch",
  WalletMismatch = "Wallet mismatch",
  InvalidGuardianSignature = "Invalid guardian signature",
}

export const PDA_WALLET_SEED: Uint8Array = Buffer.from("w");
export const PDA_WALLET_GUARDIAN_SEED: Uint8Array = Buffer.from("wg");
