import type { ErrorRequestHandler, RequestHandler } from "express";

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
    console.log("Getting this error", error);
    
    // Handle Sequelize Unique Constraint Errors
    if(error.name === "SequelizeUniqueConstraintError"){
      const field = error?.errors[0]?.path;
      const value = error?.errors[0]?.value;
      
      let message = "This information is already in use.";
      if (field === 'email') {
        message = "An account with this email address already exists. Please use a different email or try logging in.";
      } else if (field === 'phone') {
        message = "An account with this phone number already exists. Please use a different phone number or try logging in.";
      } else if (field) {
        message = `This ${field} is already taken. Please choose a different one.`;
      }
      
      error = new ErrorHandler(message, 400);
    }
    
    // Handle Sequelize Validation Errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors || [];
      let message = "Please check your input and try again.";
      
      if (validationErrors.length > 0) {
        const firstError = validationErrors[0];
        const field = firstError.path;
        const validatorKey = firstError.validatorKey;
        
        // Custom messages for specific validation errors
        if (field === 'phone' && validatorKey === 'isNumeric') {
          message = "Phone number must contain only numbers. Please remove any letters, spaces, or special characters.";
        } else if (field === 'email' && validatorKey === 'isEmailOrNull') {
          message = "Please enter a valid email address (e.g., example@email.com).";
        } else if (field === 'name' && validatorKey === 'notEmpty') {
          message = "Name is required and cannot be empty.";
        } else if (field === 'salary' && validatorKey === 'min') {
          message = "Salary must be a positive number.";
        } else if (field === 'profile' && validatorKey === 'isCustomUrl') {
          message = "Profile picture must be a valid URL.";
        } else {
          // Generic validation error message
          message = firstError.message || `Invalid ${field}. Please check your input.`;
        }
      }
      
      error = new ErrorHandler(message, 400);
    }
    
    // Handle Sequelize Database Errors
    if (error.name === "SequelizeDatabaseError") {
      let message = "There was a problem saving your information. Please try again.";
      
      // Handle specific database errors
      if (error.original?.code === 'ER_DATA_TOO_LONG') {
        message = "One of your entries is too long. Please shorten your input and try again.";
      } else if (error.original?.code === 'ER_BAD_NULL_ERROR') {
        message = "Please fill in all required fields.";
      }
      
      error = new ErrorHandler(message, 400);
    }
    
    // Handle Sequelize Connection Errors
    if (error.name === "SequelizeConnectionError") {
      error = new ErrorHandler("Unable to connect to the database. Please try again later.", 500);
    }
    
    if (error.name === "CastError") {
      const message = `Resource Not Found. Invalid ${error.path}`;
      error = new ErrorHandler(message, 400);
    }

    if (error.name === "JsonWebTokenError") {
      const message = "Your session is invalid. Please log in again.";
      error = new ErrorHandler(message, 401);
    }

    if (error.name === "TokenExpiredError") {
      const message = "Your session has expired. Please log in again.";
      error = new ErrorHandler(message, 401);
    }

    return res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
      status: error.statusCode,
    });
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
