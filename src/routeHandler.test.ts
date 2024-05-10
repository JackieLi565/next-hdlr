import { describe, expect, it, vi } from "vitest";
import RouteHandler from "./routeHandler";
import { mockReq, mockRes } from "./mocks";
import { RequestMethod, ResponseStatus } from "./internal/types";

describe("RouteHandler", () => {
  describe("Request Method Handlers", () => {
    const methods = {
      [RequestMethod.GET]: "get",
      [RequestMethod.POST]: "post",
      [RequestMethod.PATCH]: "patch",
      [RequestMethod.PUT]: "put",
      [RequestMethod.DELETE]: "delete",
    };

    // Create test for each method handler
    for (const [method, func] of Object.entries(methods)) {
      it(`${method} request should run`, async () => {
        const methodHandler = vi.fn();
        const handler = new RouteHandler();
        await handler[func](methodHandler).build()(
          mockReq(method as RequestMethod),
          mockRes()
        );

        expect(methodHandler).toBeCalled();
      });
    }
  });

  describe("Session Handler", () => {
    const responses = {
      "json()": "json",
      "end()": "end",
      "send()": "send",
    };

    it("should execute provided session handler", async () => {
      const req = mockReq(RequestMethod.GET),
        res = mockRes();

      const sessionFn = vi.fn();
      const getHandler = vi.fn();

      const handler = new RouteHandler({
        sessionFn,
      });
      await handler.get(getHandler).build()(req, res);

      expect(sessionFn).toBeCalled();
      expect(getHandler).toBeCalled();
    });

    it("should pass data from session to method handler", async () => {
      const req = mockReq(RequestMethod.GET),
        res = mockRes();

      const sessionFn = vi.fn(() => {
        return {
          sessionId: "MySessionId",
        };
      });
      const probe = vi.fn();
      const getHandler = vi.fn((_, __, session) => {
        probe(session);
      });

      const handler = new RouteHandler({
        sessionFn,
      });
      await handler.get(getHandler).build()(req, res);

      expect(probe).toBeCalledWith({
        sessionId: "MySessionId",
      });
    });

    for (const [name, method] of Object.entries(responses)) {
      it(`should not execute method handler after returning a '${name}' response`, async () => {
        const req = mockReq(RequestMethod.GET),
          res = mockRes();

        const sessionFn = vi.fn((req, res) => {
          res[method]();
        });
        const getHandler = vi.fn();

        const handler = new RouteHandler({
          sessionFn,
        });
        await handler.get(getHandler).build()(req, res);

        expect(sessionFn).toBeCalled();
        expect(getHandler).not.toBeCalled();
      });
    }
  });

  describe("Invalid Method Handler", () => {
    it("should execute default invalid method handler", async () => {
      const req = mockReq(RequestMethod.POST),
        res = mockRes();

      const getHandler = vi.fn();

      const handler = new RouteHandler();
      await handler.get(getHandler).build()(req, res);

      expect(getHandler).not.toBeCalled();
      expect(res.status).toHaveBeenCalledWith(ResponseStatus.MethodNotAllowed);
      expect(res.send).toHaveBeenCalledWith("Method not allowed");
    });

    it("should execute a custom method handler", async () => {
      const req = mockReq(RequestMethod.POST),
        res = mockRes();

      const methodFn = vi.fn((_, res) => {
        res.status(ResponseStatus.MethodNotAllowed).send("invalid method");
      });
      const getHandler = vi.fn();

      const handler = new RouteHandler({
        methodFn,
      });

      await handler.get(getHandler).build()(req, res);

      expect(getHandler).not.toBeCalled();
      expect(res.status).toHaveBeenCalledWith(ResponseStatus.MethodNotAllowed);
      expect(res.send).toHaveBeenCalledWith("invalid method");
    });
  });

  describe("Error Handler", () => {
    it("should execute default error handler", async () => {
      const req = mockReq(RequestMethod.GET),
        res = mockRes();

      const handler = new RouteHandler();

      await handler
        .get(
          vi.fn(() => {
            throw new Error("Something went wrong");
          })
        )
        .build()(req, res);

      expect(res.status).toHaveBeenCalledWith(
        ResponseStatus.InternalServerError
      );
      expect(res.send).toHaveBeenCalledWith("Internal server error");
    });

    it("should execute a custom error handler", async () => {
      const req = mockReq(RequestMethod.GET),
        res = mockRes();

      const errorFn = vi.fn((_, res) => {
        res.status(ResponseStatus.InternalServerError).send("error");
      });
      const handler = new RouteHandler({
        errorFn,
      });

      await handler
        .get(
          vi.fn(() => {
            throw new Error("Something went wrong");
          })
        )
        .build()(req, res);

      expect(errorFn).toBeCalled();
    });

    it("should pass the error object into the error handler", async () => {
      const req = mockReq(RequestMethod.GET),
        res = mockRes();

      const probe = vi.fn();
      const handler = new RouteHandler({
        errorFn: vi.fn((_, res, err) => {
          probe(err);
          res.status(500).send("Internal server error");
        }),
      });

      const errorInstance = new Error("error");
      const getHandler = vi.fn(() => {
        throw errorInstance;
      });

      await handler.get(getHandler).build()(req, res);

      expect(probe).toHaveBeenCalledWith(errorInstance);
    });
  });

  it("should throw if the same method handler is called twice", async () => {
    const handler = new RouteHandler().get(vi.fn());

    expect(() => handler.get(vi.fn())).toThrow(/already set/);
  });
});
