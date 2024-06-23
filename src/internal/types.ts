export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export enum ResponseStatus {
  MethodNotAllowed = 405,
  InternalServerError = 500,
}
