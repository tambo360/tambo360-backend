import { Request, Response } from "express"
import { MermaService } from "../services/mermaService"

const mermaService = new MermaService()

export class MermaController {

  async getTipos(req: Request, res: Response) {
    const tipos = await mermaService.getTipos()
    res.json(tipos)
  }

  async create(req: Request, res: Response) {
    try {
      const merma = await mermaService.create(req.body)
      res.status(201).json(merma)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  async findAll(req: Request, res: Response) {
    const mermas = await mermaService.findAll()
    res.json(mermas)
  }

  async findById(req: Request, res: Response) {
    try {
      const merma = await mermaService.findById(req.params.id)
      if (!merma) {
        return res.status(404).json({ message: "Merma no encontrada" })
      }
      res.json(merma)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const merma = await mermaService.update(req.params.id, req.body)
      res.json(merma)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await mermaService.delete(req.params.id)
      res.json({ message: "Merma eliminada correctamente" })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
}