import { AnchorProvider, BN, Program, setProvider } from "@coral-xyz/anchor";
import { CompressedAaPoc } from "../target/types/compressed_aa_poc";
import { WalletGuardian } from "./types";
import {
  AaPocConstants,
  PDA_WALLET_GUARDIAN_SEED,
  PDA_WALLET_SEED,
} from "./constants";
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
  deriveAddress,
  getIndexOrAdd,
  NewAddressParams,
  packCompressedAccounts,
  PackedMerkleContext,
  packNewAddressParams,
  Rpc,
  toAccountMetas,
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

  static async initWalletTx(
    rpc: Rpc,
    assignGuardian: PublicKey
  ): Promise<{
    transaction: VersionedTransaction;
    walletGuardianAddress: PublicKey;
  }> {
    const { instruction, walletGuardianAddress } = await this.initWalletIx(
      rpc,
      assignGuardian
    );

    const tx = await this.buildTxWithComputeBudget(
      rpc,
      [instruction],
      assignGuardian
    );

    return { transaction: tx, walletGuardianAddress };
  }

  static async registerKeypairTx(
    rpc: Rpc,
    seedGuardian: PublicKey,
    assignGuardian: PublicKey
  ) {
    const { instruction, walletGuardianAddress } = await this.registerKeypairIx(
      rpc,
      seedGuardian,
      assignGuardian
    );

    const tx = await this.buildTxWithComputeBudget(
      rpc,
      [instruction],
      seedGuardian
    );

    return { transaction: tx, walletGuardianAddress };
  }

  static async execInstructionTx(
    rpc: Rpc,
    seedGuardian: PublicKey,
    guardian: PublicKey,
    testIx: TransactionInstruction
  ) {
    const { instruction, walletGuardianAddress } = await this.execInstructionIx(
      rpc,
      seedGuardian,
      guardian,
      testIx
    );

    const tx = await this.buildTxWithComputeBudget(
      rpc,
      [instruction],
      guardian
    );

    return { transaction: tx, walletGuardianAddress };
  }

  private static async initWalletIx(rpc: Rpc, assignGuardian: PublicKey) {
    const wallet = this.deriveWalletAddress(assignGuardian);

    const walletGuardianSeed = this.deriveWalletGuardianSeed(
      wallet,
      assignGuardian
    );

    const walletGuardianAddress: PublicKey = deriveAddress(
      walletGuardianSeed,
      this.addressTree
    );

    console.log("walletGuardianAddress: ", walletGuardianAddress.toBase58());

    const newUniqueAddresses: PublicKey[] = [];

    newUniqueAddresses.push(walletGuardianAddress);

    const proof = await this.getValidityProof(
      rpc,
      undefined,
      newUniqueAddresses
    );

    const newAddressesParams: NewAddressParams[] = [];

    newAddressesParams.push(
      this.getNewAddressParams(walletGuardianSeed, proof)
    );

    const outputCompressedAccounts: CompressedAccount[] = [];

    outputCompressedAccounts.push(
      ...this.createNewAddressOutputState(walletGuardianAddress)
    );

    console.log(
      `newUniqueAddresses length: ${newUniqueAddresses.length}`,
      `outputCompressedAccounts length: ${outputCompressedAccounts.length}`,
      `newAddressesParams length: ${newAddressesParams.length}`
    );

    const {
      addressMerkleContext,
      addressMerkleTreeRootIndex,
      merkleContext,
      remainingAccounts,
    } = this.packNew(outputCompressedAccounts, newAddressesParams, proof);

    const ix = await CompressedAaPocProgram.getInstance()
      .program.methods.initWallet(
        [], // inputs
        proof.compressedProof, // proof
        merkleContext, // merkleContext
        0, // merkleTreeRootIndex
        addressMerkleContext, // addressMerkleContext
        addressMerkleTreeRootIndex // addressMerkleTreeRootIndex
      )
      .accounts({
        payer: assignGuardian,
        assignGuardian: assignGuardian,
        wallet: wallet,
        ...this.lightAccounts(),
      })
      .remainingAccounts(toAccountMetas(remainingAccounts))
      .instruction();

    return {
      instruction: ix,
      walletGuardianAddress,
    };
  }

  private static async registerKeypairIx(
    rpc: Rpc,
    seedGuardian: PublicKey,
    assignGuardian: PublicKey
  ) {
    const wallet = this.deriveWalletAddress(seedGuardian);

    const walletGuardianSeed = this.deriveWalletGuardianSeed(
      wallet,
      assignGuardian
    );

    const walletGuardianAddress: PublicKey = deriveAddress(
      walletGuardianSeed,
      this.addressTree
    );

    console.log(
      "new walletGuardianAddress: ",
      walletGuardianAddress.toBase58()
    );

    const newUniqueAddresses: PublicKey[] = [];

    newUniqueAddresses.push(walletGuardianAddress);

    const proof = await this.getValidityProof(
      rpc,
      undefined,
      newUniqueAddresses
    );

    const newAddressesParams: NewAddressParams[] = [];

    newAddressesParams.push(
      this.getNewAddressParams(walletGuardianSeed, proof)
    );

    const outputCompressedAccounts: CompressedAccount[] = [];

    outputCompressedAccounts.push(
      ...this.createNewAddressOutputState(walletGuardianAddress)
    );

    console.log(
      `newUniqueAddresses length: ${newUniqueAddresses.length}`,
      `outputCompressedAccounts length: ${outputCompressedAccounts.length}`,
      `newAddressesParams length: ${newAddressesParams.length}`
    );

    const {
      addressMerkleContext,
      addressMerkleTreeRootIndex,
      merkleContext,
      remainingAccounts,
    } = this.packNew(outputCompressedAccounts, newAddressesParams, proof);

    const ix = await CompressedAaPocProgram.getInstance()
      .program.methods.registerKeypair(
        [], // inputs
        proof.compressedProof, // proof
        merkleContext, // merkleContext
        0, // merkleTreeRootIndex
        addressMerkleContext, // addressMerkleContext
        addressMerkleTreeRootIndex // addressMerkleTreeRootIndex
      )
      .accounts({
        payer: seedGuardian,
        seedGuardian: seedGuardian,
        assignGuardian: assignGuardian,
        wallet: wallet,
        ...this.lightAccounts(),
      })
      .remainingAccounts(toAccountMetas(remainingAccounts))
      .instruction();

    return {
      instruction: ix,
      walletGuardianAddress,
    };
  }

  private static async execInstructionIx(
    rpc: Rpc,
    seedGuardian: PublicKey,
    guardian: PublicKey,
    testIx: TransactionInstruction
  ) {
    const wallet = this.deriveWalletAddress(seedGuardian);

    const walletGuardianSeed = this.deriveWalletGuardianSeed(wallet, guardian);

    const walletGuardianAddress: PublicKey = deriveAddress(
      walletGuardianSeed,
      this.addressTree
    );

    const walletGuardianAccount = await rpc.getCompressedAccount(
      new BN(walletGuardianAddress.toBytes())
    );

    const inputleafhashes = [bn(walletGuardianAccount.hash)];

    const proof = await this.getValidityProof(rpc, inputleafhashes, []);

    const outputCompressedAccounts: CompressedAccount[] = [];

    outputCompressedAccounts.push(
      ...this.createNewAddressOutputState(walletGuardianAddress)
    );

    const newAddressesParams = [];
    newAddressesParams.push(
      this.getNewAddressParams(walletGuardianSeed, proof)
    );

    const { accounts, writables, signers } =
      this.getAccountsWritablesSignersForInstruction(testIx);

    const {
      addressMerkleContext,
      addressMerkleTreeRootIndex,
      merkleContext,
      rootIndex,
      remainingAccounts,
    } = this.packWithInput(
      [walletGuardianAccount],
      outputCompressedAccounts,
      newAddressesParams,
      proof
    );

    const ix = await CompressedAaPocProgram.getInstance()
      .program.methods.execInstruction(
        [walletGuardianAccount.data.data], // inputs
        proof.compressedProof, // proof
        merkleContext, // merkleContext
        rootIndex, // merkleTreeRootIndex
        addressMerkleContext, // addressMerkleContext
        addressMerkleTreeRootIndex, // addressMerkleTreeRootIndex
        testIx.data,
        accounts,
        writables,
        signers
      )
      .accounts({
        payer: guardian,
        seedGuardian: seedGuardian,
        guardian: guardian,
        wallet: wallet,
        ...this.lightAccounts(),
      })
      .remainingAccounts(toAccountMetas(remainingAccounts))
      .instruction();

    return {
      instruction: ix,
      walletGuardianAddress,
    };
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
  ): Promise<CompressedProofWithContext> {
    const outputHashes = newUniqueAddresses?.map((addr) => bn(addr.toBytes()));

    return await rpc.getValidityProof(inputHashes, outputHashes);
  }

  static async getWalletGuardianAccountData(
    rpc: Rpc,
    walletGuardianAccountAddress: PublicKey
  ): Promise<WalletGuardian> {
    const walletGuardianAccount = await rpc.getCompressedAccount(
      new BN(walletGuardianAccountAddress.toBytes())
    );

    return this.decodeTypes<WalletGuardian>(
      "WalletGuardian",
      walletGuardianAccount.data.data
    );
  }

  static deriveWalletAddress(assignGuardian: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [PDA_WALLET_SEED, assignGuardian.toBytes()],
      this.programId
    )[0];
  }

  static deriveWalletGuardianSeed(
    wallet: PublicKey,
    assignGuardian: PublicKey
  ): Uint8Array {
    return this.deriveSeed([
      PDA_WALLET_GUARDIAN_SEED,
      wallet.toBytes(),
      assignGuardian.toBytes(),
    ]);
  }

  static decodeTypes<T>(typeName: string, data: Buffer): T {
    return CompressedAaPocProgram.getInstance().program.coder.types.decode<T>(
      typeName,
      data
    );
  }

  static getAccountsWritablesSignersForInstruction(
    testIx: TransactionInstruction
  ) {
    const accounts: PublicKey[] = [];
    const writables: boolean[] = [];
    const signers: boolean[] = [];

    for (let accountMeta of testIx.keys) {
      accounts.push(accountMeta.pubkey);
      writables.push(accountMeta.isWritable);
      signers.push(accountMeta.isSigner);
    }

    return { accounts, writables, signers };
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
