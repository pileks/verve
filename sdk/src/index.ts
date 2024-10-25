import { EventEmitter } from "eventemitter3";
import type { PromiseCallback, VerveConfig } from "./types";
import type { Cluster } from "@solana/web3.js";

export default class Verve extends EventEmitter {
  private _network: Cluster = "mainnet-beta";
  private _provider: string | null = null;
  private _iframeParams: Record<string, any> = {};
  // private _adapterInstance: WalletAdapter | null = null;
  private _element: HTMLElement | null = null;
  private _iframe: HTMLIFrameElement | null = null;
  private _connectHandler: {
    resolve: PromiseCallback;
    reject: PromiseCallback;
  } | null = null;

  constructor(config?: VerveConfig) {
    super();

    if (config?.network) {
      this._network = config?.network;
    }

    if (config?.provider) {
      this._provider = config?.provider;
    }

    if (config?.params) {
      this._iframeParams = {
        ...config?.params,
      };
    }
  }
}
