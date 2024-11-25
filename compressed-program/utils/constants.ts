import {
  CompressedProofWithContext,
  defaultStaticAccountsStruct as staticAccounts,
  defaultTestStateTreeAccounts as stateTree,
  LightSystemProgram,
  NewAddressParams,
} from "@lightprotocol/stateless.js";
import { keccak_256 } from "@noble/hashes/sha3";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export class AaPocConstants {
  static readonly programId: PublicKey = new PublicKey(
    "Y3Fdm2T4ipYdaFBKxQb8M4QE8EgpxWAMa7c3q72vQhn"
  );
  static readonly accountCompressionAuthority =
    staticAccounts().accountCompressionAuthority;
  static readonly accountCompressionProgram =
    staticAccounts().accountCompressionProgram;
  static readonly noopProgram = staticAccounts().noopProgram;
  static readonly registeredProgramPda = staticAccounts().registeredProgramPda;
  static readonly addressQueue = stateTree().addressQueue;
  static readonly addressTree = stateTree().addressTree;
  static readonly merkleTree = stateTree().merkleTree;
  static readonly nullifierQueue = stateTree().nullifierQueue;
  static readonly lightSystemProgram = LightSystemProgram.programId;
  static readonly systemProgram = SystemProgram.programId;
  static readonly cpiSigner = PublicKey.findProgramAddressSync(
    [Buffer.from("cpi_authority")],
    this.programId
  )[0];

  static lightAccounts() {
    return {
      cpiSigner: this.cpiSigner,
      selfProgram: this.programId,
      lightSystemProgram: this.lightSystemProgram,
      accountCompressionAuthority: this.accountCompressionAuthority,
      noopProgram: this.noopProgram,
      registeredProgramPda: this.registeredProgramPda,
      accountCompressionProgram: this.accountCompressionProgram,
      systemProgram: this.systemProgram,
    };
  }

  protected static createNewAddressOutputState(address: PublicKey) {
    return LightSystemProgram.createNewAddressOutputState(
      Array.from(address.toBytes()),
      this.programId
    );
  }

  protected static getNewAddressParams(
    addressSeed: Uint8Array,
    proof: CompressedProofWithContext
  ) {
    const addressParams: NewAddressParams = {
      seed: addressSeed,
      addressMerkleTreeRootIndex:
        proof.rootIndices[proof.rootIndices.length - 1],
      addressMerkleTreePubkey: proof.merkleTrees[proof.merkleTrees.length - 1],
      addressQueuePubkey:
        proof.nullifierQueues[proof.nullifierQueues.length - 1],
    };

    return addressParams;
  }

  static hashvToBn254FieldSizeBe(bytes: Uint8Array[]): Uint8Array {
    const hasher = keccak_256.create();

    for (const input of bytes) {
      hasher.update(input);
    }

    const hash = hasher.digest();

    hash[0] = 0;

    return hash;
  }

  static deriveSeed(seeds: Uint8Array[]): Uint8Array {
    const combinedSeeds: Uint8Array[] = [this.programId.toBytes(), ...seeds];

    const hash = this.hashvToBn254FieldSizeBe(combinedSeeds);

    return hash;
  }
}

export enum AaError {
  GuardianMismatch = "Guardian mismatch",
  WalletMismatch = "Wallet mismatch",
  InvalidGuardianSignature = "Invalid guardian signature",
}

export const PDA_WALLET_SEED: Uint8Array = Buffer.from("w");
export const PDA_WALLET_GUARDIAN_SEED: Uint8Array = Buffer.from("wg");
