import RouteHandler from "./handler.js";
import { Config, ResponseStatus } from "./types.js";
import { mergeConfigs } from "./utils.js";

class Handler<S> {
  private config: Config<S>;

  constructor(config?: Partial<Config<S>>) {
    const defaultConfig: Config<S> = {
      methodNotAllowedFn: async (_, res) => {
        res.status(ResponseStatus.MethodNotAllowed).send("Method not allowed");
      },
      unAuthorizedFn: async (_, res) => {
        res.status(ResponseStatus.Unauthorized).send("Unauthorized");
      },
      internalServerErrorFn: async (_, res) => {
        res
          .status(ResponseStatus.InternalServerError)
          .send("Internal server error");
      },
    };

    this.config = mergeConfigs<Config<S>>(defaultConfig, config);
  }

  public create(overrideConfig?: Partial<Config<S>>): RouteHandler<S> {
    const finalConfig = mergeConfigs<Config<S>>(this.config, overrideConfig);
    return new RouteHandler<S>(finalConfig);
  }
}

export default Handler;
