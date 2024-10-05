import { AnchorProvider, BN, Program, setProvider } from "@coral-xyz/anchor";
import { CompressedAaPoc } from "../target/types/compressed_aa_poc";
import { AaPocConstants } from "./constants";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  bn,
  buildTx,
  CompressedAccount,
  CompressedAccountWithMerkleContext,
  CompressedProofWithContext,
  confirmConfig,
  getIndexOrAdd,
  NewAddressParams,
  packCompressedAccounts,
  PackedMerkleContext,
  packNewAddressParams,
  Rpc,
  useWallet,
} from "@lightprotocol/stateless.js";
import idl from "../target/idl/compressed_aa_poc.json";

export class CompressedAaPocProgram extends AaPocConstants {
  private static instance: CompressedAaPocProgram;

  private _program: Program<CompressedAaPoc> | null = null;

  private constructor() {
    super();
  }

  static getInstance(): CompressedAaPocProgram {
    if (!CompressedAaPocProgram.instance) {
      CompressedAaPocProgram.instance = new CompressedAaPocProgram();
    }
    return CompressedAaPocProgram.instance;
  }

  get program(): Program<CompressedAaPoc> {
    if (!this._program) {
      this.initializeProgram();
    }
    return this._program!;
  }

  private initializeProgram(): void {
    if (!this._program) {
      const mockKeypair = Keypair.generate();
      const mockConnection = new Connection(
        "http://127.0.0.1:8899",
        "confirmed"
      );
      const mockProvider = new AnchorProvider(
        mockConnection,
        useWallet(mockKeypair),
        confirmConfig
      );
      setProvider(mockProvider);
      this._program = new Program(
        idl as CompressedAaPoc,
        CompressedAaPocProgram.programId,
        mockProvider
      );
    }
  }

  static async initWalletIx(rpc: Rpc, payer: PublicKey) {
    const derivationKey = new Keypair().publicKey;

    const walletSeed = this.deriveWalletSeed(derivationKey);

    const ix = await CompressedAaPocProgram.getInstance()
      .program.methods.initWallet()
      .accounts({ ...this.lightAccounts() })
      .instruction();
  }

  private static packWithInput(
    inputCompressedAccounts: CompressedAccountWithMerkleContext[],
    outputCompressedAccounts: CompressedAccount[],
    newAddressesParams: NewAddressParams[],
    proof: CompressedProofWithContext
  ) {
    const {
      packedInputCompressedAccounts,
      remainingAccounts: _remainingAccounts,
    } = packCompressedAccounts(
      inputCompressedAccounts,
      proof.rootIndices,
      outputCompressedAccounts
    );
    const { newAddressParamsPacked, remainingAccounts } = packNewAddressParams(
      newAddressesParams,
      _remainingAccounts
    );
    let {
      addressMerkleTreeAccountIndex,
      addressMerkleTreeRootIndex,
      addressQueueAccountIndex,
    } = newAddressParamsPacked[0];
    let { rootIndex, merkleContext } = packedInputCompressedAccounts[0];

    return {
      addressMerkleContext: {
        addressMerkleTreePubkeyIndex: addressMerkleTreeAccountIndex,
        addressQueuePubkeyIndex: addressQueueAccountIndex,
      },
      addressMerkleTreeRootIndex,
      merkleContext,
      rootIndex,
      remainingAccounts,
    };
  }

  private static packNew(
    outputCompressedAccounts: CompressedAccount[],
    newAddressesParams: NewAddressParams[],
    proof: CompressedProofWithContext
  ) {
    const { remainingAccounts: _remainingAccounts } = packCompressedAccounts(
      [],
      proof.rootIndices,
      outputCompressedAccounts
    );
    const { newAddressParamsPacked, remainingAccounts } = packNewAddressParams(
      newAddressesParams,
      _remainingAccounts
    );
    let {
      addressMerkleTreeAccountIndex,
      addressMerkleTreeRootIndex,
      addressQueueAccountIndex,
    } = newAddressParamsPacked[0];
    let merkleContext: PackedMerkleContext = {
      leafIndex: 0,
      merkleTreePubkeyIndex: getIndexOrAdd(remainingAccounts, this.merkleTree),
      nullifierQueuePubkeyIndex: getIndexOrAdd(
        remainingAccounts,
        this.nullifierQueue
      ),
      queueIndex: null,
    };
    return {
      addressMerkleContext: {
        addressMerkleTreePubkeyIndex: addressMerkleTreeAccountIndex,
        addressQueuePubkeyIndex: addressQueueAccountIndex,
      },
      addressMerkleTreeRootIndex,
      merkleContext,
      remainingAccounts,
    };
  }

  protected static async getValidityProof(
    rpc: Rpc,
    inputHashes?: BN[],
    newUniqueAddresses?: PublicKey[]
  ) {
    const outputHashes = newUniqueAddresses?.map((addr) => bn(addr.toBytes()));

    return await rpc.getValidityProof(inputHashes, outputHashes);
  }

  static async buildTxWithComputeBudget(
    rpc: Rpc,
    instructions: TransactionInstruction[],
    payerPubkey: PublicKey
  ): Promise<VersionedTransaction> {
    const setComputeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_000_000,
    });

    instructions.unshift(setComputeUnitIx);

    const { blockhash } = await rpc.getLatestBlockhash();

    const transaction = buildTx(instructions, payerPubkey, blockhash);

    return transaction;
  }
}
