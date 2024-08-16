import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { AnchorProvider, web3 } from "@coral-xyz/anchor";
import base58 from "bs58";
import bodyParser from "body-parser";

dotenv.config();

const provider = AnchorProvider.local();

console.log(provider.publicKey);

const confirmTransaction = async (tx: string) => {
  const bh = await provider.connection.getLatestBlockhash();

  await provider.connection.confirmTransaction(
    {
      signature: tx,
      blockhash: bh.blockhash,
      lastValidBlockHeight: bh.lastValidBlockHeight,
    },
    "confirmed"
  );
}

provider.connection
  .requestAirdrop(provider.publicKey, web3.LAMPORTS_PER_SOL * 100)
  .then((x) => {
    console.log("Sent 100 SOL to wallet.");

    confirmTransaction(x).then(x => {
      console.log("SOL airdrop confirmed.");
    })
  });

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", async (req: Request, res: Response) => {
  res.json({
    pubkey: provider.publicKey.toBase58(),
  });
});

type TransactionRequestBody = {
  tx: string;
};

app.post(
  "/",
  async (req: Request, res: Response) => {
    const tx = web3.Transaction.from(base58.decode(req.body.tx));
    
    tx.feePayer = provider.publicKey;
    const signedTx = await provider.wallet.signTransaction(tx);

    res.json({
      tx: base58.encode(signedTx.serialize()),
    });
  }
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
