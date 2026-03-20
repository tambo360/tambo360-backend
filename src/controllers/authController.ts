import { Request, Response, NextFunction } from "express";
import userService from "../services/userService";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { passwordValidationSchema, registerSchema } from "../schemas/authSchema";
import jwt from "jsonwebtoken";
import { config } from "node:process";


// FUncion para registrar un nuevo usuario
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
      throw new AppError("Todos los campos son obligatorios", 400);
    }

    const parsed = registerSchema.safeParse({ nombre, correo, contraseña });
    if (!parsed.success) {
      const errors = parsed.error.issues.map(issue => issue.message);
      res.status(400).json(errors)
      return;
    }

    const newUser = await userService.create(parsed.data);


    const response = ApiResponse.success(
      newUser,
      "Usuario registrado exitosamente",
      201
    );

    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
// Funcion para iniciar sesión
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      throw new AppError("Email y contraseña son obligatorios", 400);
    }

    const user = await userService.authenticate(correo, contraseña);

    const userData = {
      user: {
        nombre: user.nombre,
        correo: user.correo,
        idUsuario: user.idUsuario,
        verificado: user.verificado,
        fechaCreacion: user.fechaCreacion,
        establecimientos: user.establecimientos
      }
    }
    const token = jwt.sign(userData, process.env.JWT_SECRET!, { expiresIn: "1d" }); //



    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    const response = ApiResponse.success({ ...userData, token: token }, "Inicio de sesión exitoso");
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// Funcion para verificar el email del usuario
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    console.log("Token recibido en el controlador:", token);

    if (!token || typeof token !== "string") {
      throw new AppError("Token de verificación es obligatorio", 400);
    }

    const result = await userService.verifyEmail(token);

    if (!result) {
      throw new AppError("Token de verificación inválido o expirado", 400);
    }

    const userData = {
      user: {
        nombre: result.nombre,
        correo: result.correo,
        idUsuario: result.idUsuario,
        verificado: result.verificado,
        fechaCreacion: result.fechaCreacion,
        establecimientos: result.establecimientos
      }
    }

    const tokenCookie = jwt.sign(userData, process.env.JWT_SECRET!, { expiresIn: "1d" }); //
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", tokenCookie, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    const response = ApiResponse.success({ ...userData }, "Email verificado exitosamente");
    res.status(response.statusCode).json(response);

  } catch (error) {
    next(error);
  }
}

// Funcion para reenviar el email de verificación
export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const { correo } = req.body;

    if (!correo) {
      throw new AppError("Correo es obligatorio", 400);
    }

    await userService.resendVerificationEmail(correo);

    const response = ApiResponse.success(null, "Correo de verificación reenviado exitosamente");
    res.status(response.statusCode).json(response);

  } catch (error) {
    next(error);
  }
}

// Funcion para solicitar restablecimiento de contraseña
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { correo } = req.body;

    if (!correo) {
      throw new AppError("Correo es obligatorio", 400);
    }

    await userService.forgotPassword(correo);

    const response = ApiResponse.success(null, "Instrucciones para restablecer la contraseña enviadas al correo");
    res.status(response.statusCode).json(response);

  } catch (error) {
    next(error);
  }
}

// Funcion para verificar el token de restablecimiento de contraseña
export const verifyResetPasswordToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      throw new AppError("Token es obligatorio", 400);
    }

    const result = await userService.verifyResetPasswordToken(token);

    if (!result) {
      throw new AppError("Token de restablecimiento inválido o expirado", 400);
    }

    const response = ApiResponse.success(null, "Token de restablecimiento válido");
    res.status(response.statusCode).json(response);

  } catch (error) {
    next(error);
  }
}

// Funcion para restablecer la contraseña
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const { token, nuevaContraseña } = req.body;

    if (!token || typeof token !== "string") {
      throw new AppError("Token es obligatorio", 400);
    }

    if (!nuevaContraseña || typeof nuevaContraseña !== "string") {
      throw new AppError("Nueva contraseña es obligatoria", 400);
    }

    const parsed = passwordValidationSchema.safeParse({ contraseña: nuevaContraseña });
    if (!parsed.success) {
      const errors = parsed.error.issues.map(issue => issue.message);
      res.status(400).json(errors)
      return;
    }

    await userService.resetPassword(token, nuevaContraseña);

    const response = ApiResponse.success(null, "Contraseña restablecida exitosamente");
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
}

// Funcion para obtener los datos del usuario autenticado
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("No autenticado", 401);
    }

    const { id } = req.user;
    const user = await userService.findById(id);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const response = ApiResponse.success(user, "Usuario obtenido exitosamente");
    res.status(response.statusCode).json(response);

  } catch (error) {
    next(error);
  }
}

// Función para cerrar sesion eliminando las cookies con el jwt
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax"
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Sesión cerrada correctamente",
      success: true
    });

  } catch (error) {
    next(error);
  }
};