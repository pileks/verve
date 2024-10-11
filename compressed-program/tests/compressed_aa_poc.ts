import { setProvider, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import {
  airdropSol,
  createRpc,
  Rpc,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import { CompressedAaPocProgram } from "../utils/program";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { expect } from "chai";
import {
  Account,
  createMint,
  createTransferInstruction,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

// Configure the client to use the local cluster.
const provider = AnchorProvider.env();
const wallet = provider.wallet as Wallet;

setProvider(provider);

const rpc: Rpc = createRpc(undefined, undefined, undefined, {
  commitment: "confirmed",
});

// wallet 1
let seedGuardianAddress1: PublicKey;
let walletPda1: PublicKey;
const assignGuardian1 = new Keypair();

// wallet 2
const seedGuardian2 = new Keypair();
let seedGuardianAddress2: PublicKey;
let walletPda2: PublicKey;
const assignGuardian2 = new Keypair();

const getTransferInstruction = (
  from: PublicKey,
  to: PublicKey,
  solAmount: number
) => {
  return SystemProgram.transfer({
    fromPubkey: from,
    toPubkey: to,
    lamports: solAmount * LAMPORTS_PER_SOL,
  });
};

describe("initialize wallets and wallet guardians", () => {
  before("airdrop sol", async () => {
    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: wallet.payer.publicKey,
    });

    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: assignGuardian1.publicKey,
    });

    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: seedGuardian2.publicKey,
    });

    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: assignGuardian2.publicKey,
    });
  });

  it("initialize wallet 1", async () => {
    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.initWalletTx(rpc, wallet.publicKey);

    transaction.sign([wallet.payer]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);

    seedGuardianAddress1 = walletGuardianAddress;

    const walletGuardianData =
      await CompressedAaPocProgram.getWalletGuardianAccountData(
        rpc,
        walletGuardianAddress
      );

    const derrivedWallet = CompressedAaPocProgram.deriveWalletAddress(
      wallet.publicKey
    );

    expect(walletGuardianData.guardian).to.deep.eq(wallet.publicKey);
    expect(walletGuardianData.wallet).to.deep.eq(derrivedWallet);

    walletPda1 = derrivedWallet;
  });

  it("initialize wallet 2", async () => {
    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.initWalletTx(rpc, seedGuardian2.publicKey);

    transaction.sign([seedGuardian2]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);

    seedGuardianAddress2 = walletGuardianAddress;

    const walletGuardianData =
      await CompressedAaPocProgram.getWalletGuardianAccountData(
        rpc,
        walletGuardianAddress
      );

    const derrivedWallet = CompressedAaPocProgram.deriveWalletAddress(
      seedGuardian2.publicKey
    );

    expect(walletGuardianData.guardian).to.deep.eq(seedGuardian2.publicKey);
    expect(walletGuardianData.wallet).to.deep.eq(derrivedWallet);

    walletPda2 = derrivedWallet;
  });

  it("assign wallet guardian for wallet 1", async () => {
    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.registerKeypairTx(
        rpc,
        wallet.publicKey,
        assignGuardian1.publicKey
      );

    transaction.sign([wallet.payer]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);

    seedGuardianAddress1 = walletGuardianAddress;

    const walletGuardianData =
      await CompressedAaPocProgram.getWalletGuardianAccountData(
        rpc,
        walletGuardianAddress
      );

    const derrivedWallet = CompressedAaPocProgram.deriveWalletAddress(
      wallet.publicKey
    );

    expect(walletGuardianData.guardian).to.deep.eq(assignGuardian1.publicKey);
    expect(walletGuardianData.wallet).to.deep.eq(walletPda1);
    expect(derrivedWallet).to.deep.eq(walletPda1);
  });

  it("assign wallet guardian for wallet 2", async () => {
    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.registerKeypairTx(
        rpc,
        seedGuardian2.publicKey,
        assignGuardian2.publicKey
      );

    transaction.sign([seedGuardian2]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);

    seedGuardianAddress1 = walletGuardianAddress;

    const walletGuardianData =
      await CompressedAaPocProgram.getWalletGuardianAccountData(
        rpc,
        walletGuardianAddress
      );

    const derrivedWallet = CompressedAaPocProgram.deriveWalletAddress(
      seedGuardian2.publicKey
    );

    expect(walletGuardianData.guardian).to.deep.eq(assignGuardian2.publicKey);
    expect(walletGuardianData.wallet).to.deep.eq(walletPda2);
    expect(derrivedWallet).to.deep.eq(walletPda2);
  });

  it("execute test instruction by seed guardian for wallet 1", async () => {
    const testIx = await CompressedAaPocProgram.getInstance()
      .program.methods.testTransaction()
      .instruction();

    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.execInstructionTx(
        rpc,
        wallet.publicKey,
        wallet.publicKey,
        testIx,
        [wallet.payer]
      );

    transaction.sign([wallet.payer]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);
  });

  it("execute test instruction by wallet guardian for wallet 1", async () => {
    const testIx = await CompressedAaPocProgram.getInstance()
      .program.methods.testTransaction()
      .instruction();

    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.execInstructionTx(
        rpc,
        wallet.publicKey,
        assignGuardian1.publicKey,
        testIx,
        [wallet.payer, assignGuardian1]
      );

    transaction.sign([wallet.payer, assignGuardian1]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);
  });
});

