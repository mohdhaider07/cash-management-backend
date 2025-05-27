import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { Response, NextFunction, Request } from "express";
import { AuthRequest } from "./authMiddleware";

const asyncRequestHandler = <TBody = any, TQuery = any>(
  schemas: { body?: z.Schema<TBody>; query?: z.Schema<TQuery> },
  fn: (
    req: AuthRequest<TBody, TQuery>,
    res: Response,
    next: NextFunction,
    ...args: any
  ) => Promise<any> | any
) => {
  return async function asyncUtilWrap(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (schemas.body) {
      try {
        schemas.body.parse(req.body);
      } catch (err: unknown) {
        const error = err instanceof z.ZodError ? fromZodError(err) : err;
        console.error("Error parsing request body:", error);
        res.status(400);

        return next(error);
      }
    }

    if (schemas.query) {
      try {
        schemas.query.parse(req.query);
      } catch (err: unknown) {
        const error = err instanceof z.ZodError ? fromZodError(err) : err;
        console.error("Error parsing request query:", error);
        res.status(400);
        return next(error);
      }
    }

    try {
      await fn(req as any, res, next);
    } catch (e) {
      next(e);
    }
  };
};

export default asyncRequestHandler;
