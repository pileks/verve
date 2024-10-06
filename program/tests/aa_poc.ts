import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import { AaPoc } from "../target/types/aa_poc";
import elliptic from "elliptic";
import keccak from "keccak";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  createTransferInstruction,
} from "@solana/spl-token";
import { assert } from "chai";

describe("aa_poc", () => {
  // Configure the client to use the local cluster.
  const sponsor = new Keypair();
  let provider = new anchor.AnchorProvider(
    anchor.AnchorProvider.env().connection,
    new anchor.Wallet(sponsor)
  );

  anchor.setProvider(provider);

  const program = anchor.workspace.AaPoc as Program<AaPoc>;

  const confirmTransaction = async (txSignature: string) => {
    const bh = await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction(
      {
        signature: txSignature,
        blockhash: bh.blockhash,
        lastValidBlockHeight: bh.lastValidBlockHeight,
      },
      "confirmed"
    );

    const txDetails = await provider.connection.getTransaction(txSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    return txDetails;
  };

  const sendWithPayer = async (
    tx: Transaction,
    kp: Keypair,
    ...signers: Keypair[]
  ): Promise<anchor.web3.VersionedTransactionResponse> => {
    tx.recentBlockhash = (
      await provider.connection.getLatestBlockhash()
    ).blockhash;

    tx.feePayer = kp.publicKey;
    tx.sign(...[kp, ...signers]);

    const txSignature = await provider.connection.sendRawTransaction(
      tx.serialize()
    );

    return await confirmTransaction(txSignature);
  };

  async function getBalance(publicKey: PublicKey): Promise<number> {
    const balance = await provider.connection.getBalance(publicKey);
    return balance;
  }

  const airdropSol = async (pubkey: PublicKey, amount: number) => {
    await confirmTransaction(
      await provider.connection.requestAirdrop(
        pubkey,
        amount * LAMPORTS_PER_SOL
      )
    );
  };

  const primaryGuardian = new Keypair();

  async function createWalletWithSeedGuardian(
    seedGuardian: Keypair
  ): Promise<anchor.web3.VersionedTransactionResponse> {
    const initTx = await program.methods
      .initWallet()
      .accounts({ assignGuardian: seedGuardian.publicKey })
      .transaction();

    return await sendWithPayer(initTx, sponsor, seedGuardian);
  }

  function getAbstractWalletAddressBumps(
    seedGuardianPubkey: PublicKey
  ): [PublicKey, number] {
    const seeds = [Buffer.from("w"), seedGuardianPubkey.toBuffer()];

    return PublicKey.findProgramAddressSync(seeds, program.programId);
  }

  function getAccountsWritablesSignersForInstruction(
    transferIx: anchor.web3.TransactionInstruction
  ) {
    const accounts: PublicKey[] = [];
    const writables: boolean[] = [];
    const signers: boolean[] = [];

    for (let accountMeta of transferIx.keys) {
      accounts.push(accountMeta.pubkey);
      writables.push(accountMeta.isWritable);
      signers.push(accountMeta.isSigner);
    }

    return { accounts, writables, signers };
  }

  before(async () => {
    // This is our tx sponsor, let's give him some cash.
    await airdropSol(sponsor.publicKey, 100);
  });

  it("secp256k1 auth", async () => {
    const ec = new elliptic.ec("secp256k1");

    const key = ec.genKeyPair();

    // const privateKey = key.getPrivate("hex");
    const publicKey = key.getPublic("array");

    const message = "Hello!";
    const messageHash = keccak("sha3-256").update(message).digest();
    const signature = key.sign(messageHash);

    const tx = await program.methods
      .verifyEcdsa(
        Buffer.from([...signature.r.toArray(), ...signature.s.toArray()]),
        signature.recoveryParam,
        Buffer.from(publicKey)
      )
      .transaction();

    const result = await sendWithPayer(tx, sponsor);

    console.log(result.meta.logMessages);
  });

  it("AA Demo", async () => {
    console.log("Provider: ", provider.publicKey.toBase58());
    console.log("Sponsor: ", sponsor.publicKey.toBase58());
    console.log("Hotwallet: ", primaryGuardian.publicKey.toBase58());

    // We aren't dropping SOL into the guardian
    // This shows how a SOLless wallet can still sign (approve) transactions with an external payer
    // await airdropSol(signer.publicKey, 100);

    await createWalletWithSeedGuardian(primaryGuardian);

    console.log("Sponsor balance: ", await getBalance(sponsor.publicKey));

    const secondaryGuardian = new Keypair();

    // We can register a 2nd guardian
    const registerTx = await program.methods
      .registerKeypair()
      .accounts({
        seedGuardian: primaryGuardian.publicKey,
        assignGuardian: secondaryGuardian.publicKey,
      })
      .transaction();

    await sendWithPayer(registerTx, sponsor, primaryGuardian);

    console.log("Sponsor balance: ", await getBalance(sponsor.publicKey));

    const testIx = await program.methods.testTransaction().instruction();

    const { accounts, signers, writables } =
      getAccountsWritablesSignersForInstruction(testIx);

    const [walletPdaPubkey, _] = getAbstractWalletAddressBumps(
      primaryGuardian.publicKey
    );

    // Exec as primary
    console.log("Executing as primary guardian...");
    const execPrimaryTx = await program.methods
      .execInstruction(testIx.data, accounts, writables, signers)
      .accounts({
        guardian: primaryGuardian.publicKey,
        seedGuardian: primaryGuardian.publicKey,
      })
      .remainingAccounts([
        { isSigner: false, isWritable: false, pubkey: program.programId },
        ...testIx.keys.map((x) => ({
          isSigner: false,
          isWritable: x.isWritable,
          pubkey: x.pubkey,
        })),
      ])
      .transaction();

    const primaryTx = await sendWithPayer(
      execPrimaryTx,
      sponsor,
      primaryGuardian
    );

    console.log("LOGS:");
    console.log(primaryTx.meta.logMessages);

    // Exec as secondary
    console.log("Executing as secondary guardian...");
    const execSecondaryTx = await program.methods
      .execInstruction(testIx.data, accounts, writables, signers)
      .accounts({
        guardian: secondaryGuardian.publicKey,
        seedGuardian: primaryGuardian.publicKey,
      })
      .remainingAccounts([
        { isSigner: false, isWritable: false, pubkey: program.programId },
        ...testIx.keys.map((x) => ({
          isSigner: false,
          isWritable: x.isWritable,
          pubkey: x.pubkey,
        })),
      ])
      .transaction();

    const secondaryTx = await sendWithPayer(
      execSecondaryTx,
      sponsor,
      secondaryGuardian
    );

    console.log("LOGS:");
    console.log(secondaryTx.meta.logMessages);

    const payerBalance = await getBalance(sponsor.publicKey);
    const signerBalance = await getBalance(primaryGuardian.publicKey);

    console.log("Sponsor balance: ", payerBalance);
    console.log("Hotwallet balance: ", signerBalance);
  });

  /**
   * This example proves that we can use a compressed wallet
   * without ever initializing the underlying PDA.
   * A little bit of protocol abuse never hurt anyone...
   */
  it("Airdrop token into nonexistent PDA", async () => {
    // we're simulating how we would derive a wallet PDA, just for the lols
    const [pdaPubkey, _] = getAbstractWalletAddressBumps(
      new Keypair().publicKey
    );

    const mintKeypair = new Keypair();
    const mintCreator = new Keypair();

    await airdropSol(mintCreator.publicKey, 100);

    const mint = await createMint(
      provider.connection,
      mintCreator,
      mintCreator.publicKey,
      mintCreator.publicKey,
      0,
      mintKeypair
    );

    const pdaAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      mintCreator,
      mint,
      pdaPubkey,
      true
    );

    console.log("PDA ATA:", pdaAta.address.toBase58());

    await mintTo(
      provider.connection,
      mintCreator,
      mint,
      pdaAta.address,
      mintCreator,
      100_000_000 // Amount of tokens to mint (considering decimals)
    );

    const pdaTokenAccountInfo = await getAccount(
      provider.connection,
      pdaAta.address
    );

    console.log("PDA token balance:", pdaTokenAccountInfo.amount);

    // Assert that we actually did the airdrop correctly.
    assert.equal(pdaTokenAccountInfo.amount, BigInt(100_000_000));
  });

  /**
   * Now let's put all what we learned from the previous examples to the test.
   * 1. Create two AA wallets.
   * 2. Airdrop some random SPL token into Wallet 1.
   * 3. Transfer some tokens from Wallet 1 into Wallet 2
   *    by having the Abstract Wallet Program (AWP) sign
   *    the transfer IX for Wallet 1.
   *    Since Wallet 1 is a PDA, the AWP will check whether
   *    a guardian signed the TX, and only sign for the PDA
   *    if the correct guardian signed the TX.
   */
  it("Transfer tokens using AA wallet", async () => {
    const guardian1 = new Keypair();
    const guardian2 = new Keypair();

    console.log("Sponsor:", sponsor.publicKey.toBase58());
    console.log("Guardian 1:", guardian1.publicKey.toBase58());
    console.log("Guardian 2:", guardian2.publicKey.toBase58());

    // We first create 2 wallets
    await createWalletWithSeedGuardian(guardian1);
    await createWalletWithSeedGuardian(guardian2);

    // Let's store their addresses for ATA creation purposes
    const [wallet1Pubkey] = getAbstractWalletAddressBumps(guardian1.publicKey);
    const [wallet2Pubkey] = getAbstractWalletAddressBumps(guardian2.publicKey);

    console.log("Wallet 1:", wallet1Pubkey.toBase58());
    console.log("Wallet 2:", wallet2Pubkey.toBase58());

    // Now, create a new mint and airdrop some tokies into Wallet 1
    const mintKeypair = new Keypair();
    const mintCreator = new Keypair();

    await airdropSol(mintCreator.publicKey, 100);

    const mint = await createMint(
      provider.connection,
      mintCreator,
      mintCreator.publicKey,
      mintCreator.publicKey,
      0,
      mintKeypair
    );

    const wallet1Ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      mintCreator,
      mint,
      wallet1Pubkey,
      true
    );

    const wallet2Ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      mintCreator,
      mint,
      wallet2Pubkey,
      true
    );

    console.log("ATA 1:", wallet1Ata.address.toBase58());
    console.log("ATA 2:", wallet2Ata.address.toBase58());

    await mintTo(
      provider.connection,
      mintCreator,
      mint,
      wallet1Ata.address,
      mintCreator,
      100_000_000 // Amount of tokens to mint (considering decimals)
    );

    // Now that we have 100M tokens in Wallet1's ATA, let's create a transfer IX from Wallet1 to Wallet2
    const transferIx = createTransferInstruction(
      wallet1Ata.address,
      wallet2Ata.address,
      wallet1Pubkey,
      50_000_000
    );

    const accounts: PublicKey[] = [];
    const is_writables: boolean[] = [];
    const is_signers: boolean[] = [];

    for (let accountMeta of transferIx.keys) {
      accounts.push(accountMeta.pubkey);
      is_writables.push(accountMeta.isWritable);
      is_signers.push(accountMeta.isSigner);
    }

    const execTransferTokensTx = await program.methods
      .execInstruction(transferIx.data, accounts, is_writables, is_signers)
      .accounts({
        guardian: guardian1.publicKey,
        seedGuardian: guardian1.publicKey,
      })
      .remainingAccounts([
        { isSigner: false, isWritable: false, pubkey: transferIx.programId },
        ...transferIx.keys.map((x) => ({
          isSigner: false,
          isWritable: x.isWritable,
          pubkey: x.pubkey,
        })),
      ])
      .transaction();

    const transferTokensTx = await sendWithPayer(
      execTransferTokensTx,
      sponsor,
      guardian1
    );

    console.log("LOGS:");
    console.log(transferTokensTx.meta.logMessages);

    const pdaTokenAccountInfo = await getAccount(
      provider.connection,
      wallet2Ata.address
    );

    // Assert that the transaction succeeded
    assert.equal(pdaTokenAccountInfo.amount, BigInt(50_000_000));
  });
});
