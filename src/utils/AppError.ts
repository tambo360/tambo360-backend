import { ZodError } from "zod";
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

export class ErrorResponse extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors: Record<string, string>;

  constructor(errors: Record<string, string>, statusCode: number = 400) {
    super("Validation error"); // mensaje genérico
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    (Error as any).captureStackTrace(this, this.constructor);
  }
}


export function zodError(err: ZodError) {
  const errores: Record<string, string> = {};
  err.issues.forEach(issue => {
    // Solo strings, ignoramos índices numéricos
    const campo = issue.path.filter(p => typeof p === "string").join(".");
    errores[campo] = issue.message;
  });

  return new ErrorResponse(errores, 400);
}
