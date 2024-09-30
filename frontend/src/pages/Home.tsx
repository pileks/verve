import { web3 } from "@coral-xyz/anchor";
import { useKeypairStore } from "../state/useKeypairStore";
import { base64, bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { WalletResponse } from "../types/messages";
import { useAaPocProgramContext } from "../providers/AaPocProgramContext";
import { useConnection } from "@solana/wallet-adapter-react";

function Home() {
  const { secretKey, assign } = useKeypairStore();

  const aaPoc = useAaPocProgramContext();
  const { connection } = useConnection();

  const kp = secretKey
    ? web3.Keypair.fromSecretKey(base64.decode(secretKey))
    : undefined;

  const generateKeypair = async () => {
    if (!aaPoc) {
      console.log("Can't connect to program!");
      return;
    }

    const keypair = new web3.Keypair();

    const registrationTx = await aaPoc.methods
      .registerKeypair()
      .accounts({ signer: keypair.publicKey })
      .transaction();

    const payerPubkey = new web3.PublicKey(
      "ENqWp6zvrKX59YiJbRfPtPYCs42xXiJ9e8nV6KsUcppo"
    );
    
    registrationTx.feePayer = payerPubkey;
    registrationTx.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    registrationTx.partialSign(keypair);

    const registrationTxSerialized = registrationTx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const registrationTxSignedResponse = await fetch(
      import.meta.env.VITE_PAYER_URL,
      {
        method: "POST",
        body: JSON.stringify({ tx: bs58.encode(registrationTxSerialized) }),
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const registrationTxSignedJson = await registrationTxSignedResponse.json();

    const registrationTxSignedData = bs58.decode(registrationTxSignedJson.tx);

    const txSig = await connection.sendRawTransaction(registrationTxSignedData);

    const confirmTransaction = async (tx: string) => {
      const bh = await connection.getLatestBlockhash();
    
      await connection.confirmTransaction(
        {
          signature: tx,
          blockhash: bh.blockhash,
          lastValidBlockHeight: bh.lastValidBlockHeight,
        },
        "confirmed"
      );

      const txDetails = await connection.getTransaction(tx, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
  
      return txDetails;
    }

    const txResult = await confirmTransaction(txSig);

    console.log(txResult);

    assign(base64.encode(Buffer.from(keypair.secretKey)));
  };

  const sendKeypair = () => {
    if (!window.opener) {
      console.log("No opener, can't send keypair.");
      return;
    }

    if (!secretKey) {
      console.log("No secret key!");
      return;
    }

    const opener = window.opener as Window;
    const resp: WalletResponse = {
      secretKey: secretKey,
      type: "secretkey",
    };
    opener.postMessage(resp, import.meta.env.VITE_WALLET_URL);
    window.close();
  };

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold">This is my wallet</h1>
          <p>There are many like it, but this one is mine.</p>
          <p>
            My wallet is my best friend. It is my life. I must master it as I
            must master my life.
          </p>
          <p>
            Without me, my wallet is useless. Without my wallet, I am useless.
          </p>
        </div>
        <div>
          {kp ? (
            <>
              <div className="font-medium">
                Pubkey:{" "}
                <span className="font-mono">{kp.publicKey.toBase58()}</span>
              </div>
            </>
          ) : (
            <>No Keypair!</>
          )}
        </div>
        <div>
          <button
            className="border border-black rounded px-3 py-2"
            onClick={() => {
              generateKeypair();
            }}
          >
            Generate new keypair
          </button>
        </div>
        <div>
          {window.opener ? (
            <button
              className="border border-black rounded px-3 py-2"
              onClick={() => {
                sendKeypair();
              }}
            >
              Send keypair
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
