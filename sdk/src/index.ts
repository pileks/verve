import type { TransactionInstruction } from "@solana/web3.js";

export function helloWorld(ix: TransactionInstruction): TransactionInstruction {
  return ix;
}
