import { describe, it, expect, vi, beforeEach } from "vitest";
import RouteHandler from "./handler";
import { NextApiRequest, NextApiResponse } from "next";
import {
  InternalConfig,
  RequestMethod,
  ResponseStatus,
} from "./internal/types";

describe("RouteHandler", () => {
  type MockSession = { user: string };

  const mockSend = vi.fn();
  const mockStatus = vi.fn(() => ({ send: mockSend }));
  const mockSetHeader = vi.fn();
  const mockAPIResponse = {
    status: mockStatus,
    setHeader: mockSetHeader,
  } as unknown as NextApiResponse;
  const mockAPIRequest = (method: RequestMethod) =>
    ({ method: "GET" }) as unknown as NextApiRequest;

  describe("Authorization", () => {
    it("should handle authorized requests correctly", async () => {
      const config: InternalConfig<MockSession> = {
        authFn: vi
          .fn()
          .mockResolvedValue({ authorized: true, data: { user: "user" } }),
        authRoutes: [RequestMethod.GET],
        unAuthFn: vi.fn(),
        errorFn: vi.fn(),
        methodFn: vi.fn(),
      };

      const routeHandler = new RouteHandler<MockSession>(config);
      routeHandler.get(async (_, res, session) => {
        const data = session as MockSession;
        res.status(ResponseStatus.OK).send(data.user);
      });

      await routeHandler.build()(mockAPIRequest, mockAPIResponse);

      expect(config.methodFn).not.toHaveBeenCalled();
      expect(config.errorFn).not.toHaveBeenCalled();
      expect(config.unAuthFn).not.toHaveBeenCalled();
      expect(config.authFn).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith("user");
      expect(mockStatus).toHaveBeenCalledWith(ResponseStatus.OK);
    });

    it("should handle unauthorized requests", async () => {
      const config: InternalConfig<MockSession> = {
        authFn: vi.fn().mockResolvedValue({ authorized: false }),
        authRoutes: [RequestMethod.GET],
        unAuthFn: async (_, res) => {
          res.status(ResponseStatus.Unauthorized).send("Access Denied");
        },
        errorFn: vi.fn(),
        methodFn: vi.fn(),
      };

      const mockGetRequest = vi.fn();
      const routeHandler = new RouteHandler(config);
      await routeHandler.get(mockGetRequest).build()(
        mockAPIRequest(Res),
        mockAPIResponse
      );

      expect(mockGetRequest).not.toHaveBeenCalled();
      expect(config.authFn).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith("Access Denied");
      expect(mockStatus).toHaveBeenCalledWith(ResponseStatus.Unauthorized);
    });
  });

  describe("HTTP Method Management", () => {
    it("should respond 'Method not allowed' when no handler is registered for the method", async () => {
      const config: InternalConfig = {
        methodFn: vi.fn(async (_, res: NextApiResponse) => {
          res
            .status(ResponseStatus.MethodNotAllowed)
            .send("Method not allowed");
        }),
        unAuthFn: vi.fn(),
        errorFn: vi.fn(),
      };

      const routeHandler = new RouteHandler(config);
      await routeHandler.build()(mockAPIRequest, mockAPIResponse);

      expect(config.methodFn).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(ResponseStatus.MethodNotAllowed);
      expect(mockSend).toHaveBeenCalledWith("Method not allowed");
    });

    it("should respond with a internal server error if a method handler throws", async () => {
      const config: InternalConfig = {
        methodFn: vi.fn(),
        unAuthFn: vi.fn(),
        errorFn: vi.fn(async (_, res: NextApiResponse) => {
          res
            .status(ResponseStatus.InternalServerError)
            .send("Internal server error");
        }),
      };

      const routeHandler = new RouteHandler(config);
      await routeHandler
        .get(async () => {
          throw new Error();
        })
        .build()(mockAPIRequest, mockAPIResponse);

      expect(config.errorFn).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(
        ResponseStatus.InternalServerError
      );
      expect(mockSend).toHaveBeenCalledWith("Internal server error");
    });

    it("should throw an error when setting the same method handler twice", () => {
      const config: InternalConfig = {
        methodFn: vi.fn(),
        unAuthFn: vi.fn(),
        errorFn: vi.fn(),
      };
      const routeHandler = new RouteHandler(config);

      routeHandler.get(async () => {});
      expect(() => routeHandler.get(async () => {})).toThrow(
        "Handler for GET already set"
      );
    });
  });
});
