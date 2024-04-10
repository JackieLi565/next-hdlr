import { describe, it, expect, vi } from "vitest";
import { Handler } from "./core";

const mockGetHandler = vi.fn();
const mockPostHandler = vi.fn();
const mockPutHandler = vi.fn();
const mockPatchHandler = vi.fn();
const mockDeleteHandler = vi.fn();

describe("Handler", () => {
  it.each([
    ["GET", mockGetHandler],
    ["POST", mockPostHandler],
    ["PUT", mockPutHandler],
    ["PATCH", mockPatchHandler],
    ["DELETE", mockDeleteHandler],
  ])(
    "should call the correct handler for %s method",
    async (method, handler) => {
      const req = { method } as any;
      const res = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnValue({ send: vi.fn() }),
      } as any;

      const apiHandler = new Handler()
        .get(mockGetHandler)
        .post(mockPostHandler)
        .put(mockPutHandler)
        .patch(mockPatchHandler)
        .delete(mockDeleteHandler)
        .build();

      await apiHandler(req, res);

      expect(handler).toHaveBeenCalled();
    }
  );
});
