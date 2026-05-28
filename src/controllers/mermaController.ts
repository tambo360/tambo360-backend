import { Request, Response } from "express"
import mermaService from "../services/mermaService"
import { ApiResponse } from "../utils/ApiResponse";

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

  async delete(req: Request, res: Response) {
    try {
      await mermaService.delete(req.params.id)
      res.status(200).json(
        ApiResponse.success(null, "Merma eliminada correctamente")
      )
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
}

export default new MermaController()
