import { vi } from "vitest";
import { RequestMethod } from "./internal/types.js";
import { NextApiRequest, NextApiResponse } from "next";

export const mockReq = (method: RequestMethod) =>
  ({
    method,
  }) as unknown as NextApiRequest;

export const mockRes = {
  status: vi.fn().mockReturnThis(),
  send: vi.fn(),
  setHeader: vi.fn(),
} as unknown as NextApiResponse;
