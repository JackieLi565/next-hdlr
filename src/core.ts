import RouteHandler from "./handler.js";
import type { Config } from "./types.js";
import { InternalConfig, ResponseStatus } from "./internal/types.js";
import { mergeConfigs } from "./utils.js";

class Handler<S> {
  private config: InternalConfig<S>;

  constructor(config?: Config<S>) {
    const defaultConfig: InternalConfig<S> = {
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

    this.config = mergeConfigs<InternalConfig<S>>(defaultConfig, config);
  }

  public create(overrideConfig?: Config<S>): RouteHandler<S> {
    const finalConfig = mergeConfigs<InternalConfig<S>>(
      this.config,
      overrideConfig
    );
    return new RouteHandler<S>(finalConfig);
  }
}

export default Handler;
