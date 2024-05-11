import { RouteHandler } from "./routeHandler.js";
import type { Config } from "./types.js";
import { mergeConfigs } from "./utils.js";

export class DefaultHandler<S> {
  private config: Config<S>;

  constructor(config: Config<S> = {}) {
    this.config = config;
  }

  public create(overrideConfig?: Config<S>): RouteHandler<S> {
    const config = mergeConfigs(this.config, overrideConfig);
    return new RouteHandler<S>(config);
  }
}
