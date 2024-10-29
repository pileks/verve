import EventEmitter from "eventemitter3";
import { PublicKey, type SendOptions } from "@solana/web3.js";
import type { VerveIframeMessage } from "../types";

export default abstract class WalletAdapter extends EventEmitter {
  abstract get publicKey(): PublicKey | undefined;
  abstract get connected(): boolean;

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract signTransaction(transaction: Uint8Array): Promise<Uint8Array>;
  abstract signAllTransactions(
    transactions: Uint8Array[]
  ): Promise<Uint8Array[]>;
  abstract signAndSendTransaction(
    transaction: Uint8Array,
    options?: SendOptions
  ): Promise<string>;
  abstract signMessage(
    data: Uint8Array,
    display: "hex" | "utf8"
  ): Promise<Uint8Array>;
  abstract handleMessage(data: VerveIframeMessage): void;
}
