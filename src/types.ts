import { NextApiRequest, NextApiResponse } from "next";
import { InternalConfig, RequestMethod } from "./internal/types.js";

export type Config<S> = Partial<InternalConfig<S>>;

export type NextApiSessionHandler<S> = (
  req: NextApiRequest,
  res: NextApiResponse,
  session?: S
) => Promise<unknown>;

export type PromiseNextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<unknown>;

export type AuthHandler<S> = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<{ authorized: true; data: S } | { authorized: false }>;

export type ServerErrorHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  error: any
) => Promise<void>;
