
/**
 * // Error 400 Bad Request
 * if (!email) throw new AppError("El email es requerido", 400);
 *
 * // Error 404 Not Found
 * if (!user) throw new AppError("Usuario no encontrado", 404);
 *
 * // Error 403 Forbidden
 * if (!isAdmin) throw new AppError("No tienes permisos", 403);
 */
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        (Error as any).captureStackTrace(this, this.constructor);
    }
}
