// Regex pattern to match the initial of each word in a string.
const pattern =
  /\b\w|(?<=\b|_)[a-zA-Z](?=[A-Z]*[a-z]*(?:_|$))|(?<=\b|[a-z])[A-Z]/g;

export type Location = {
  /**
   * The row number of the location. The first row is 1.
   */
  row: number;
  /**
   * The column number of the location. The first column is 1.
   */
  col: number;
};

export type Record = {
  /**
   * The row number of the record. The first row is 1.
   */
  row: number;
  /**
   * The value of the record.
   */
  value: string;
};

/**
 * The content of the file.
 */
export type Content = readonly Record[];

export class Locator {
  locate(initial: string, content: Content): Location[] {
    const locs: Location[] = [];
    const translate = (s: string) => s.toLowerCase();
    const needle = translate(initial);
    for (const record of content) {
      for (const m of record.value.matchAll(pattern)) {
        const text = record.value.slice(m.index);
        if (translate(text).startsWith(needle)) {
          locs.push({ row: record.row, col: m.index + 1 });
        }
      }
    }
    return locs;
  }
}
