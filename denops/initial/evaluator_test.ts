import { assertEquals, assertGreater } from "jsr:@std/assert@^1.0.8";
import { Evaluator } from "./evaluator.ts";

Deno.test("Evaluator", async (t) => {
  await t.step("should returns 0 if the location is the same", () => {
    const row = 10, col = 10;
    const rater = new Evaluator({ row, col });
    assertEquals(rater.score({ row, col }), 0);
  });

  await t.step(
    "should returns same score for same row distance",
    () => {
      const row = 10, col = 10;
      const rater = new Evaluator({ row, col });
      assertEquals(
        rater.score({ row: row + 1, col }),
        rater.score({ row: row - 1, col }),
      );
    },
  );

  await t.step(
    "should returns same score for same col distance",
    () => {
      const row = 10, col = 10;
      const rater = new Evaluator({ row, col });
      assertEquals(
        rater.score({ row, col: col - 1 }),
        rater.score({ row, col: col + 1 }),
      );
    },
  );

  await t.step(
    "should returns larger value for line distance than column distance",
    () => {
      const row = 10, col = 10;
      const rater = new Evaluator({ row, col });
      assertGreater(
        rater.score({ row: row + 10, col }),
        rater.score({ row, col: col + 10 }),
      );
    },
  );
});
