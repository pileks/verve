import { BN, getProvider, Program } from "@coral-xyz/anchor";
import { CompressedAaPoc } from "../target/types/compressed_aa_poc";
import { WalletGuardian } from "./types";
import {
  AaPocConstants,
  PDA_WALLET_GUARDIAN_SEED,
  PDA_WALLET_SEED,
} from "./constants";
import {
  AccountMeta,
  ComputeBudgetProgram,
  PublicKey,
  Signer,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  bn,
  buildTx,
  CompressedAccount,
  CompressedAccountWithMerkleContext,
  CompressedProofWithContext,
  deriveAddress,
  getIndexOrAdd,
  NewAddressParams,
  packCompressedAccounts,
  PackedMerkleContext,
  packNewAddressParams,
  Rpc,
  toAccountMetas,
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
      const provider = getProvider();

      this._program = new Program(
        idl as CompressedAaPoc,
        CompressedAaPocProgram.programId,
        provider
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
    testIx: TransactionInstruction,
    signers: Array<Signer>
  ) {
    const { instruction, walletGuardianAddress } = await this.execInstructionIx(
      rpc,
      seedGuardian,
      guardian,
      testIx,
      signers
    );

    const tx = await this.buildTxWithComputeBudget(
      rpc,
      [instruction],
      seedGuardian
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
    testIx: TransactionInstruction,
    ixSigners: Array<Signer>
  ) {
    const wallet = this.deriveWalletAddress(seedGuardian);

    const walletGuardianSeed = this.deriveWalletGuardianSeed(wallet, guardian); // address_seed

    const walletGuardianAddress: PublicKey = deriveAddress(
      walletGuardianSeed,
      this.addressTree
    );

    const walletGuardianAccount = await rpc.getCompressedAccount(
      new BN(walletGuardianAddress.toBytes())
    );

    const walletGuardianAccountProof = await rpc.getCompressedAccountProof(
      new BN(walletGuardianAccount.hash)
    );
    const inputleafhashes = [bn(walletGuardianAccount.hash)];

    const proof = await this.getValidityProof(rpc, inputleafhashes, undefined);

    const outputCompressedAccounts: CompressedAccount[] = [];

    outputCompressedAccounts.push(
      ...this.createNewAddressOutputState(walletGuardianAddress)
    );

    const address_merkle_context = {
      address_merkle_tree_pubkey: this.addressTree,
      address_queue_pubkey: this.addressQueue,
    };

    const remaining_accounts: PublicKey[] = [];

    remaining_accounts.push(
      address_merkle_context.address_merkle_tree_pubkey,
      address_merkle_context.address_queue_pubkey
    );

    const address_merkle_context_indexes = {
      addressMerkleTreePubkeyIndex: 0,
      addressQueuePubkeyIndex: 1,
    };

    const {
      packedInputCompressedAccounts,
      packedOutputCompressedAccounts,
      remainingAccounts: remaining_accounts_1,
    } = packCompressedAccounts(
      [walletGuardianAccount],
      [walletGuardianAccountProof.rootIndex],
      [],
      this.merkleTree,
      remaining_accounts
    );

    let { rootIndex: root_index, merkleContext: merkle_context } =
      packedInputCompressedAccounts[0];

    console.log("ROOT INDEX", root_index);
    console.log("MC", merkle_context);

    // const newAddressesParams = [];
    // newAddressesParams.push(
    //   this.getNewAddressParams(walletGuardianSeed, proof)
    // );

    const { accounts, writables, signers } =
      this.getAccountsWritablesSignersForInstruction(testIx);

    // const {
    //   addressMerkleContext,
    //   addressMerkleTreeRootIndex,
    //   merkleContext,
    //   rootIndex,
    //   remainingAccounts,
    // } = this.packWithInput(
    //   [walletGuardianAccount],
    //   outputCompressedAccounts,
    //   newAddressesParams,
    //   proof
    // );

    const testIxRemainingAccounts = [
      {
        isSigner: false,
        isWritable: false,
        pubkey: testIx.programId,
      } as AccountMeta,
      ...testIx.keys.map(
        (x) =>
          <AccountMeta>{
            isSigner: false,
            isWritable: x.isWritable,
            pubkey: x.pubkey,
          }
      ),
    ];

    const accts = [
      this.merkleTree,
      this.nullifierQueue,
      this.addressTree,
      this.addressQueue,
    ];

    const ix = await CompressedAaPocProgram.getInstance()
      .program.methods.execInstruction(
        [walletGuardianAccount.data.data], // inputs
        proof.compressedProof, // proof
        {
          merkleTreePubkeyIndex: 0,
          nullifierQueuePubkeyIndex: 1,
          leafIndex: walletGuardianAccount.leafIndex,
          queueIndex: null,
        }, // merkleContext
        walletGuardianAccountProof.rootIndex, // merkleTreeRootIndex
        {
          addressMerkleTreePubkeyIndex: 2,
          addressQueuePubkeyIndex: 3,
        }, // addressMerkleContext
        0, // addressMerkleTreeRootIndex
        testIx.data, // instructionData
        accounts, // accountKeys
        writables, // isWritableFlags
        signers // isSignerFlags
      )
      .accounts({
        payer: guardian,
        seedGuardian: seedGuardian,
        guardian: guardian,
        wallet: wallet,
        ...this.lightAccounts(),
      })
      .remainingAccounts([...toAccountMetas(accts), ...testIxRemainingAccounts])
      .signers(ixSigners)
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

  static deriveWalletAddress(seedGuardian: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [PDA_WALLET_SEED, seedGuardian.toBytes()],
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
