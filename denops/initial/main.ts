import "./polyfill.ts";

import type { Denops, Entrypoint } from "jsr:@denops/std@^7.4.0";
import { collect } from "jsr:@denops/std@^7.4.0/batch";
import * as fn from "jsr:@denops/std@^7.4.0/function";
import { assert, is } from "jsr:@core/unknownutil@^4.3.0";

import { type Location, Locator } from "./locator.ts";
import { Indexer } from "./indexer.ts";
import {
  defer,
  type Fold,
  getByteLength,
  getwininfo,
  listFolds,
} from "./util.ts";
import { overlayCurtain, overlayLabels } from "./overlay.ts";

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
  const [content_, winid, wininfos, folds] = await collect(
    denops,
    (denops) => [
      fn.getline(denops, 1, "$"),
      fn.win_getid(denops),
      getwininfo(denops),
      listFolds(denops),
    ],
  );
  signal?.throwIfAborted();
  const content = content_.map((value, i) => ({ row: i + 1, value }));
  const wininfo = wininfos.find(({ winid: id }) => id === winid);
  if (!wininfo) {
    // Somewhat the target window is not found?
    throw new Error(`Window not found: ${winid}`);
  }

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
          // Fold text is truncated to fit the window width
          // so we have to mimic that behavior here.
          fold: fold[2].slice(0, wininfo.width - wininfo.textoff),
        };
      }
      return {
        ...record,
        fold: undefined,
      };
    });

  // Overlay the curtain
  await using _redraw = defer(() => denops.cmd(`echo "" | redraw`));
  await using _curtain = await overlayCurtain(denops, wininfo);
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

  // Find locations of 'initial' in the content.
  const locations = locator.locate(initial, visibleContent);

  // Shortcut
  switch (locations.length) {
    case 0:
      return;
    case 1:
      await jumpToLocation(denops, locations[0]);
  }

  // Generate labels
  const indexer = new Indexer(locations!.length);
  const labels = await Promise.all(locations!.map(async (location) => {
    const offset = calcOffset(location.row, wininfo.topline, folds);
    const key = indexer.next();
    const visualRow = location.row - offset;
    const visualCol = await fn.strdisplaywidth(
      denops,
      content[location.row - 1].value.substring(0, location.col),
    );
    return {
      ...location,
      visualRow,
      visualCol,
      value: key,
    };
  }));

  await using _labels = await overlayLabels(denops, wininfo, labels);
  signal?.throwIfAborted();
  await denops.cmd(
    `redraw | echohl Title | echo "[initial] Label Jump Mode" | echohl NONE`,
  );
  signal?.throwIfAborted();

  // Wait until the user selects a label and jump to the location if found.
  const key = await readUserInput(denops, indexer.length);
  if (!key) {
    return;
  }
  signal?.throwIfAborted();
  const label = labels.find(({ value }) => value === key);
  if (label) {
    // Calculate proper col
    const row = label.row;
    const col = getByteLength(content[row - 1].value.substring(0, label.col));
    await jumpToLocation(denops, { row: label.row, col });
  }
}

function calcOffset(row: number, topline: number, folds: Fold[]): number {
  return folds
    .filter(([start, end]) => topline <= start && end < row)
    .map(([start, end]) => end - start)
    .reduce((acc, cur) => acc + cur, topline - 1);
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
  await fn.cursor(denops, [location.row, location.col]);
  await denops.cmd("normal! zv");
}
