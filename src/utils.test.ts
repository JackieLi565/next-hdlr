import { describe, it, expect } from "vitest";
import { mergeConfigs } from "./utils";

describe("mergeConfigs", () => {
  it("should override default configurations correctly", () => {
    const defaultConfig = { a: 1, b: 2 };
    const overrideConfig = { b: 3, c: 4 };
    const expected = { a: 1, b: 3, c: 4 };

    const result = mergeConfigs(defaultConfig, overrideConfig);
    expect(result).toEqual(expected);
  });

  it("should handle empty override configurations", () => {
    const defaultConfig = { a: 1, b: 2 };
    const overrideConfig = {};
    const expected = { a: 1, b: 2 };

    const result = mergeConfigs(defaultConfig, overrideConfig);
    expect(result).toEqual(expected);
  });

  it("should handle no overrides provided as undefined", () => {
    const defaultConfig = { a: 1, b: 2 };
    const overrideConfig = undefined;
    const expected = { a: 1, b: 2 };

    const result = mergeConfigs(defaultConfig, overrideConfig);
    expect(result).toEqual(expected);
  });
});
