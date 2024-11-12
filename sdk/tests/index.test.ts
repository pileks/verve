import { describe, it, expect, expectTypeOf } from "vitest";
import { helloWorld } from "../src";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";

describe("helloWorld", () => {
  it("should return the transfer transaction instruction that was passed to it", () => {
    const from = new Keypair();
    const to = new Keypair();

    const initialIx = SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: 1 * LAMPORTS_PER_SOL,
    });

    const returnedIx = helloWorld(initialIx);

    expectTypeOf(returnedIx).toEqualTypeOf(initialIx);

    expect(returnedIx).to.deep.eq(initialIx);
  });
});
