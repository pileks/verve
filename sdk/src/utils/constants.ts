import { PublicKey, SystemProgram } from "@solana/web3.js";
import type { LightAccounts } from "./types";
import {
  defaultStaticAccountsStruct,
  defaultTestStateTreeAccounts,
  LightSystemProgram,
} from "@lightprotocol/stateless.js";

export const PROGRAM_ID: PublicKey = new PublicKey(
  "Y3Fdm2T4ipYdaFBKxQb8M4QE8EgpxWAMa7c3q72vQhn",
);

export enum AaError {
  GuardianMismatch = "Guardian mismatch",
  WalletMismatch = "Wallet mismatch",
  InvalidGuardianSignature = "Invalid guardian signature",
}

export const LIGHT_STATE_TREE_ACCOUNTS = defaultTestStateTreeAccounts();

export const LIGHT_ACCOUNTS: LightAccounts = {
  accountCompressionAuthority:
    defaultStaticAccountsStruct().accountCompressionAuthority,
  accountCompressionProgram:
    defaultStaticAccountsStruct().accountCompressionProgram,
  cpiSigner: PublicKey.findProgramAddressSync(
    [Buffer.from("cpi_authority")],
    PROGRAM_ID,
  )[0],
  lightSystemProgram: LightSystemProgram.programId,
  noopProgram: defaultStaticAccountsStruct().noopProgram,
  registeredProgramPda: defaultStaticAccountsStruct().registeredProgramPda,
  selfProgram: PROGRAM_ID,
  systemProgram: SystemProgram.programId,
};

export const PDA_WALLET_SEED: Uint8Array = Buffer.from("w");
export const PDA_WALLET_GUARDIAN_SEED: Uint8Array = Buffer.from("wg");
