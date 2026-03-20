import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";

export const check = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = {
      status: "ok",
      timestamp: new Date(),
      uptime: process.uptime(),
    };
    const response = ApiResponse.success(data, "El sistema funciona correctamente");
    res.status(response.statusCode).json(response);
  } catch (error) {
    const response = ApiResponse.error("Fallo en el chequeo de salud", 500);
    res.status(response.statusCode).json(response);
  }
};
