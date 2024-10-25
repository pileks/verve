import type {
  EventEmitter,
  SendTransactionOptions,
  SupportedTransactionVersions,
  TransactionOrVersionedTransaction,
  WalletName,
} from "@solana/wallet-adapter-base";
import {
  BaseMessageSignerWalletAdapter,
  isIosAndRedirectable,
  isVersionedTransaction,
  scopePollingDetectionStrategy,
  WalletAccountError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base";
import type {
  Connection,
  SendOptions,
  Transaction,
  TransactionSignature,
  TransactionVersion,
  VersionedTransaction,
} from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

interface VerveWalletEvents {
  connect(...args: unknown[]): unknown;
  disconnect(...args: unknown[]): unknown;
  accountChanged(newPublicKey: PublicKey): unknown;
}

interface VerveWallet extends EventEmitter<VerveWalletEvents> {
  isVerve?: boolean;
  publicKey?: { toBytes(): Uint8Array };
  isConnected: boolean;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ): Promise<T[]>;
  signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    options?: SendOptions
  ): Promise<{ signature: TransactionSignature }>;
}

interface VerveWindow extends Window {
  verve?: VerveWallet;
}

declare const window: VerveWindow;

export interface VerveWalletAdapterConfig {}

export const VerveWalletName = "Verve" as WalletName<"Verve">;

