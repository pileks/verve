import { web3 } from "@coral-xyz/anchor";
import { useKeypairStore } from "./state/useKeypairStore";
import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

function App() {
  const { secretKey, assign } = useKeypairStore();
  console.log(secretKey);
  const kp = secretKey
    ? web3.Keypair.fromSecretKey(base64.decode(secretKey))
    : undefined;

  const generateKeypair = () => {
    assign(base64.encode(Buffer.from(new web3.Keypair().secretKey)));
  };

  return (
    <>
      <div>{kp ? <>{kp.publicKey.toBase58()}</> : <>No Keypair!</>}</div>
      <div>
        <button
          onClick={() => {
            generateKeypair();
          }}
        >
          Generate keypair
        </button>
      </div>
    </>
  );
}

export default App;
