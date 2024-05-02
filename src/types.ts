import { NextApiRequest, NextApiResponse } from "next";

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  CONNECT = "CONNECT",
  TRACE = "TRACE",
}

export enum ResponseStatus {
  OK = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  Conflict = 409,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}

export type NextApiSessionHandler<S> = (
  req: NextApiRequest,
  res: NextApiResponse,
  session?: S
) => Promise<unknown>;

export type Method = keyof typeof RequestMethod;

export interface Config<S> {
  authFn?: AuthHandler<S>;
  authRoutes?: RequestMethod[];
  methodNotAllowedFn: PromiseNextApiHandler;
  unAuthorizedFn: PromiseNextApiHandler;
  internalServerErrorFn: ServerErrorHandler;
}

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
