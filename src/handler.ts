import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { RequestMethod, ResponseStatus } from "./internal/types.js";
import { DuplicateMethodError } from "./error.js";
import { NextApiMutationHandler, NextApiQueryHandler } from "./types.js";

export class Handler {
  private handlers: {
    [method in RequestMethod]?: NextApiQueryHandler | NextApiMutationHandler;
  };

  public constructor() {
    this.handlers = {};
  }

  public GET<Res = any>(fn: NextApiQueryHandler<Res>): void {
    this.setHandler(RequestMethod.GET, fn);
  }

  public POST<Req = any, Res = any>(
    fn: NextApiMutationHandler<Req, Res>
  ): void {
    this.setHandler(RequestMethod.POST, fn);
  }

  public PATCH<Req = any, Res = any>(
    fn: NextApiMutationHandler<Req, Res>
  ): void {
    this.setHandler(RequestMethod.PATCH, fn);
  }

  public PUT<Req = any, Res = any>(fn: NextApiMutationHandler<Req, Res>): void {
    this.setHandler(RequestMethod.PUT, fn);
  }

  public DELETE<Res = any>(fn: NextApiMutationHandler<unknown, Res>): void {
    this.setHandler(RequestMethod.DELETE, fn);
  }

  public build(): NextApiHandler {
    const methods = Object.keys(this.handlers);
    const handlers = this.handlers;

    return async function (req: NextApiRequest, res: NextApiResponse) {
      const method = req.method as RequestMethod;

      const handler = handlers[method];

      if (!handler) {
        res.setHeader("Allow", methods);
        return res.status(ResponseStatus.MethodNotAllowed);
      }

      try {
        await handler(req, res);
      } catch (err: any) {
        console.log(err);
        return res
          .status(ResponseStatus.InternalServerError)
          .send(`${err.name}: ${err.message}`);
      }
    };
  }

  private setHandler(
    method: RequestMethod,
    fn: NextApiQueryHandler | NextApiMutationHandler
  ) {
    if (this.handlers[method]) {
      throw new DuplicateMethodError(
        `Handler for ${method} already set`,
        Object.keys(this.handlers)
      );
    }

    this.handlers[method] = fn;
  }
}
