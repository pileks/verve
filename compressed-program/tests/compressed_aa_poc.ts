import { setProvider, AnchorProvider, workspace } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CompressedAaPoc } from "../target/types/compressed_aa_poc";

describe("token-escrow", () => {
  // Configure the client to use the local cluster.
  setProvider(AnchorProvider.env());

  const program = workspace.CompressedAaPoc as Program<CompressedAaPoc>;

  it("Is initialized!", async () => {
    // Add your test here.
    // const tx = await program.methods.initWallet([] as Buffer[]).rpc();
    // console.log("Your transaction signature", tx);
  });
});
