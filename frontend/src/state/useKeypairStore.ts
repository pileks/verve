import { create } from "zustand";
import { persist } from "zustand/middleware";
import anchor from "@coral-xyz/anchor";

type Keystore = {
  keypair: anchor.web3.Ed25519Keypair | undefined;
  assign: (kp: anchor.web3.Ed25519Keypair) => void;
};

export const useKeypairStore = create<Keystore>()(
  persist(
    (set) => ({
      keypair: undefined,
      assign: (kp) => set(() => ({ keypair: kp })),
    }),
    {
      name: "sprite-keypair-storage",
    }
  )
);
