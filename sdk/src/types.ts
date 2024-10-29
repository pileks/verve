import type { Cluster } from "@solana/web3.js";

export interface VerveConfig {
  type: "web" | "embeded";
  network?: Cluster;
  provider: string;
  params?: Record<any, any>;
}

export type PromiseCallback = (...args: unknown[]) => unknown;

export interface VerveIframeEvent {
  type: string;
  data: any;
}

export interface VerveIframeRequest {
  method: string;
  params?: unknown;
}

export interface VerveIframeResponseMessage {
  type: "response";
  id: string;
  result?: unknown;
  error?: unknown;
}

export interface VerveIframeEventMessage {
  type: "event";
  id: string;
  event: VerveIframeEvent;
}

export interface VerveIframeResizeCoordinates {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  width: number | string;
  height: number | string;
}

export interface VerveIframeResizeCoordinatesMessage {
  resizeMode: "coordinates";
  params: VerveIframeResizeCoordinates;
}

export interface VerveIframeResizeModes {
  mode: "fullscreen" | "hide";
}

export interface VerveIframeResizeMode {
  resizeMode: "full";
  params: VerveIframeResizeModes;
}

export type VerveIframeResizeMessage = {
  type: "resize";
  id: string;
} & (VerveIframeResizeCoordinatesMessage | VerveIframeResizeMode);

export type VerveIframeMessage =
  | VerveIframeResponseMessage
  | VerveIframeEventMessage;

export type MessageHandlers = {
  [id: string]: {
    resolve: PromiseCallback;
    reject: PromiseCallback;
  };
};
