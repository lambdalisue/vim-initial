const LETTERS = "abcdefghijklmnopqrstuvwxyz";

export type IndexerOptions = {
  /**
   * The letters to use for indexing.
   */
  letters?: string;
};

/**
 * An indexer that generates unique strings.
 *
 * It generates shortest combination of letters that are unique to
 * describe the specified number of items.
 *
 * For example, if the count is 26, it generates "a" to "z".
 * If the count is 27, it generates "aa" to "ba".
 */
export class Indexer {
  #count: number;
  #letters: string;
  #base: number;
  #length: number;
  #index = 0;

  constructor(count: number, options: IndexerOptions = {}) {
    this.#count = count;
    this.#letters = options.letters ?? LETTERS;
    this.#base = this.#letters.length;
    this.#length = calcLength(count, this.#base);
  }

  get length(): number {
    return this.#length;
  }

  /**
   * Get the next unique string.
   */
  next(): string {
    if (this.#index >= this.#count) {
      throw new Error("All unique strings have been generated.");
    }
    let currentIndex = this.#index;
    let result = "";
    for (let i = 0; i < this.#length; i++) {
      result = this.#letters[currentIndex % this.#base] + result;
      currentIndex = Math.floor(currentIndex / this.#base);
    }
    result = result.padStart(this.#length, this.#letters[0]);
    this.#index++;
    return result;
  }
}

function calcLength(count: number, base: number): number {
  // Math.ceil(Math.log10(count) / Math.log10(base)) is not accurate
  let length = 1;
  while (base ** length < count) {
    length++;
  }
  return length;
}
