import { expect } from "chai";

describe("test", () => {
  it("test1", () => {
    expect("x").to.eq("x");
  });

  it("test2", () => {
    expect("x").to.not.eq("y");
  });
});
