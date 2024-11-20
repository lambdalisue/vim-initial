import type { Location } from "./locator.ts";

const colBonus = 0.2;
const rowBonus = 1;

/**
 * Evaluate the distance between two locations.
 */
export class Evaluator {
  #base: Location;

  constructor(base: Location) {
    this.#base = base;
  }

  /**
   * Score the distance between the base location and the given location.
   */
  score(location: Location): number {
    const dx = Math.abs(location.col - this.#base.col);
    const dy = Math.abs(location.row - this.#base.row);
    const dr = Math.sqrt(
      (dx * colBonus) ** 2 + (dy * rowBonus) ** 2,
    );
    return dr;
  }
}
