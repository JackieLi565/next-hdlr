import { describe, it, expect } from "vitest";
import DefaultHandler from "./defaultHandler";

describe("DefaultHandler", () => {
  it("should create different instances of RouteHandler on separate calls", () => {
    const handler = new DefaultHandler();

    const instance1 = handler.create();
    const instance2 = handler.create();

    expect(instance1).not.toBe(instance2);
  });
});
