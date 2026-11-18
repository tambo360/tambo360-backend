import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';

export const errorHandler = (
    err: any, // Cambiado a 'any' para evitar problemas de tipado con librerías externas
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
        // Logueamos el error original completo para vos en la consola del servidor
        console.error(`[Fatal Error]:`, err);
        
        // Al cliente NO le enviamos el err.message interno por seguridad, 
        // se queda con el 'Error Interno del Servidor' por defecto.
    }

    // Registrar en consola tus errores controlados (opcional para debug)
    if (statusCode !== 500) {
        console.warn(`[App Warning] [${statusCode}] ${message}`, errors || '');
    }

    // Unificamos todo usando tu propia clase ApiResponse
    const response = ApiResponse.error(message, statusCode, errors);
    res.status(statusCode).json(response);
};