export class VerveWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = VerveWalletName;
  url: string = "https://x.com/verve_wallet";
  icon: string =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiB2aWV3Qm94PSIwIDAgMTA4IDEwOCIgZmlsbD0ibm9uZSIgaWQ9InZydiI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8zXzE4NykiPgo8cGF0aCBkPSJNOTYgMEgxMkM1LjM3MjU4IDAgMCA1LjM3MjU4IDAgMTJWOTZDMCAxMDIuNjI3IDUuMzcyNTggMTA4IDEyIDEwOEg5NkMxMDIuNjI3IDEwOCAxMDggMTAyLjYyNyAxMDggOTZWMTJDMTA4IDUuMzcyNTggMTAyLjYyNyAwIDk2IDBaIiBmaWxsPSIjMDAwMEZGIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMV8zXzE4NykiPgo8cGF0aCBkPSJNOTcgNjMuMDkxNkg2OC44OTUzTDgyLjk0ODQgODcuNDA2NEw2OC4wNTI0IDk2TDU0LjAwMjEgNzEuNjg1Mkw1NC44NDY0IDcwLjIyMzNDNjMuNTQwNCA1NS4xNzc0IDc5LjYwOTIgNDUuOTA3MSA5NyA0NS45MDcxSDk3LjAwMjhWNjMuMDkwMkw5NyA2My4wOTE2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTM5Ljk0NzYgOTUuOTk4NkwyNS4wNTMgODcuNDA2NEwzOS4xMDYxIDYzLjA5MTZIMTFWNDUuOTA4NEgzOS4xMDM0TDM5Ljk0OSA0Ny4zNzAzQzQ4LjY0NDQgNjIuNDE2MiA0OC42NDQ0IDgwLjk1NDEgMzkuOTQ5IDk1Ljk5ODYiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04Mi45NDY5IDIxLjU5MzZMNjguODkzOSA0NS45MDg0SDY3LjIwNTNDNDkuODE1OCA0NS45MDg0IDMzLjc0NzEgMzYuNjM5NSAyNS4wNTE2IDIxLjU5MzZMMzkuOTQ3NiAxM0w1NC4wMDA2IDM3LjMxNzZMNjguMDUyMyAxM0w4Mi45NDY5IDIxLjU5MzZaIiBmaWxsPSJ3aGl0ZSIvPgo8L2c+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfM18xODciPgo8cmVjdCB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPGNsaXBQYXRoIGlkPSJjbGlwMV8zXzE4NyI+CjxyZWN0IHdpZHRoPSI4NiIgaGVpZ2h0PSI4MyIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExIDEzKSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPg==";
  supportedTransactionVersions: SupportedTransactionVersions = new Set([
    "legacy" as TransactionVersion,
    0 as TransactionVersion,
  ]);

  private _connecting: boolean;
  private _wallet: VerveWallet | null;
  private _publicKey: PublicKey | null;
  private _config: VerveWalletAdapterConfig;
  private _readyState: WalletReadyState =
    typeof window === "undefined" || typeof document === "undefined"
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor(config: VerveWalletAdapterConfig = {}) {
    super();
    this._connecting = false;
    this._wallet = null;
    this._publicKey = null;
    this._config = config;

    if (this._readyState !== WalletReadyState.Unsupported) {
      if (isIosAndRedirectable()) {
        // when in iOS (not webview), set Verve as loadable instead of checking for install
        this._readyState = WalletReadyState.Loadable;

        this.emit("readyStateChange", this._readyState);
      } else {
        scopePollingDetectionStrategy(() => {
          if (window.verve?.isVerve) {
            this._readyState = WalletReadyState.Installed;

            this.emit("readyStateChange", this._readyState);

            return true;
          }

          return false;
        });
      }
    }
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get readyState() {
    return this._readyState;
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) throw new WalletNotConnectedError();

      try {
        const { signature } = await wallet.signMessage(message);
        return signature;
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signTransaction<
    T extends TransactionOrVersionedTransaction<
      this["supportedTransactionVersions"]
    >
  >(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) {
        throw new WalletNotConnectedError();
      }

      try {
        return (await wallet.signTransaction(transaction)) || transaction;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);

      throw error;
    }
  }

  override async signAllTransactions<
    T extends TransactionOrVersionedTransaction<
      this["supportedTransactionVersions"]
    >
  >(transactions: T[]): Promise<T[]> {
    try {
      const wallet = this._wallet;

      if (!wallet) {
        throw new WalletNotConnectedError();
      }

      try {
        return (await wallet.signAllTransactions(transactions)) || transactions;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);

      throw error;
    }
  }

  override async sendTransaction(
    transaction: TransactionOrVersionedTransaction<
      this["supportedTransactionVersions"]
    >,
    connection: Connection,
    options: SendTransactionOptions = {}
  ): Promise<TransactionSignature> {
    try {
      const wallet = this._wallet;

      if (!wallet) {
        throw new WalletNotConnectedError();
      }

      try {
        const { signers, ...sendOptions } = options;

        if (isVersionedTransaction(transaction)) {
          signers?.length && transaction.sign(signers);
        } else {
          transaction = await this.prepareTransaction(
            transaction,
            connection,
            sendOptions
          );

          signers?.length &&
            (transaction as Transaction).partialSign(...signers);
        }

        sendOptions.preflightCommitment =
          sendOptions.preflightCommitment || connection.commitment;

        const { signature } = await wallet.signAndSendTransaction(
          transaction,
          sendOptions
        );

        return signature;
      } catch (error: any) {
        if (error instanceof WalletError) throw error;

        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);

      throw error;
    }
  }

  override async autoConnect(): Promise<void> {
    // Skip autoconnect in the Loadable state
    // We can't redirect to a universal link without user input
    if (this.readyState === WalletReadyState.Installed) {
      await this.connect();
    }
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) {
        return;
      }

      if (this.readyState !== WalletReadyState.Installed) {
        throw new WalletNotReadyError();
      }

      this._connecting = true;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const wallet = window.verve;

      if (!wallet?.isConnected) {
        try {
          await wallet?.connect();
        } catch (error: any) {
          throw new WalletConnectionError(error?.message, error);
        }
      }

      if (!wallet?.publicKey) {
        throw new WalletAccountError();
      }

      let publicKey: PublicKey;

      try {
        publicKey = new PublicKey(wallet.publicKey.toBytes());
      } catch (error: any) {
        throw new WalletPublicKeyError(error?.message, error);
      }

      wallet.on("disconnect", this._disconnected);
      wallet.on("accountChanged", this._accountChanged);

      this._wallet = wallet;
      this._publicKey = publicKey;

      this.emit("connect", publicKey);
    } catch (error: any) {
      this.emit("error", error);

      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;

    if (wallet) {
      wallet.off("disconnect", this._disconnected);
      wallet.off("accountChanged", this._accountChanged);

      this._wallet = null;
      this._publicKey = null;

      try {
        await wallet.disconnect();
      } catch (error: any) {
        this.emit("error", new WalletDisconnectionError(error?.message, error));
      }
    }

    this.emit("disconnect");
  }

  private _disconnected = () => {
    const wallet = this._wallet;

    if (wallet) {
      wallet.off("disconnect", this._disconnected);
      wallet.off("accountChanged", this._accountChanged);

      this._wallet = null;
      this._publicKey = null;

      this.emit("error", new WalletDisconnectedError());
      this.emit("disconnect");
    }
  };

  private _accountChanged = (newPublicKey: PublicKey) => {
    const publicKey = this._publicKey;

    if (!publicKey) {
      return;
    }

    try {
      newPublicKey = new PublicKey(newPublicKey.toBytes());
    } catch (error: any) {
      this.emit("error", new WalletPublicKeyError(error?.message, error));

      return;
    }

    if (publicKey.equals(newPublicKey)) {
      return;
    }

    this._publicKey = newPublicKey;
    this.emit("connect", newPublicKey);
  };
}
