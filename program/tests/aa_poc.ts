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
  ) => {
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

  const mainGuardian = new Keypair();

  before(async () => {
    // This is our tx sponsor, let's give him some cash.
    await airdropSol(sponsor.publicKey, 100);
  });

  it.skip("ECDSA Auth", async () => {
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

  it.skip("Init wallet", async () => {
    const initTx = await program.methods
      .initWallet()
      .accounts({ assignGuardian: mainGuardian.publicKey })
      .transaction();
    await sendWithPayer(initTx, sponsor, mainGuardian);
  });

  it("AA Demo", async () => {
    console.log("Provider: ", provider.publicKey.toBase58());
    console.log("Sponsor: ", sponsor.publicKey.toBase58());
    console.log("Hotwallet: ", mainGuardian.publicKey.toBase58());

    // We aren't dropping SOL into the signer
    // This shows how a SOLless wallet can still sign (approve) transactions with an external payer
    // await airdropSol(signer.publicKey, 100);

    const initTx = await program.methods
      .initWallet()
      .accounts({ assignGuardian: mainGuardian.publicKey })
      .transaction();

    await sendWithPayer(initTx, sponsor, mainGuardian);

    console.log("Sponsor balance: ", await getBalance(sponsor.publicKey));

    const secondaryGuardian = new Keypair();

    // We can register a 2nd guardian
    const registerTx = await program.methods
      .registerKeypair()
      .accounts({ assignGuardian: secondaryGuardian.publicKey })
      .transaction();

    await sendWithPayer(registerTx, sponsor, secondaryGuardian);

    console.log("Sponsor balance: ", await getBalance(sponsor.publicKey));

    const testIx = await program.methods.testTransaction().instruction();

    const execTx = await program.methods
      .execInstruction(testIx.data)
      .accounts({ payer: sponsor.publicKey, guardian: mainGuardian.publicKey })
      .remainingAccounts([
        { isSigner: false, isWritable: false, pubkey: program.programId },
      ])
      .transaction();

    const a = await sendWithPayer(execTx, sponsor, mainGuardian);

    console.log("LOGS:");
    console.log(a.meta.logMessages);

    const payerBalance = await getBalance(sponsor.publicKey);
    const signerBalance = await getBalance(mainGuardian.publicKey);

    console.log("Sponsor balance: ", payerBalance);
    console.log("Hotwallet balance: ", signerBalance);
  });
});
