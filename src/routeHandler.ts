import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { Config, NextApiHandlerWithSession } from "./types.js";
import {
  DefaultConfig,
  RequestMethod,
  ResponseStatus,
} from "./internal/types.js";
import { mergeConfigs } from "./utils.js";

export class RouteHandler<S> {
  private handlers: {
    [method in RequestMethod]?: NextApiHandlerWithSession<S>;
  } = {};

  private config: Config<S>;

  public constructor(config?: Config<S>) {
    const defaultConfig: DefaultConfig = {
      methodFn: async (_, res) => {
        res.status(ResponseStatus.MethodNotAllowed).send("Method not allowed");
      },
      errorFn: async (_, res) => {
        res
          .status(ResponseStatus.InternalServerError)
          .send("Internal server error");
      },
    };

    this.config = mergeConfigs(defaultConfig, config);
  }

  public get(fn: NextApiHandlerWithSession<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.GET, fn);
  }

  public post(fn: NextApiHandlerWithSession<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.POST, fn);
  }

  public put(fn: NextApiHandlerWithSession<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.PUT, fn);
  }

  public patch(fn: NextApiHandlerWithSession<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.PATCH, fn);
  }

  public delete(fn: NextApiHandlerWithSession<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.DELETE, fn);
  }

  public build(): NextApiHandler {
    const methods = Object.keys(this.handlers);
    const handlers = this.handlers;
    const config = this.config;

    return async function (req: NextApiRequest, res: NextApiResponse) {
      const method = req.method as RequestMethod;

      const handler = handlers[method];

      if (!handler) {
        res.setHeader("Allow", methods);
        await config.methodFn!(req, res);
        return;
      }

      try {
        if (!config.sessionFn) {
          await handler(req, res);
          return;
        }

        const authResponse = await config.sessionFn(req, res);
        if (res.writableEnded) return;

        await handler(req, res, authResponse!);
      } catch (err: any) {
        await config.errorFn!(req, res, err);
      }
    };
  }

  private setHandler(
    method: RequestMethod,
    fn: NextApiHandlerWithSession<S>
  ): RouteHandler<S> {
    if (this.handlers[method]) {
      throw new Error(`Handler for ${method} already set`);
    }

    this.handlers[method] = fn;
    return this;
  }
}
