import {
  setProvider,
  AnchorProvider,
  workspace,
  Provider,
  getProvider,
} from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CompressedAaPoc } from "../target/types/compressed_aa_poc";
import { BN } from "bn.js";
import { createMerkleContext } from "@lightprotocol/stateless.js";

describe("token-escrow", () => {
  // Configure the client to use the local cluster.
  setProvider(AnchorProvider.env());

  const program = workspace.CompressedAaPoc as Program<CompressedAaPoc>;

  it("Is initialized!", async () => {
    // Add your test here.
    // const tx = await program.methods.initWallet().rpc();
    // console.log("Your transaction signature", tx);
  });
});
