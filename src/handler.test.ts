import { describe, it, expect, vi } from "vitest";
import RouteHandler from "./handler";
import { RequestMethod, ResponseStatus } from "./types";
import { NextApiRequest, NextApiResponse } from "next";

describe("RouteHandler", () => {
  const mockSend = vi.fn();
  const mockStatus = vi.fn(() => ({ send: mockSend }));
  const mockSetHeader = vi.fn();
  const mockAPIResponse = {
    status: mockStatus,
    setHeader: mockSetHeader,
  } as unknown as NextApiResponse;
  const mockAPIRequest = { method: "GET" } as unknown as NextApiRequest;

  describe("Authorization", () => {
    it("handles authorized requests correctly", async () => {
      const authData = { user: "testUser" };
      const config = {
        authFn: vi.fn().mockResolvedValue({ authorized: true, data: authData }),
        authRoutes: [RequestMethod.GET],
        unAuthorizedFn: vi.fn(),
        internalServerErrorFn: vi.fn(),
        methodNotAllowedFn: vi.fn(),
      };

      type Session = { user: string };
      const routeHandler = new RouteHandler<Session>(config);

      routeHandler.get(async (_, res, session) => {
        const data = session as Session;
        res.status(ResponseStatus.OK).send(`Authorized with user ${data.user}`);
      });

      const handler = routeHandler.build();
      await handler(mockAPIRequest, mockAPIResponse);

      expect(config.authFn).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith("Authorized with user testUser");
      expect(mockStatus).toHaveBeenCalledWith(ResponseStatus.OK);
    });

    it("handles unauthorized requests", async () => {
      const config = {
        authFn: vi.fn().mockResolvedValue({ authorized: false }),
        authRoutes: [RequestMethod.GET],
        unAuthorizedFn: async (_, res) => {
          res.status(ResponseStatus.Unauthorized).send("Access Denied");
        },
        internalServerErrorFn: vi.fn(),
        methodNotAllowedFn: vi.fn(),
      };

      const routeHandler = new RouteHandler(config);
      routeHandler.get(async () => {});

      const handler = routeHandler.build();
      await handler(mockAPIRequest, mockAPIResponse);

      expect(config.authFn).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith("Access Denied");
      expect(mockStatus).toHaveBeenCalledWith(ResponseStatus.Unauthorized);
    });
  });

  describe("HTTP Method Management", () => {
    it("should call method not allowed when no handler is registered for the method", async () => {
      const config = {
        methodNotAllowedFn: async (_, res) => {
          res
            .status(ResponseStatus.MethodNotAllowed)
            .send("Method not allowed");
        },
        unAuthorizedFn: vi.fn(),
        internalServerErrorFn: vi.fn(),
      };

      const routeHandler = new RouteHandler(config);
      const handler = routeHandler
        .patch(async (_, res) => res.send("PATCH OK"))
        .post(async (_, res) => res.send("POST OK"))
        .build();
      await handler(mockAPIRequest, mockAPIResponse);

      expect(mockStatus).toHaveBeenCalledWith(ResponseStatus.MethodNotAllowed);
      expect(mockSend).toHaveBeenCalledWith("Method not allowed");
      expect(mockSetHeader).toHaveBeenCalledWith("Allow", ["PATCH", "POST"]);
    });

    it("should throw an error when trying to set the same method handler twice", () => {
      const config = {
        methodNotAllowedFn: vi.fn(),
        unAuthorizedFn: vi.fn(),
        internalServerErrorFn: vi.fn(),
      };

      const routeHandler = new RouteHandler(config);
      routeHandler.get(async () => {});
      expect(() => routeHandler.get(async () => {})).toThrow(
        "Handler for GET already set"
      );
    });
  });
});
