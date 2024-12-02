import type { Denops } from "jsr:@denops/std@^7.3.2";
import * as fn from "jsr:@denops/std@^7.3.2/function";

const encoder = new TextEncoder();

export type Fold = [start: number, end: number, text: string];

export function listFolds(
  denops: Denops,
): Promise<Fold[]> {
  return denops.call("initial#internal#fold#list") as Promise<Fold[]>;
}

export type WinInfo = {
  winid: number;
  width: number;
  height: number;
  winrow: number;
  wincol: number;
  topline: number;
  botline: number;
  textoff: number;
};

export function getwininfo(denops: Denops): Promise<WinInfo[]> {
  return fn.getwininfo(denops) as Promise<WinInfo[]>;
}

export function defer(callback: () => Promise<void>): AsyncDisposable {
  return {
    [Symbol.asyncDispose]() {
      return callback();
    },
  };
}

export function getByteLength(s: string): number {
  return encoder.encode(s).length;
}
