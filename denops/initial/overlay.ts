import type { Denops } from "jsr:@denops/std@^7.3.2";
import * as fn from "jsr:@denops/std@^7.3.2/function";
import * as vimFn from "jsr:@denops/std@^7.3.2/function/vim";
import * as nvimFn from "jsr:@denops/std@^7.3.2/function/nvim";
import * as buffer from "jsr:@denops/std@^7.3.2/buffer";

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
    length: wininfo.botline - wininfo.topline + 1,
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
  visualRow: number;
  visualCol: number;
};

export function overlayLabels(
  denops: Denops,
  wininfo: WinInfo,
  labels: Label[],
): Promise<AsyncDisposable> {
  switch (denops.meta.host) {
    case "vim":
      return overlayLabelsVim(denops, wininfo, labels);
    case "nvim":
      return overlayLabelsNvim(denops, wininfo, labels);
  }
}

async function overlayLabelsVim(
  denops: Denops,
  wininfo: WinInfo,
  labels: Label[],
): Promise<AsyncDisposable> {
  const content = toVimContent(
    wininfo.width,
    wininfo.height,
    labels,
  );
  const mask = toVimMask(
    wininfo.width,
    wininfo.height,
    labels,
  );
  await using stack = new AsyncDisposableStack();
  const bufnr = await fn.bufadd(denops, "");
  const winid = await vimFn.popup_create(denops, bufnr, {
    line: wininfo.winrow,
    col: wininfo.wincol,
    highlight: HIGHLIGHT_LABEL,
    zindex: 100,
    mask,
  });
  stack.defer(async () => {
    await vimFn.popup_close(denops, winid);
  });
  await buffer.replace(denops, bufnr, content);
  stack.defer(async () => {
    await denops.cmd(`silent! bwipeout! ${bufnr}`);
  });
  await fn.win_execute(
    denops,
    winid,
    `setlocal buftype=nofile signcolumn=no nobuflisted nolist nonumber norelativenumber nowrap noswapfile filetype=initial-overlay`,
  );
  return stack.move();
}

async function overlayLabelsNvim(
  denops: Denops,
  wininfo: WinInfo,
  labels: Label[],
): Promise<AsyncDisposable> {
  const bufnr = await fn.winbufnr(denops, wininfo.winid);
  const namespace = await nvimFn.nvim_create_namespace(
    denops,
    "initial-overlay",
  );
  for (const label of labels) {
    await nvimFn.nvim_buf_set_extmark(
      denops,
      bufnr,
      namespace,
      label.row - 1,
      label.col - 1,
      {
        virt_text: [[label.value, [HIGHLIGHT_LABEL]]],
        virt_text_pos: "overlay",
        hl_mode: "combine",
      },
    );
  }
  return {
    async [Symbol.asyncDispose]() {
      await nvimFn.nvim_buf_clear_namespace(denops, bufnr, namespace, 0, -1);
    },
  };
}

function toVimContent(
  width: number,
  height: number,
  labels: Label[],
): string[] {
  const content = Array.from({ length: height }, () => " ".repeat(width));
  labels.forEach(({ visualRow, visualCol, value }) => {
    const y = visualRow - 1;
    const x = visualCol - 1;
    content[y] = content[y].slice(0, x) + value +
      content[y].slice(x + value.length);
  });
  return content;
}

function toVimMask(
  width: number,
  height: number,
  labels: Label[],
): (readonly [number, number, number, number])[] {
  return Array.from({ length: height }, (_, i) => {
    const row = i + 1;
    const columns = labels
      .filter(({ visualRow }) => visualRow === row)
      .sort((a, b) => a.visualCol - b.visualCol);
    let offset = 1;
    const masks = columns
      .map(({ visualCol, value }) => {
        if (visualCol === offset) {
          return undefined;
        }
        const mask = [offset, visualCol - 1, row, row] as const;
        offset = visualCol + value.length;
        return mask;
      })
      .filter((v) => v !== undefined);
    return [...masks, [offset, width, row, row] as const];
  }).flat();
}
