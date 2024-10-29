import { EventEmitter } from "eventemitter3";
import type { Cluster, PublicKey } from "@solana/web3.js";
import type { PromiseCallback, VerveConfig, VerveIframeMessage } from "./types";
import type WalletAdapter from "./adapters/base";

export default class Verve extends EventEmitter {
  private _network: Cluster = "mainnet-beta";
  private _provider: string | undefined;
  private _iframeParams: Record<string, any> = {};
  private _adapterInstance: WalletAdapter | undefined;
  private _element: HTMLElement | undefined;
  private _iframe: HTMLIFrameElement | undefined;
  private _connectHandler:
    | {
        resolve: PromiseCallback;
        reject: PromiseCallback;
      }
    | undefined;

  private _iframeUrl = "http://localhost:5173/";
  private _iframeOrigin = new URL(this._iframeUrl).origin;

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

    this._iframe = this._createIframe();
  }

  public get publicKey(): PublicKey | undefined {
    return this._adapterInstance?.publicKey;
  }

  public get connected(): boolean {
    return !!this._adapterInstance?.connected;
  }

  public async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    this._createIframe();

    await new Promise((resolve, reject) => {
      this._connectHandler = { resolve, reject };
    });
  }

  async disconnect() {
    if (!this._adapterInstance) {
      return;
    }

    await this._adapterInstance.disconnect();

    this._disconnected();

    this.emit("disconnect");
  }

  private _createIframe(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");

    iframe.src = this._iframeUrl;

    iframe.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 600px;
      overflow: hidden;
      zIndex: 99999;
      border: none
    `;

    iframe.sandbox.value =
      "allow-scripts allow-same-origin allow-popups allow-modals allow-forms allow-top-navigation allow-popups-to-escape-sandbox allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation";

    iframe.allow = "clipboard-write; clipboard-read;";

    iframe.onload = () => {
      iframe.contentWindow?.postMessage(
        {
          type: "initIframe",
          data: { origin: window.location.origin },
        },
        this._iframeOrigin
      );
    };

    if (this._isMobileDevice()) {
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.transform = "";
    }

    document.body.appendChild(iframe);

    return iframe;
  }

  private _isMobileDevice(): boolean {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  private _toggleIframe(): void {
    if (!this._iframe) {
      return;
    }

    if (this._iframe.style.display === "none") {
      this._iframe.style.display = "block";
    } else {
      this._iframe.style.display = "none";
    }
  }

  private _disconnected = () => {
    window.removeEventListener("message", this._handleMessage, false);
    this._removeIframe();

    this._adapterInstance = undefined;
  };

  private _handleMessage = (event: MessageEvent) => {
    if (event.data?.channel !== "solflareIframeToWalletAdapter") {
      return;
    }

    const data: VerveIframeMessage = event.data.data || {};
  };

  private _removeIframe(): void {
    if (this._iframe) {
      this._iframe.remove();

      this._iframe = undefined;
    }
  }
}
