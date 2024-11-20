import { keccak_256 } from "@noble/hashes/sha3";
import { PROGRAM_ID } from "./constants";

export function deriveSeed(seeds: Uint8Array[]): Uint8Array {
  const combinedSeeds: Uint8Array[] = [PROGRAM_ID.toBytes(), ...seeds];

  const hash = hashvToBn254FieldSizeBe(combinedSeeds);

  return hash;
}

function hashvToBn254FieldSizeBe(bytes: Uint8Array[]): Uint8Array {
  const hasher = keccak_256.create();

  for (const input of bytes) {
    hasher.update(input);
  }

  const hash = hasher.digest();

  hash[0] = 0;

  return hash;
}
