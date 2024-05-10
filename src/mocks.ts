import { vi } from "vitest";
import { RequestMethod } from "./internal/types.js";
import { NextApiRequest, NextApiResponse } from "next";

const mockReq = (method: RequestMethod) =>
  ({
    method,
  } as unknown as NextApiRequest);

const mockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn();
  res.send = vi.fn();
  res.setHeader = vi.fn().mockReturnThis();
  res.end = vi.fn();
  res.writableEnded = false;

  res.send.mockImplementation(() => {
    res.writableEnded = true;
    return res;
  });
  res.json.mockImplementation(() => {
    res.writableEnded = true;
    return res;
  });
  res.end.mockImplementation(() => {
    res.writableEnded = true;
    return res;
  });

  return res as unknown as NextApiResponse;
};

export { mockReq, mockRes };
