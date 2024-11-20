import type { Denops, Entrypoint } from "jsr:@denops/std@^7.3.2";
import { collect } from "jsr:@denops/std@^7.3.2/batch";
import * as fn from "jsr:@denops/std@^7.3.2/function";
import * as buffer from "jsr:@denops/std@^7.3.2/buffer";
import * as popup from "jsr:@denops/std@^7.3.2/popup";
import { assert, is } from "jsr:@core/unknownutil@^4.3.0";

import { Evaluator } from "./evaluator.ts";
import { type Location, Locator } from "./locator.ts";
import { Indexer } from "./indexer.ts";
import { defer, getwininfo, listFolds } from "./util.ts";

const INTERRUPT = "\x03";
const ESC = "\x1b";
const NL = "\n";
const CR = "\r";

const INITIAL_LENGTH = 1;

export const main: Entrypoint = (denops) => {
  denops.dispatcher = {
    "start": (initialLength) => {
      assert(initialLength, is.UnionOf([is.Undefined, is.Number]));
      return start(denops, { initialLength, signal: denops.interrupted });
    },
  };
};

type StartOptions = {
  initialLength?: number;
  signal?: AbortSignal;
};

async function start(
  denops: Denops,
  options: StartOptions = {},
): Promise<void> {
  const { signal } = options;
  const initialLength = options.initialLength ?? INITIAL_LENGTH;
  const [line_, column_, content_, wininfos, folds] = await collect(
    denops,
    (denops) => [
      fn.line(denops, "."),
      fn.col(denops, "."),
      fn.getline(denops, 1, "$"),
      getwininfo(denops),
      listFolds(denops),
    ],
  );
  signal?.throwIfAborted();
  const base = { row: line_, col: column_ };
  const content = content_.map((value, i) => ({ row: i + 1, value }));
  const wininfo = wininfos[0];

  const evaluator = new Evaluator(base);
  const locator = new Locator();

  // Create visible content
  const visibleContent = content
    // Remove lines outside of the window
    .filter(({ row }) => wininfo.topline <= row && row <= wininfo.botline)
    // Remove lines in folds
    .filter(({ row }) =>
      !folds.some(([start, end]) => start < row && row <= end)
    )
    // Add fold text
    .map((record) => {
      const fold = folds.find(([start]) => start === record.row);
      if (fold) {
        return {
          ...record,
          fold: fold[2],
        };
      }
      return {
        ...record,
        fold: undefined,
      };
    });

  // Show overlay
  await using overlay = await popup.open(denops, {
    relative: "editor",
    row: wininfo.winrow,
    col: wininfo.wincol,
    width: wininfo.width,
    height: wininfo.height,
    highlight: {
      normal: "InitialOverlayNormal",
    },
  });
  signal?.throwIfAborted();
  await fn.win_execute(
    denops,
    overlay.winid,
    "setlocal filetype=initial-overlay",
  );
  signal?.throwIfAborted();
  await buffer.replace(
    denops,
    overlay.bufnr,
    visibleContent.map(({ value, fold }) => fold ?? value),
  );
  signal?.throwIfAborted();
  await denops.cmd(
    `redraw | echohl Title | echo "[initial] Initial Character Input Mode" | echohl NONE`,
  );
  signal?.throwIfAborted();

  // Get an 'initial' character from the user.
  const initial = await readUserInput(denops, initialLength);
  signal?.throwIfAborted();
  if (initial == null) {
    return;
  }

  // Find locations of 'initial' in the content then score and sort them.
  const locations = locator
    .locate(initial, visibleContent)
    .map((location) => ({ ...location, score: evaluator.score(location) }))
    .sort((a, b) => b.score - a.score);

  // Shortcut
  switch (locations.length) {
    case 0:
      return;
    case 1:
      await jumpToLocation(denops, locations[0]);
  }

  // Generate labels
  const indexer = new Indexer(locations!.length);
  const labels = locations!.map((location) => {
    const offset = wininfo.topline - 1 + folds
      .filter(([_, end]) => end < location.row)
      .map(([start, end]) => end - start)
      .reduce((acc, cur) => acc + cur, 0);
    const key = indexer.next();
    const line = location.row - offset;
    const column = location.col;
    return {
      line,
      column,
      value: key,
      length: key.length,
      highlight: "InitialOverlayLabel",
      location,
    };
  });

  // Generate annotated content
  const annotatedContent = visibleContent
    .map((record) => {
      const { value, fold, row } = record;
      const columns = labels.filter(({ location }) => location.row === row);
      const newValue = columns.reduce((acc, { location, value }) => {
        const head = acc.slice(0, Math.max(0, location.col - 1));
        const tail = acc.slice(location.col + value.length - 1);
        return head + value + tail;
      }, fold ?? value);
      return { ...record, value: newValue };
    });

  // Apply labels to the overlay
  await buffer.replace(
    denops,
    overlay.bufnr,
    annotatedContent.map(({ value }) => value),
  );
  signal?.throwIfAborted();
  await buffer.decorate(denops, overlay.bufnr, labels);
  signal?.throwIfAborted();
  await denops.cmd(
    `redraw | echohl Title | echo "[initial] Label Jump Mode" | echohl NONE`,
  );
  signal?.throwIfAborted();
  await using _decoration = defer(async () => {
    await buffer.undecorate(denops, overlay.bufnr);
    await denops.cmd("redraw");
  });

  // Wait until the user selects a label and jump to the location if found.
  const key = await readUserInput(denops, indexer.length);
  if (!key) {
    return;
  }
  signal?.throwIfAborted();
  const label = labels.find(({ value }) => value === key);
  if (label) {
    await jumpToLocation(denops, label.location);
  }
}

async function readUserInput(
  denops: Denops,
  n: number,
): Promise<string | null> {
  let key = "";
  while (key.length < n) {
    const char = await fn.getcharstr(denops);
    switch (char) {
      case "":
      case INTERRUPT:
      case ESC:
      case NL:
      case CR:
        return null;
    }
    key += char;
  }
  return key;
}

async function jumpToLocation(
  denops: Denops,
  location: Location,
): Promise<void> {
  await denops.cmd(`normal! ${location.row}G${location.col}|zv`);
}
