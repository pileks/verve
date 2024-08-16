import { web3 } from "@coral-xyz/anchor";
import { base64, bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  TransactionRequest,
  TransactionResponse,
  WalletResponse,
  PubkeyResponse,
} from "../types/messages";
import { useKeypairStore } from "../state/useKeypairStore";
import { useEffect, useRef, useState } from "react";

function Embed() {
  const { secretKey, assign } = useKeypairStore();
  
  const kp = useRef<web3.Keypair | undefined>(
    secretKey ? web3.Keypair.fromSecretKey(base64.decode(secretKey)) : undefined
  );

  const [pubkey, setPubkey] = useState<string | undefined>(kp.current?.publicKey.toBase58());

  useEffect(() => {
    kp.current = secretKey
      ? web3.Keypair.fromSecretKey(base64.decode(secretKey))
      : undefined;
    
    setPubkey(kp.current?.publicKey.toBase58());
  }, [secretKey]);

  
  const fetchKeypair = () => {
    window.open(import.meta.env.VITE_WALLET_URL, "_blank");

    window.addEventListener("message", (e) => {
      if (e.origin == import.meta.env.VITE_WALLET_URL) {
        if (e.data.type === "secretkey") {
          console.log("Secret key received!");

          const data = e.data as WalletResponse;

          assign(data.secretKey);

          if (window.parent) {
            const pubkey = web3.Keypair.fromSecretKey(
              base64.decode(data.secretKey)
            ).publicKey;

            console.log("Sending pubkey to parent.");

            const message: PubkeyResponse = {
              type: "pubkey",
              pubkey: pubkey.toBase58(),
            };

            window.parent.postMessage(message, "*");
          }
        }
      }

      if (true) {
        console.log("Embed received:", e);

        if (e.data.type == "transactionRequest") {
          console.log("TX received!");

          if (!kp.current) {
            console.log("No keypair present, can't sign transaction!");
            return;
          }

          const data = e.data as TransactionRequest;

          const tx = web3.Transaction.from(Buffer.from(data.buffer));
          
          tx.partialSign(kp.current);

          const signedTxData = tx.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          });

          fetch(`${import.meta.env.VITE_PAYER_URL}`, {
            method: "POST",
            body: JSON.stringify({ tx: bs58.encode(signedTxData)}),
            headers: {
              "content-type": "application/json"
            }
          }).then(resp => {

            resp.json().then(x => {
              const respTx = (x.tx as string);
              const respTxData = Uint8Array.from(bs58.decode(respTx)).buffer;

              const msg: TransactionResponse = {
                type: "transactionResponse",
                buffer: respTxData,
              };
    
              window.parent.postMessage(msg, "*", [respTxData]);
            })

          })
        }
      }
    });
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {pubkey ? (
        <>
          <div className="font-medium">
            Pubkey:{" "}
            <span className="font-mono">{pubkey}</span>
          </div>
        </>
      ) : (
        <>No Keypair!</>
      )}
      <div>
        <button
          className="border border-black rounded px-3 py-2"
          onClick={() => {
            fetchKeypair();
          }}
        >
          Fetch wallet
        </button>
      </div>
    </div>
  );
}

export default Embed;
