import { web3 } from "@coral-xyz/anchor";
import { useCallback, useEffect, useRef, useState } from "react";

type TransactionResponse = {
  type: "transactionResponse";
  buffer: ArrayBuffer;
};

export type TransactionRequest = {
  type: "transactionRequest";
  buffer: ArrayBuffer;
};

export type PubkeyResponse = {
  // base64 encoded secret key
  pubkey: string;
  type: "pubkey";
};

function App() {
  const isListening = useRef(false);
  const embeddedWalletRef = useRef<HTMLIFrameElement>(null);
  const [pubkey, setPubkey] = useState("");
  const [txString, setTxString] = useState("");

  useEffect(() => {
    if (isListening.current) {
      console.log("Already listening.");
      return;
    }

    isListening.current = true;

    window.addEventListener("message", (e) => {
      if (e.data.type === "transactionResponse") {
        console.log("Received signed TX response!");

        const data = e.data as TransactionResponse;

        const tx = web3.Transaction.from(Buffer.from(data.buffer));

        console.log(tx);

        setTxString(JSON.stringify(tx));
      } else if (e.data.type === "pubkey") {
        console.log("Received pubkey:");

        const data = e.data as PubkeyResponse;

        console.log(data.pubkey);

        setPubkey(data.pubkey);
      }
    });
  }, []);

  const sendTx = useCallback(() => {
    if (!embeddedWalletRef.current?.contentWindow) {
      console.log("Could not find embedded wallet iframe!");
      return;
    }

    if (!pubkey.length) {
      console.log("Pubkey needs to exist.");
      return;
    }
    const walletPubkey = new web3.PublicKey(pubkey);
    const payerPubkey = new web3.PublicKey("ENqWp6zvrKX59YiJbRfPtPYCs42xXiJ9e8nV6KsUcppo");

    const tx = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: walletPubkey,
        toPubkey: payerPubkey,
        lamports: 10000,
      })
    );

    tx.recentBlockhash = "G2ox6KrQ68a1tXd6gYSst47hsctgDcDofrAWwV7rzGz8";
    tx.feePayer = payerPubkey;

    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const message: TransactionRequest = {
      type: "transactionRequest",
      buffer: serializedTx.buffer,
    };

    embeddedWalletRef.current.contentWindow.postMessage(
      message,
      import.meta.env.VITE_WALLET_URL,
      [message.buffer]
    );
  }, [pubkey]);

  return (
    <div className="max-w-screen-md mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">This is a dApp</h1>
          <span>The dApp can't read a cross-origin iframe.</span>
          <div>
            <button
              className="border border-black rounded px-3 py-2"
              onClick={() => {
                sendTx();
              }}
            >
              Send TX
            </button>
          </div>
          <div>
            {!!txString.length && (
              <p className="p-4 border border-black rounded font-mono text-wrap whitespace-pre-wrap overflow-x-auto">
                {txString}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-medium">
            This is my wallet in said cross-origin iframe:
          </span>
          <iframe
            ref={embeddedWalletRef}
            className="w-full border border-black rounded"
            src={`${import.meta.env.VITE_WALLET_URL}/embed`}
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default App;
