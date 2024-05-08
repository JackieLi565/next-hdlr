import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { Config, NextApiSessionHandler } from "./types.js";
import {
  InternalConfig,
  RequestMethod,
  ResponseStatus,
} from "./internal/types.js";

class RouteHandler<S> {
  private handlers: {
    [method in RequestMethod]?: NextApiSessionHandler<S>;
  } = {};

  private config: Config<S>;

  public constructor(config: Config<S>) {
    const defaultConfig: Config<S> = {
      methodFn: async (_, res) => {
        res.status(ResponseStatus.MethodNotAllowed).send("Method not allowed");
      },
      unAuthFn: async (_, res) => {
        res.status(ResponseStatus.Unauthorized).send("Unauthorized");
      },
      errorFn: async (_, res) => {
        res
          .status(ResponseStatus.InternalServerError)
          .send("Internal server error");
      },
    };
    this.config = config;
  }

  public get(fn: NextApiSessionHandler<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.GET, fn);
  }

  public post(fn: NextApiSessionHandler<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.POST, fn);
  }

  public put(fn: NextApiSessionHandler<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.PUT, fn);
  }

  public patch(fn: NextApiSessionHandler<S>): RouteHandler<S> {
    return this.setHandler(RequestMethod.PATCH, fn);
  }

  public delete(fn: NextApiSessionHandler<S>): RouteHandler<S> {
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
        await config.methodFn(req, res);
        return;
      }

      try {
        // PROBLEM: should i pass in the next function?
        if (config.authFn && config.authRoutes?.includes(method)) {
          const authResponse = await config.authFn(req, res);
          if (authResponse.authorized) {
            await handler(req, res, authResponse.data);
          } else {
            await config.unAuthFn(req, res);
          }
        } else {
          await handler(req, res);
        }
      } catch (err: any) {
        await config.errorFn(req, res, err);
      }
    };
  }

  private setHandler(
    method: RequestMethod,
    fn: NextApiSessionHandler<S>
  ): RouteHandler<S> {
    if (this.handlers[method]) {
      throw new Error(`Handler for ${method} already set`);
    }

    this.handlers[method] = fn;
    return this;
  }
}

export default RouteHandler;
