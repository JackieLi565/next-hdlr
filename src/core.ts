import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import {
  Config,
  RequestMethodMap,
  RequestMethods,
  ResponseStatus,
} from "./types.js";

const defaultConfig: Config = {
  messages: {
    internalServerError: "Internal Server Error",
    methodNotAllowed: "Method Not Allowed",
  },
};

export class Handler {
  private handlers: {
    [method in RequestMethodMap]?: NextApiHandler;
  } = {};

  private config: Config;

  public constructor(config: Config = defaultConfig) {
    this.config = config;
  }

  get(fn: NextApiHandler): Handler {
    this.handlers[RequestMethodMap.GET] = fn;
    return this;
  }

  post(fn: NextApiHandler): Handler {
    this.handlers[RequestMethodMap.POST] = fn;
    return this;
  }

  put(fn: NextApiHandler): Handler {
    this.handlers[RequestMethodMap.PUT] = fn;
    return this;
  }

  patch(fn: NextApiHandler): Handler {
    this.handlers[RequestMethodMap.PATCH] = fn;
    return this;
  }

  delete(fn: NextApiHandler): Handler {
    this.handlers[RequestMethodMap.DELETE] = fn;
    return this;
  }

  build(): NextApiHandler {
    const methods = Object.keys(this.handlers);
    const handlers = this.handlers;
    const config = this.config;

    return async function (req: NextApiRequest, res: NextApiResponse) {
      const method = req.method as RequestMethods;

      const handler = handlers[method];

      if (handler) {
        try {
          await handler(req, res);
        } catch (e: any) {
          res
            .status(ResponseStatus.InternalServerError)
            .send(config.messages.internalServerError);
        }
      } else {
        res.setHeader("Allow", methods);
        res
          .status(ResponseStatus.MethodNotAllowed)
          .send(config.messages.methodNotAllowed);
      }
    };
  }
}
