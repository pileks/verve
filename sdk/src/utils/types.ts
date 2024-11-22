import type { PublicKey } from "@solana/web3.js";

export interface WalletGuardian {
  wallet: PublicKey;
  guardian: PublicKey;
}

export interface VerveInstruction {
  data: Buffer;
  accountIndices: Buffer;
  writableAccounts: Array<boolean>;
  signerAccounts: Array<boolean>;
  programAccountIndex: number;
}

export interface LightAccounts {
  accountCompressionAuthority: PublicKey;
  accountCompressionProgram: PublicKey;
  cpiSigner: PublicKey;
  lightSystemProgram: PublicKey;
  noopProgram: PublicKey;
  registeredProgramPda: PublicKey;
  selfProgram: PublicKey;
  systemProgram: PublicKey;
}
