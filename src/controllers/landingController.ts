import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { sendContactEmail } from "../services/mailService";

export class LandingController {
    static async enviarCorreoContacto(req: Request, res: Response, next: NextFunction) {
        try {
            const { nombre, email, telefono, mensaje } = req.body;

            if (!nombre || !email || !telefono || !mensaje) {
                throw new AppError("Todos los campos son requeridos", 400);
            }

            await sendContactEmail(nombre, email, telefono, mensaje);

            return res.status(200).json(ApiResponse.success(null, "Correo de contacto enviado correctamente"));
        } catch (error) {
            next(error);
        }
    }

}
