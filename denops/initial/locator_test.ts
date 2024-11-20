import { assertEquals } from "jsr:@std/assert@^1.0.8";
import { type Content, type Location, Locator } from "./locator.ts";

Deno.test("locator", async (t) => {
  const locator = new Locator();

  await t.step("single character", async (t) => {
    await t.step("split by space", async (t) => {
      const content: Content = [
        { row: 1, value: "apple banana cherry" },
        { row: 2, value: "APPLE BANANA CHERRY" },
      ];

      await t.step("should locate 'a'", () => {
        const expect: Location[] = [
          { row: 1, col: 1 },
          { row: 2, col: 1 },
        ];
        const actual = locator.locate("a", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'b'", () => {
        const expect: Location[] = [
          { row: 1, col: 7 },
          { row: 2, col: 7 },
        ];
        const actual = locator.locate("b", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'c'", () => {
        const expect: Location[] = [
          { row: 1, col: 14 },
          { row: 2, col: 14 },
        ];
        const actual = locator.locate("c", content);
        assertEquals(actual, expect);
      });
    });

    await t.step("split by symbols", async (t) => {
      const content: Content = [
        { row: 1, value: "apple;banana;cherry" },
        { row: 2, value: "APPLE;BANANA;CHERRY" },
      ];

      await t.step("should locate 'a'", () => {
        const expect: Location[] = [
          { row: 1, col: 1 },
          { row: 2, col: 1 },
        ];
        const actual = locator.locate("a", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'b'", () => {
        const expect: Location[] = [
          { row: 1, col: 7 },
          { row: 2, col: 7 },
        ];
        const actual = locator.locate("b", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'c'", () => {
        const expect: Location[] = [
          { row: 1, col: 14 },
          { row: 2, col: 14 },
        ];
        const actual = locator.locate("c", content);
        assertEquals(actual, expect);
      });
    });

    await t.step("snake case", async (t) => {
      const content: Content = [
        { row: 1, value: "apple_banana_cherry" },
        { row: 2, value: "APPLE_BANANA_CHERRY" },
      ];

      await t.step("should locate 'a'", () => {
        const expect: Location[] = [
          { row: 1, col: 1 },
          { row: 2, col: 1 },
        ];
        const actual = locator.locate("a", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'b'", () => {
        const expect: Location[] = [
          { row: 1, col: 7 },
          { row: 2, col: 7 },
        ];
        const actual = locator.locate("b", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'c'", () => {
        const expect: Location[] = [
          { row: 1, col: 14 },
          { row: 2, col: 14 },
        ];
        const actual = locator.locate("c", content);
        assertEquals(actual, expect);
      });
    });

    await t.step("camel case", async (t) => {
      const content: Content = [
        { row: 1, value: "AppleBananaCherry" },
      ];

      await t.step("should locate 'a'", () => {
        const expect: Location[] = [
          { row: 1, col: 1 },
        ];
        const actual = locator.locate("a", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'b'", () => {
        const expect: Location[] = [
          { row: 1, col: 6 },
        ];
        const actual = locator.locate("b", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'c'", () => {
        const expect: Location[] = [
          { row: 1, col: 12 },
        ];
        const actual = locator.locate("c", content);
        assertEquals(actual, expect);
      });
    });
  });

  await t.step("two characters", async (t) => {
    await t.step("split by space", async (t) => {
      const content: Content = [
        { row: 1, value: "apple banana cherry" },
        { row: 2, value: "APPLE BANANA CHERRY" },
      ];

      await t.step("should locate 'ap'", () => {
        const expect: Location[] = [
          { row: 1, col: 1 },
          { row: 2, col: 1 },
        ];
        const actual = locator.locate("ap", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'ba'", () => {
        const expect: Location[] = [
          { row: 1, col: 7 },
          { row: 2, col: 7 },
        ];
        const actual = locator.locate("ba", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'ch'", () => {
        const expect: Location[] = [
          { row: 1, col: 14 },
          { row: 2, col: 14 },
        ];
        const actual = locator.locate("ch", content);
        assertEquals(actual, expect);
      });
    });

    await t.step("split by symbols", async (t) => {
      const content: Content = [
        { row: 1, value: "apple;banana;cherry" },
        { row: 2, value: "APPLE;BANANA;CHERRY" },
      ];

      await t.step("should locate 'ap'", () => {
        const expect: Location[] = [
          { row: 1, col: 1 },
          { row: 2, col: 1 },
        ];
        const actual = locator.locate("ap", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'ba'", () => {
        const expect: Location[] = [
          { row: 1, col: 7 },
          { row: 2, col: 7 },
        ];
        const actual = locator.locate("ba", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'ch'", () => {
        const expect: Location[] = [
          { row: 1, col: 14 },
          { row: 2, col: 14 },
        ];
        const actual = locator.locate("ch", content);
        assertEquals(actual, expect);
      });
    });

    await t.step("snake case", async (t) => {
      const content: Content = [
        { row: 1, value: "apple_banana_cherry" },
        { row: 2, value: "APPLE_BANANA_CHERRY" },
      ];

      await t.step("should locate 'ap'", () => {
        const expect: Location[] = [
          { row: 1, col: 1 },
          { row: 2, col: 1 },
        ];
        const actual = locator.locate("ap", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'ba'", () => {
        const expect: Location[] = [
          { row: 1, col: 7 },
          { row: 2, col: 7 },
        ];
        const actual = locator.locate("ba", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'ch'", () => {
        const expect: Location[] = [
          { row: 1, col: 14 },
          { row: 2, col: 14 },
        ];
        const actual = locator.locate("ch", content);
        assertEquals(actual, expect);
      });
    });

    await t.step("camel case", async (t) => {
      const content: Content = [
        { row: 1, value: "AppleBananaCherry" },
      ];

      await t.step("should locate 'ap'", () => {
        const expect: Location[] = [
          { row: 1, col: 1 },
        ];
        const actual = locator.locate("ap", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'ba'", () => {
        const expect: Location[] = [
          { row: 1, col: 6 },
        ];
        const actual = locator.locate("ba", content);
        assertEquals(actual, expect);
      });

      await t.step("should locate 'ch'", () => {
        const expect: Location[] = [
          { row: 1, col: 12 },
        ];
        const actual = locator.locate("ch", content);
        assertEquals(actual, expect);
      });
    });
  });
});
