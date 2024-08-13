import { create } from "zustand";
import { persist } from "zustand/middleware";

type Keystore = {
  secretKey: string | undefined;
  assign: (key: string) => void;
};

export const useKeypairStore = create<Keystore>()(
  persist(
    (set) => ({
      secretKey: undefined,
      assign: (key) => set(() => ({ secretKey: key })),
    }),
    {
      name: "sprite-keypair-storage",
    }
  )
);
