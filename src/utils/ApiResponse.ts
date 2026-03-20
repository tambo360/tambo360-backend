
/**
 * // Respuesta exitosa simple
 * ApiResponse.success(data, "Operación exitosa");
 *
 * // Respuesta exitosa con código personalizado
 * ApiResponse.success(newUser, "Usuario creado", 201);
 *
 * // Respuesta de error (aunque es preferible usar AppError + Middleware)
 * ApiResponse.error("Algo salió mal", 500);
 */
export class ApiResponse<T> {
  public success: boolean;
  public message: string;
  public data: T | null;
  public statusCode: number;

  constructor(statusCode: number, message: string, data: T | null = null, success = true) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success;
  }

  static success<T>(data: T, message = 'Operación exitosa', statusCode = 200): ApiResponse<T> {
    return new ApiResponse(statusCode, message, data, true);
  }

  static error(message: string, statusCode = 500, data: any = null): ApiResponse<any> {
    return new ApiResponse(statusCode, message, data, false);
  }
}
