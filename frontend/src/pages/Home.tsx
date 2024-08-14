import { web3 } from "@coral-xyz/anchor";
import { useKeypairStore } from "../state/useKeypairStore";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { WalletResponse } from "../types/messages";

function Home() {
  const { secretKey, assign } = useKeypairStore();

  const kp = secretKey
    ? web3.Keypair.fromSecretKey(base64.decode(secretKey))
    : undefined;

  const generateKeypair = () => {
    assign(base64.encode(Buffer.from(new web3.Keypair().secretKey)));
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
