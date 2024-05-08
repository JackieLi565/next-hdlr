import { describe, it, expect } from "vitest";
import Handler from "./core";

describe("Handler", () => {
  it("should return a new instance on each create call", () => {
    const handler = new Handler();
    const routeHandler1 = handler.create();
    const routeHandler2 = handler.create();

    expect(routeHandler1).not.toBe(routeHandler2);
  });

  it("should return a new instance on each create call with different configurations", () => {
    const handler = new Handler();
    const routeHandler1 = handler.create({
      methodFn: async (_, res) => res.send("Custom not allowed"),
    });
    const routeHandler2 = handler.create({
      unAuthFn: async (_, res) => res.send("Custom unauthorized"),
    });

    expect(routeHandler1).not.toBe(routeHandler2);
  });
});
