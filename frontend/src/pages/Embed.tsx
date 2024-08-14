import { web3 } from "@coral-xyz/anchor";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { WalletResponse } from "../types/messages";
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
          const data = e.data as WalletResponse;
          console.log("ASDF");
          console.log(e.data);
          console.log(data);

          assign(data.secretKey);
        }
      }
    });
  };

  return (
    <>
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
          onClick={() => {
            fetchKeypair();
          }}
        >
          Fetch wallet
        </button>
      </div>
    </>
  );
}

export default Embed;
