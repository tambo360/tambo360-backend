
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Error Interno del Servidor';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Error) {
        message = err.message;
    }

    // Registrar error para depuración (puede reemplazarse por un logger como Winston)
    console.error(`[Error] ${message}`, err);

    const response = ApiResponse.error(message, statusCode);
    res.status(statusCode).json(response);
};
