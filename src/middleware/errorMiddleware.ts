import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

export const errorHandler = (
    err: Error | AppError | ErrorResponse,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Error Interno del Servidor';
    let errors: Record<string, string> | null = null;

    if (err instanceof ErrorResponse) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    }

    // Registrar error para depuración
    console.error(`[Error] ${message}`, err);

    // Si hay errores estructurados, devolvemos todo
    if (errors) {
        return res.status(statusCode).json({
            statusCode,
            message,
            errors,
            success: false,
            data: null,
        });
    }

    // Caso normal (sin objeto errors)
    const response = ApiResponse.error(message, statusCode);
    res.status(statusCode).json(response);
};
