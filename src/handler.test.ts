import { describe, expect, it, vi } from "vitest";
import { Handler } from "./handler";
import { RequestMethod } from "./internal/types";
import { DuplicateMethodError } from "./error";
import { mockReq, mockRes } from "./mocks";

describe("RouteHandler", () => {
  it("should throw if the same method handler is called twice", async () => {
    const handler = new Handler();
    handler.GET(vi.fn());

    expect(() => handler.GET(vi.fn())).toThrow(DuplicateMethodError);
  });

  describe("Request Method Handlers", () => {
    const methods = [
      RequestMethod.GET,
      RequestMethod.POST,
      RequestMethod.PATCH,
      RequestMethod.PUT,
      RequestMethod.DELETE,
    ];

    // Create test for each method handler
    for (const method of methods) {
      it(`${method} request should run`, async () => {
        const methodHandler = vi.fn();
        const handler = new Handler();
        await handler[method as string](methodHandler);

        handler.build()(mockReq(method), mockRes);

        expect(methodHandler).toBeCalled();
      });
    }
  });
});
