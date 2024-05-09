import { NextApiRequest, NextApiResponse } from "next";
import { DefaultConfig } from "./internal/types.js";

export interface Config<S = {}> extends Partial<DefaultConfig> {
  sessionFn?: NextApiSessionHandler<S>;
}

type ApiResponseHandler = Promise<unknown> | unknown;

export type NextApiSessionHandler<S> = (
  req: NextApiRequest,
  res: NextApiResponse
) => S | undefined;

export type NextApiHandlerWithSession<S> = (
  req: NextApiRequest,
  res: NextApiResponse,
  session?: S
) => ApiResponseHandler;

export type NextApiHandlerWithError = (
  req: NextApiRequest,
  res: NextApiResponse,
  error: any
) => ApiResponseHandler;
