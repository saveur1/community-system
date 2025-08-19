import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { ServiceResponse } from "../utils/serviceResponse";

//ADD 404 TO NOT FOUND ERROR
const unexpectedRequest: RequestHandler = (_req, res, next) => {
  return next(ErrorHandler.NotFound("Resources not found"));
};

//ADD ERROR TO REQUEST LOG
const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};

//RETURN ERROR TO USER AS JSON
const returnErrorToUser: ErrorRequestHandler = (errors, _req, res, next) => {
  let error = errors;
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    console.error("Error: ", error);
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error,
      stack: error.stack,
    });
  }

  if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
    console.log(error);
    if(error.name === "SequelizeUniqueConstraintError"){
        const message = `Duplicate field value: '${error?.errors[0].value}'. Please use another value!`;
        error = new ErrorHandler(message, 400);
    }
    if (error.name === "CastError") {
      const message = `Resource Not Found. Invalid ${error.path}`;
      error = new ErrorHandler(message, 400);
    }

    if (error.name === "JsonWebTokenError") {
      const message = "JSON web token is invalid. Try Again!!!";
      error = new ErrorHandler(message, 400);
    }

    if (error.name === "TokenExipiredError") {
      const message = "JSON web token is Expired. Try Again!!!";
      error = new ErrorHandler(message, 400);
    }

    return ServiceResponse.failure(error.message || "Internal Server Error", null, error.statusCode);
  }
};


// HANDLE ERRORS BY ATTACHING STATUS CODE AND MESSAGES
export class ErrorHandler extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(message: string) {
    return new ErrorHandler(message, 400);
  }

  static NotFound(message: string) {
    return new ErrorHandler(message, 404);
  }
  static Forbidden(message: string) {
    return new ErrorHandler(message, 403);
  }
  static InternalServerError(message = "Internal Server Error") {
    return new ErrorHandler(message, 500);
  }
}

// CATCH ASYNCHRONOUS ERRORS
export function asyncCatch(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      const next = args[args.length - 1]; // next is always the last argument in Express
      if (typeof next === 'function') {
        return next(error);
      }
      throw error; // If next is not available, rethrow
    }
  };
  
  return descriptor;
}

const errorHandlers: [RequestHandler, ErrorRequestHandler, ErrorRequestHandler] = [
  unexpectedRequest,
  addErrorToRequestLog,
  returnErrorToUser,
];

// Export the middleware functions individually for direct use
export { unexpectedRequest, addErrorToRequestLog, returnErrorToUser };

// Default export for backward compatibility
export default function errorHandlerMiddleware(): [RequestHandler, ErrorRequestHandler, ErrorRequestHandler] {
  return errorHandlers;
}
