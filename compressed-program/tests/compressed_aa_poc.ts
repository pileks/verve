import { setProvider, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import {
  airdropSol,
  createRpc,
  Rpc,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import { CompressedAaPocProgram } from "../utils/program";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("compressed aa poc", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  const wallet = provider.wallet as Wallet;

  setProvider(provider);

  const rpc: Rpc = createRpc(undefined, undefined, undefined, {
    commitment: "confirmed",
  });

  let seedGuardianAddress: PublicKey;
  let walletPdaPubkey: PublicKey;
  const assignGuardian = new Keypair();

  before(async () => {
    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: wallet.payer.publicKey,
    });

    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: assignGuardian.publicKey,
    });
  });

  it("initWallet", async () => {
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

    seedGuardianAddress = walletGuardianAddress;

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

    walletPdaPubkey = derrivedWallet;
  });

  it("registerKeypair", async () => {
    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.registerKeypairTx(
        rpc,
        wallet.publicKey,
        assignGuardian.publicKey
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

    seedGuardianAddress = walletGuardianAddress;

    const walletGuardianData =
      await CompressedAaPocProgram.getWalletGuardianAccountData(
        rpc,
        walletGuardianAddress
      );

    const derrivedWallet = CompressedAaPocProgram.deriveWalletAddress(
      wallet.publicKey
    );

    expect(walletGuardianData.guardian).to.deep.eq(assignGuardian.publicKey);
    expect(walletGuardianData.wallet).to.deep.eq(walletPdaPubkey);
    expect(derrivedWallet).to.deep.eq(walletPdaPubkey);
  });

  it("execInstruction seed guardian", async () => {
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

  it("execInstruction assigned guardian", async () => {
    const testIx = await CompressedAaPocProgram.getInstance()
      .program.methods.testTransaction()
      .instruction();

    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.execInstructionTx(
        rpc,
        wallet.publicKey,
        assignGuardian.publicKey,
        testIx,
        [wallet.payer, assignGuardian]
      );

    transaction.sign([wallet.payer, assignGuardian]);

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
