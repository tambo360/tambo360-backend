import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

interface JwtPayload {
  user: {
    idUsuario: string;
  };
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(new AppError("No autenticado", 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    if (!decoded?.user?.idUsuario) {
      return next(new AppError("Token inválido o expirado", 401));
    }

    const user = await prisma.usuario.findUnique({
      where: { idUsuario: decoded.user.idUsuario }
    });

    if (!user) {
      return next(new AppError("Usuario no autorizado", 401));
    }

    req.user = { id: user.idUsuario };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError("Token inválido o expirado", 401));
  }
};