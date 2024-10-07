import {
  setProvider,
  AnchorProvider,
  getProvider,
  Wallet,
} from "@coral-xyz/anchor";
import {
  airdropSol,
  createRpc,
  Rpc,
  sendAndConfirmTx,
} from "@lightprotocol/stateless.js";
import { CompressedAaPocProgram } from "../utils/program";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("token-escrow", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  const wallet = provider.wallet as Wallet;

  setProvider(provider);

  const rpc: Rpc = createRpc(undefined, undefined, undefined, {
    commitment: "confirmed",
  });

  let seedGuardianAddress: PublicKey;
  let walletPdaPubkey: PublicKey;

  it("init wallet", async () => {
    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: wallet.payer.publicKey,
    });

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

  it("register keypair", async () => {
    const assignGuardian = new Keypair().publicKey;

    await airdropSol({
      connection: rpc,
      lamports: 100 * LAMPORTS_PER_SOL,
      recipientPublicKey: assignGuardian,
    });

    const { transaction, walletGuardianAddress } =
      await CompressedAaPocProgram.registerKeypairTx(
        rpc,
        wallet.publicKey,
        assignGuardian
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

    expect(walletGuardianData.guardian).to.deep.eq(assignGuardian);
    expect(walletGuardianData.wallet).to.deep.eq(walletPdaPubkey);
    expect(derrivedWallet).to.deep.eq(walletPdaPubkey);
  });

  it("exec instruction", async () => {});
});
