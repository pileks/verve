import type { Cluster } from "@solana/web3.js";

export interface VerveConfig {
  type: "web" | "embeded";
  network?: Cluster;
  provider: string;
  params?: Record<any, any>;
}

export type PromiseCallback = (...args: unknown[]) => unknown;
