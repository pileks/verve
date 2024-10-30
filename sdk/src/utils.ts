import { Transaction, VersionedTransaction } from "@solana/web3.js";

export function isLegacyTransactionInstance(
  transaction: Transaction | VersionedTransaction
): transaction is Transaction {
  return (transaction as VersionedTransaction).version === undefined;
}
