import { assertEquals } from "jsr:@std/assert@^1.0.8";
import { Indexer } from "./indexer.ts";

Deno.test("Indexer", async (t) => {
  const options = {
    letters: "abc",
  };
  await t.step(
    "should returns a, b, c",
    () => {
      const indexer = new Indexer(3, options);
      const expected = ["a", "b", "c"];
      const results = [];
      for (let i = 0; i < expected.length; i++) {
        results.push(indexer.next());
      }
      assertEquals(results, expected);
    },
  );

  await t.step(
    "should returns aa, ab, ac, ba",
    () => {
      const indexer = new Indexer(4, options);
      const expected = ["aa", "ab", "ac", "ba"];
      const results = [];
      for (let i = 0; i < expected.length; i++) {
        results.push(indexer.next());
      }
      assertEquals(results, expected);
    },
  );

  await t.step(
    "should returns aa, ab, ac, ba, bb, bc, ca, cb, cc",
    () => {
      const indexer = new Indexer(9, options);
      const expected = [
        "aa",
        "ab",
        "ac",
        "ba",
        "bb",
        "bc",
        "ca",
        "cb",
        "cc",
      ];
      const results = [];
      for (let i = 0; i < expected.length; i++) {
        results.push(indexer.next());
      }
      assertEquals(results, expected);
    },
  );

  await t.step(
    "should returns aa, ab, ac, ba, bb, bc, ca, cb, cc",
    () => {
      const indexer = new Indexer(10, options);
      const expected = [
        "aaa",
        "aab",
        "aac",
        "aba",
        "abb",
        "abc",
        "aca",
        "acb",
        "acc",
        "baa",
      ];
      const results = [];
      for (let i = 0; i < expected.length; i++) {
        results.push(indexer.next());
      }
      assertEquals(results, expected);
    },
  );
});
