import type { NextApiRequest, NextApiResponse } from "next";
import { RequestMethodMap, RequestMethods } from "./types.js";

class Handler {
  private handlers: {
    [method in RequestMethodMap]?: (
      req: NextApiRequest,
      res: NextApiResponse
    ) => Promise<void>;
  } = {};

  get(fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    this.handlers[RequestMethodMap.GET] = fn;
    return this;
  }

  post(fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    this.handlers[RequestMethodMap.POST] = fn;
    return this;
  }

  async execute(req: NextApiRequest, res: NextApiResponse) {
    const method = req.method as RequestMethods;

    try {
      const requestHandler = this.handlers[method];
      if (requestHandler) {
        await requestHandler(req, res);
      } else {
        res.setHeader("Allow", Object.keys(this.handlers));
        res.status(405).send("Method Not Allowed");
      }
    } catch (e: any) {
      res.status(500).send("Internal Server Error");
    }
  }
}
