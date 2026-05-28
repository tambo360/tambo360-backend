import { Request, Response, NextFunction } from "express"
import mermaService from "../services/mermaService"
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";

class MermaController {

  async getTipos(req: Request, res: Response) {
    try {
      const tipos = await mermaService.getTipos()
      res.status(200).json(
        ApiResponse.success(tipos, "Tipos de merma obtenidos correctamente")
      )
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }

  }

  async create(req: Request, res: Response) {
    try {
      const merma = await mermaService.create(req.body)
      res.status(201).json(
        ApiResponse.success(merma)
      )
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const mermas = await mermaService.findAll()
      res.status(200).json(
        ApiResponse.success(mermas)
      )
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const merma = await mermaService.findById(req.params.id)
      if (!merma) {
        return res.status(404).json({ message: "Merma no encontrada" })
      }
      res.status(200).json(
        ApiResponse.success(merma)
      )
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const merma = await mermaService.update(req.params.id, req.body)
      res.status(200).json(
        ApiResponse.success(merma)
      )
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const idEstablecimiento = (req as any).estAccess?.idEstablecimiento;

      if (!idEstablecimiento) {
        throw new AppError("No se pudo determinar el establecimiento", 400)
      }

      await mermaService.delete(req.params.id, idEstablecimiento)
      return res.status(200).json(
        ApiResponse.success(null, "Merma eliminada correctamente")
      );
    } catch (error) {
      next(error)
    }
  }
}

export default new MermaController()
