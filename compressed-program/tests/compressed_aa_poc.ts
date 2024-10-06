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
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("token-escrow", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  const wallet = provider.wallet as Wallet;

  setProvider(provider);

  const rpc: Rpc = createRpc(undefined, undefined, undefined, {
    commitment: "confirmed",
  });

  let createdWalletGuardianAddress: PublicKey;

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

    createdWalletGuardianAddress = walletGuardianAddress;
  });

  it("register keypair", async () => {});

  it("exec instruction", async () => {});
});
