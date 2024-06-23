import { NextApiRequest, NextApiResponse } from "next";

export interface NextApiJSONRequest<P = Record<string, unknown>>
  extends NextApiRequest {
  body: P;
}

export type NextApiMutationHandler<Req = any, Res = any> = (
  req: NextApiJSONRequest<Req>,
  res: NextApiResponse<Res>
) => Promise<unknown> | unknown;

export type NextApiQueryHandler<Res = any> = (
  req: NextApiRequest,
  res: NextApiResponse<Res>
) => Promise<unknown> | unknown;