describe("wallet sol transfer tests", () => {
  before("airdrop sol into wallet 1", async () => {
    const airdropAmount = 100 * LAMPORTS_PER_SOL;

    const balanceBefore = await provider.connection.getBalance(walletPda1);

    await airdropSol({
      connection: rpc,
      lamports: airdropAmount,
      recipientPublicKey: walletPda1,
    });

    const balanceAfter = await provider.connection.getBalance(walletPda1);

    expect(balanceAfter - balanceBefore).to.eq(airdropAmount);
  });

  it("wallet 1 seed guardian transfer 2 sol from wallet 1 to wallet 2", async () => {
    const transferAmount = 2;

    const balanceBefore = await provider.connection.getBalance(walletPda1);

    const transferSolIx = getTransferInstruction(
      walletPda1,
      walletPda2,
      transferAmount
    );

    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.execInstructionTx(
        rpc,
        wallet.publicKey,
        wallet.publicKey,
        transferSolIx,
        [wallet.payer]
      );

    transaction.sign([wallet.payer]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);

    const balanceAfter = await provider.connection.getBalance(walletPda1);

    expect(balanceBefore - balanceAfter).to.eq(
      transferAmount * LAMPORTS_PER_SOL
    );
  });

  it("wallet 1 assigned guardian transfer 2 sol from wallet 1 to wallet 2", async () => {
    const transferAmount = 2;

    const balanceBefore = await provider.connection.getBalance(walletPda1);

    const transferSolIx = getTransferInstruction(
      walletPda1,
      walletPda2,
      transferAmount
    );

    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.execInstructionTx(
        rpc,
        wallet.publicKey,
        assignGuardian1.publicKey,
        transferSolIx,
        [wallet.payer]
      );

    transaction.sign([wallet.payer, assignGuardian1]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);

    const balanceAfter = await provider.connection.getBalance(walletPda1);

    expect(balanceBefore - balanceAfter).to.eq(
      transferAmount * LAMPORTS_PER_SOL
    );
  });
});

describe("spl token transfer tests", () => {
  let wallet1Ata: Account, wallet2Ata: Account;

  before("setup spl tokens", async () => {
    // init mint
    const mintKeypair = new Keypair();
    const mintCreator = new Keypair();

    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: mintCreator.publicKey,
    });

    const mint = await createMint(
      provider.connection,
      mintCreator,
      mintCreator.publicKey,
      mintCreator.publicKey,
      0,
      mintKeypair
    );

    // init wallet atas
    wallet1Ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      mintCreator,
      mint,
      walletPda1,
      true
    );

    wallet2Ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      mintCreator,
      mint,
      walletPda2,
      true
    );

    // mint tokens to wallet 1 ata
    await mintTo(
      provider.connection,
      mintCreator,
      mint,
      wallet1Ata.address,
      mintCreator,
      100_000_000
    );
  });

  it("wallet 1 seed guardian transfer 10_000_000 tokens from wallet 1 ata to wallet 2 ata", async () => {
    const transferAmount = 30_000_000;

    const wallet1AtaBefore = await getAccount(
      provider.connection,
      wallet1Ata.address
    );

    const transferSplIx = createTransferInstruction(
      wallet1Ata.address,
      wallet2Ata.address,
      walletPda1,
      transferAmount
    );

    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.execInstructionTx(
        rpc,
        wallet.publicKey,
        wallet.publicKey,
        transferSplIx,
        [wallet.payer]
      );

    transaction.sign([wallet.payer]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);

    const wallet1AtaAfter = await getAccount(
      provider.connection,
      wallet1Ata.address
    );

    expect(wallet1AtaBefore.amount - wallet1AtaAfter.amount).to.eq(
      BigInt(transferAmount)
    );
  });

  it("wallet 1 assigned guardian transfer 30_000_000 tokens from wallet 1 ata to wallet 2 ata", async () => {
    const transferAmount = 30_000_000;

    const wallet1AtaBefore = await getAccount(
      provider.connection,
      wallet1Ata.address
    );

    const transferSplIx = createTransferInstruction(
      wallet1Ata.address,
      wallet2Ata.address,
      walletPda1,
      transferAmount
    );

    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.execInstructionTx(
        rpc,
        wallet.publicKey,
        assignGuardian1.publicKey,
        transferSplIx,
        [wallet.payer]
      );

    transaction.sign([wallet.payer, assignGuardian1]);

    const signature = await sendAndConfirmTx(rpc, transaction, {
      skipPreflight: true,
      commitment: "confirmed",
    });

    const log = await rpc.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    console.log("signature: ", signature);

    console.log("messages: ", log.meta.logMessages);

    const wallet1AtaAfter = await getAccount(
      provider.connection,
      wallet1Ata.address
    );

    expect(wallet1AtaBefore.amount - wallet1AtaAfter.amount).to.eq(
      BigInt(transferAmount)
    );
  });
});
