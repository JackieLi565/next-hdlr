import { describe, it, expect, vi } from "vitest";
import DefaultHandler from "./defaultHandler";
import { mockReq, mockRes } from "./mocks";
import { Config } from "./types";
import { RequestMethod } from "./internal/types";

describe("DefaultHandler", () => {
  it("should create different instances of RouteHandler on separate calls", () => {
    const handler = new DefaultHandler();

    const instance1 = handler.create();
    const instance2 = handler.create();

    expect(instance1).not.toBe(instance2);
  });

  describe("Default Configuration", () => {
    const defaultConfig: Config = {
      sessionFn: vi.fn(),
      errorFn: vi.fn(),
      methodFn: vi.fn(),
    };
    const defaultHandler = new DefaultHandler(defaultConfig);

    it("should execute default 'sessionFn'", async () => {
      const req = mockReq(RequestMethod.GET),
        res = mockRes();

      const handler = defaultHandler.create();
      await handler.get(vi.fn()).build()(req, res);

      expect(defaultConfig.sessionFn).toBeCalled();
    });

    it("should execute default 'errorFn'", async () => {
      const req = mockReq(RequestMethod.GET),
        res = mockRes();

      const handler = defaultHandler.create();
      await handler
        .get(
          vi.fn(() => {
            throw new Error("Something went wrong");
          })
        )
        .build()(req, res);

      expect(defaultConfig.errorFn).toBeCalled();
    });

    it("should execute default 'methodFn'", async () => {
      const req = mockReq(RequestMethod.POST),
        res = mockRes();

      const handler = defaultHandler.create();
      await handler.get(vi.fn()).build()(req, res);

      expect(defaultConfig.methodFn).toBeCalled();
    });
  });
});
