import { prisma } from "../lib/prisma"
import { TipoMerma } from "@prisma/client"

class MermaService {

  async getTipos() {
    return [
      "Natural",
      "Tecnica",
      "Administrativa",
      "Danio"
    ]
  }

  async create(data: any) {
    if (!data.idLote) throw new Error("El id del lote es obligatorio")
    if (!data.tipo) throw new Error("El tipo de merma es obligatorio")
    if (!data.cantidad) throw new Error("La cantidad es obligatoria")

    if (!Object.values(TipoMerma).includes(data.tipo)) {
      throw new Error("Tipo de merma inválido")
    }

    if (isNaN(Number(data.cantidad)) || Number(data.cantidad) <= 0) {
      throw new Error("La cantidad debe ser un número mayor a 0")
    }

    const lote = await prisma.loteProduccion.findUnique({
      where: { idLote: data.idLote }
    })
    if (!lote) throw new Error("El lote indicado no existe")

    const totalMermas = await prisma.merma.aggregate({
      _sum: { cantidad: true },
      where: { idLote: data.idLote }
    })
    const sumaMermas = Number(totalMermas._sum.cantidad || 0)

    if (sumaMermas + Number(data.cantidad) > Number(lote.cantidad)) {
      throw new Error("La merma supera la cantidad disponible del lote")
    }

    return prisma.merma.create({
      data: {
        tipo: data.tipo,
        observacion: data.observacion,
        cantidad: data.cantidad,
        idLote: data.idLote
      }
    })
  }

  async findAll() {
    return prisma.merma.findMany({
      include: { lote: true }
    })
  }

  async findById(idMerma: string) {
    const merma = await prisma.merma.findUnique({
      where: { idMerma },
      include: { lote: true }
    })
    if (!merma) throw new Error("La merma no existe")
    return merma
  }

  async getByLote(idLote: string) {
    const lote = await prisma.loteProduccion.findUnique({ where: { idLote } })
    if (!lote) throw new Error("El lote indicado no existe")

    return prisma.merma.findMany({ where: { idLote } })
  }

  async update(idMerma: string, data: any) {
    const merma = await prisma.merma.findUnique({ where: { idMerma } })
    if (!merma) throw new Error("La merma no existe")

    const lote = await prisma.loteProduccion.findUnique({
      where: { idLote: merma.idLote }
    })
    if (!lote) throw new Error("El lote asociado no existe")

    if (data.cantidad !== undefined) {
      if (isNaN(Number(data.cantidad)) || Number(data.cantidad) <= 0) {
        throw new Error("La cantidad debe ser un número y mayor a 0")
      }

      const totalMermas = await prisma.merma.aggregate({
        _sum: { cantidad: true },
        where: { idLote: merma.idLote, NOT: { idMerma } }
      })
      const sumaMermas = Number(totalMermas._sum.cantidad || 0)

      if (sumaMermas + Number(data.cantidad) > Number(lote.cantidad)) {
        throw new Error("La merma supera la cantidad disponible del lote")
      }
    }

    if (data.tipo && !Object.values(TipoMerma).includes(data.tipo)) {
      throw new Error("Tipo de merma inválido")
    }

    return prisma.merma.update({
      where: { idMerma },
      data: {
        tipo: data.tipo ?? merma.tipo,
        observacion: data.observacion ?? merma.observacion,
        cantidad: data.cantidad ?? merma.cantidad
      }
    })
  }

  async delete(idMerma: string) {
    const merma = await prisma.merma.findUnique({ where: { idMerma } })
    if (!merma) throw new Error("La merma no existe")

    await prisma.merma.delete({ where: { idMerma } })
    return { message: "Merma eliminada correctamente" }
  }
}

export default new MermaService()
