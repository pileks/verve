import { web3 } from "@coral-xyz/anchor";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import {
  TransactionRequest,
  TransactionResponse,
  WalletResponse,
  PubkeyResponse,
} from "../types/messages";
import { useKeypairStore } from "../state/useKeypairStore";

function Embed() {
  const { secretKey, assign } = useKeypairStore();

  const kp = secretKey
    ? web3.Keypair.fromSecretKey(base64.decode(secretKey))
    : undefined;

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

          if (!kp) {
            console.log("No keypair present, can't sign transaction!");
            return;
          }

          const data = e.data as TransactionRequest;

          const tx = web3.Transaction.from(Buffer.from(data.buffer));
          tx.partialSign(kp);

          const signedTxData = tx.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          });

          const msg: TransactionResponse = {
            type: "transactionResponse",
            buffer: signedTxData.buffer,
          };

          window.parent.postMessage(msg, "*", [msg.buffer]);
        }
      }
    });
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {kp ? (
        <>
          <div className="font-medium">
            Pubkey: <span className="font-mono">{kp.publicKey.toBase58()}</span>
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
