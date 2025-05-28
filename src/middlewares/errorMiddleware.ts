import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = res.statusCode ? res.statusCode : 500;
  if (res.statusCode === 200) {
    statusCode = 500;
  }

  let message = err.message;
  if (err instanceof z.ZodError) {
    message = fromZodError(err).message;
  }

  // Log error stack in development
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
