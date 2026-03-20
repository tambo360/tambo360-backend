import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
//import config from "../config";  // Importar config para que se reconozca el token

interface JwtPayload {
  user: {
    idUsuario: string;
  };
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    console.log("Cookies recibidas:", req.cookies);
    const token = req.cookies?.token;

    if (!token) {
      throw new AppError("No autenticado", 401); //Si no existe, lanza un error 401, “verificar que exista el token para rutas protegidas y generar un error si no existe”
    }
    //verifica que exista el token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    
    req.user = { id: decoded.user.idUsuario }; //Se setea  el id del usuario, “en caso de que exista, hacer un req.user.id

    next();
  } catch (error) {
    next(new AppError("Token inválido o expirado", 401));
  }
};