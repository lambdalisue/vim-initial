import type { Denops } from "jsr:@denops/std@^7.3.2";
import * as fn from "jsr:@denops/std@^7.3.2/function";
import * as buffer from "jsr:@denops/std@^7.3.2/buffer";
import * as popup from "jsr:@denops/std@^7.3.2/popup";

import type { Location } from "./locator.ts";
import { defer, type WinInfo } from "./util.ts";

const HIGHLIGHT_CURTAIN = "InitialOverlayCurtain";
const HIGHLIGHT_LABEL = "InitialOverlayLabel";

export async function overlayCurtain(
  denops: Denops,
  wininfo: WinInfo,
): Promise<AsyncDisposable> {
  const bufnr = await fn.winbufnr(denops, wininfo.winid);
  const decorations = Array.from({
    length: wininfo.botline - wininfo.topline,
  }, (_, i) => ({
    line: wininfo.topline + i,
    column: 1,
    length: wininfo.width - wininfo.textoff,
    highlight: HIGHLIGHT_CURTAIN,
  }));
  await buffer.decorate(denops, bufnr, decorations);
  return defer(() => buffer.undecorate(denops, bufnr));
}

export type Label = Location & {
  value: string;
  location: Location;
};

export async function overlayLabels(
  denops: Denops,
  wininfo: WinInfo,
  labels: Label[],
): Promise<AsyncDisposable> {
  await using stack = new AsyncDisposableStack();
  for (const label of labels) {
    const winrow = wininfo.winrow + label.row - 1;
    const wincol = wininfo.wincol + wininfo.textoff + label.col - 1;
    const width = label.value.length;
    const height = 1;
    const pwin = stack.use(
      await popup.open(denops, {
        relative: "editor",
        row: winrow,
        col: wincol,
        width: width,
        height: height,
        highlight: {
          normal: HIGHLIGHT_LABEL,
        },
        zindex: 100,
        noRedraw: true,
      }),
    );
    await buffer.replace(denops, pwin.bufnr, [label.value]);
    await fn.win_execute(
      denops,
      pwin.winid,
      `setlocal buftype=nofile bufhidden=wipe signcolumn=no nobuflisted nolist nonumber norelativenumber nowrap noswapfile filetype=initial-overlay`,
    );
  }
  return stack.move();
}
