import type { BN } from "@coral-xyz/anchor";
import {
  bn,
  buildTx,
  LightSystemProgram,
  Rpc,
  type CompressedAccount,
  type CompressedProofWithContext,
  type NewAddressParams,
} from "@lightprotocol/stateless.js";
import { keccak_256 } from "@noble/hashes/sha3";
import {
  ComputeBudgetProgram,
  type PublicKey,
  type TransactionInstruction,
  type VersionedTransaction,
} from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";
import type { InstructionAccountMeta } from "./types";

export function deriveSeed(seeds: Uint8Array[]): Uint8Array {
  const combinedSeeds: Uint8Array[] = [PROGRAM_ID.toBytes(), ...seeds];

  const hash = hashvToBn254FieldSizeBe(combinedSeeds);

  return hash;
}

export function hashvToBn254FieldSizeBe(bytes: Uint8Array[]): Uint8Array {
  const hasher = keccak_256.create();

  for (const input of bytes) {
    hasher.update(input);
  }

  const hash = hasher.digest();

  hash[0] = 0;

  return hash;
}

export function createNewAddressOutputState(
  address: PublicKey,
): CompressedAccount[] {
  return LightSystemProgram.createNewAddressOutputState(
    Array.from(address.toBytes()),
    PROGRAM_ID,
  );
}

export function getNewAddressParams(
  addressSeed: Uint8Array,
  proof: CompressedProofWithContext,
): NewAddressParams {
  const addressMerkleTreeRootIndex =
    proof.rootIndices[proof.rootIndices.length - 1];

  if (!addressMerkleTreeRootIndex) {
    throw "No addressMerkleTreeRootIndex";
  }

  const addressMerkleTreePubkey =
    proof.merkleTrees[proof.merkleTrees.length - 1];

  if (!addressMerkleTreePubkey) {
    throw "No addressMerkleTreePubkey";
  }

  const addressQueuePubkey =
    proof.nullifierQueues[proof.nullifierQueues.length - 1];

  if (!addressQueuePubkey) {
    throw "No addressQueuePubkey";
  }

  const addressParams: NewAddressParams = {
    seed: addressSeed,
    addressMerkleTreeRootIndex,
    addressMerkleTreePubkey,
    addressQueuePubkey,
  };

  return addressParams;
}

export async function buildTxWithComputeBudget(
  rpc: Rpc,
  instructions: TransactionInstruction[],
  payerPubkey: PublicKey,
): Promise<VersionedTransaction> {
  const setComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 2_000_000_000,
  });

  instructions.unshift(setComputeUnitIx);

  const { blockhash } = await rpc.getLatestBlockhash();

  return buildTx(instructions, payerPubkey, blockhash);
}

export function getInstructionAccountMeta(
  testIx: TransactionInstruction,
): InstructionAccountMeta {
  const accounts: PublicKey[] = [];
  const writables: boolean[] = [];
  const signers: boolean[] = [];

  for (const accountMeta of testIx.keys) {
    accounts.push(accountMeta.pubkey);
    writables.push(accountMeta.isWritable);
    signers.push(accountMeta.isSigner);
  }

  return { accounts, writables, signers };
}

export async function getValidityProof(
  rpc: Rpc,
  inputHashes?: BN[],
  newUniqueAddresses?: PublicKey[],
): Promise<CompressedProofWithContext> {
  const outputHashes = newUniqueAddresses?.map(addr => bn(addr.toBytes()));

  return await rpc.getValidityProof(inputHashes, outputHashes);
}
