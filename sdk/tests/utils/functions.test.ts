import { describe, it } from "vitest";
import { deriveSeed } from "../../src/utils/functions";

describe("deriveSeed", () => {
  it("should run", () => {
    const seeds = new Uint8Array();

    deriveSeed([seeds]);
  });
});
