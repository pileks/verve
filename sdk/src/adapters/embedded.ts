import { PublicKey, type SendOptions } from "@solana/web3.js";
import type {
  MessageHandlers,
  VerveIframeRequest,
  VerveIframeResponseMessage,
} from "../types";
import WalletAdapter from "./base";
import bs58 from "bs58";
import { v4 } from "uuid";

export default class EmbeddedAdapter extends WalletAdapter {
  private _iframe: HTMLIFrameElement;
  private _publicKey: PublicKey | undefined;
  private _messageHandlers: MessageHandlers = {};

  constructor(iframe: HTMLIFrameElement) {
    super();

    this._iframe = iframe;
    // this._publicKey = new PublicKey(publicKey?.toString());
  }

  override get publicKey(): PublicKey | undefined {
    return this._publicKey;
  }

  override get connected(): boolean {
    return true;
  }

  override async connect(): Promise<void> {
    if (this.connected) {
      throw new Error("Wallet is already connected");
    }

    try {
      const publicKey = (await this._sendMessage({
        method: "connect",
        params: {
          // TBD
        },
      })) as string;

      this._publicKey = new PublicKey(publicKey);
    } catch (e) {
      throw new Error(e?.toString?.() || "Failed to connect");
    }

    return new Promise((resolve) => resolve());
  }

  override async disconnect(): Promise<void> {
    await this._sendMessage({
      method: "disconnect",
    });
  }

  override async signTransaction(transaction: Uint8Array): Promise<Uint8Array> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      const signedTransaction = (await this._sendMessage({
        method: "signTransaction",
        params: {
          transaction: bs58.encode(transaction),
        },
      })) as string;

      return bs58.decode(signedTransaction);
    } catch (e) {
      throw new Error(e?.toString?.() || "Failed to sign transaction");
    }
  }

  override async signAllTransactions(
    transactions: Uint8Array[]
  ): Promise<Uint8Array[]> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      const signedTransactions = (await this._sendMessage({
        method: "signAllTransactions",
        params: {
          transactions: transactions.map((transaction) =>
            bs58.encode(transaction)
          ),
        },
      })) as string[];

      return signedTransactions.map((transaction) => bs58.decode(transaction));
    } catch (e) {
      throw new Error(e?.toString?.() || "Failed to sign transactions");
    }
  }

  override async signAndSendTransaction(
    transaction: Uint8Array,
    options?: SendOptions
  ): Promise<string> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await this._sendMessage({
        method: "signAndSendTransaction",
        params: {
          transaction: bs58.encode(transaction),
          options,
        },
      });

      return result as string;
    } catch (e) {
      throw new Error(e?.toString?.() || "Failed to sign and send transaction");
    }
  }

  override async signMessage(
    data: Uint8Array,
    display: "hex" | "utf8"
  ): Promise<Uint8Array> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await this._sendMessage({
        method: "signMessage",
        params: {
          data,
          display,
        },
      });

      return Uint8Array.from(bs58.decode(result as string));
    } catch (e) {
      throw new Error(e?.toString?.() || "Failed to sign message");
    }
  }

  override handleMessage(data: VerveIframeResponseMessage): void {
    const messageHandler = this._messageHandlers[data.id];

    if (messageHandler) {
      const { resolve, reject } = messageHandler;

      delete this._messageHandlers[data.id];

      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    }
  }

  private _sendMessage = (data: VerveIframeRequest) => {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }

    return new Promise((resolve, reject) => {
      const messageId = v4();

      this._messageHandlers[messageId] = { resolve, reject };

      this._iframe?.contentWindow?.postMessage(
        {
          channel: "verveWalletAdapterToIframe",
          data: { id: messageId, ...data },
        },
        "*"
      );
    });
  };
}
