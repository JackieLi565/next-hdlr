import {
  AuthHandler,
  PromiseNextApiHandler,
  ServerErrorHandler,
} from "../types.js";

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export enum ResponseStatus {
  OK = 200,
  Unauthorized = 401,
  MethodNotAllowed = 405,
  InternalServerError = 500,
}

export type Method = keyof typeof RequestMethod;

export interface InternalConfig<S = {}> {
  sessionFn?: AuthHandler<S>;
  methodFn: PromiseNextApiHandler;
  unAuthFn: PromiseNextApiHandler;
  errorFn: ServerErrorHandler;
}