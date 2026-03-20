import { Response } from "express";

export default class ResponseHelper {
  static success<T>(res: Response, data: T, message = "Success",statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message = "Internal Server Error", statusCode = 500, error?: unknown): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(error ? { error } : {}),
    });
  }

  static validationError(res: Response, errors: unknown): Response {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
}
