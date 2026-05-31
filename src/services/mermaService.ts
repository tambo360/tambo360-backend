import { prisma } from "../lib/prisma"
import { TipoMerma } from "@prisma/client"
import { TipoMermaMetadata } from "../utils"
import { AppError } from "../utils/AppError"
import { LoteService } from "./batchService"

class MermaService {

  async getTipos() {
    return Object.values(TipoMerma).map(tipo => ({ value: tipo, label: TipoMermaMetadata[tipo].label }))
  }

  async create(idEstablecimiento: string, data: any) {
    return prisma.$transaction(async (tx) => {

      const lote = await LoteService.obtenerLoteEditable(data.id_lote, tx);

      if (lote.idEstablecimiento !== idEstablecimiento) {
        throw new AppError("El lote no pertenece al establecimiento", 403);
      }

      if (!data.cantidad || isNaN(Number(data.cantidad)) || Number(data.cantidad) <= 0) {
        throw new AppError("La cantidad debe ser mayor a 0", 400);
      }

      if (!data.tipoMerma || !Object.values(TipoMerma).includes(data.tipoMerma)) {
        throw new AppError("Tipo de merma inválido", 400);
      }

      const totalMermas = await tx.merma.aggregate({
        _sum: { cantidad: true },
        where: { idLote: data.id_lote }
      });
      const sumaMermas = Number(totalMermas._sum.cantidad || 0);

      if (sumaMermas + Number(data.cantidad) > Number(lote.cantidad)) {
        throw new AppError("La merma supera la producción del lote", 409);
      }

      return tx.merma.create({
        data: {
          tipo: data.tipoMerma,
          observacion: data.observaciones,
          cantidad: data.cantidad,
          idLote: data.id_lote
        }
      });
    });
  }

  /*
    async findAll() {
      return prisma.merma.findMany({
        include: { lote: true }
      })
    }
  */

  //nuevo metodo finAll
  async findAll(idEstablecimiento: string, idLote?: string) {

    return prisma.merma.findMany({

      where: {
        ...(idLote ? { idLote } : {}),

        lote: {
          idEstablecimiento
        }
      },

      include: {
        lote: {
          select: {
            idLote: true,
            numeroLote: true,
            fechaProduccion: true
          }
        }
      },

      orderBy: {
        fechaCreacion: "desc"
      }
    })
  }

  /* 
   async findById(idMerma: string) {
      const merma = await prisma.merma.findUnique({
        where: { idMerma },
        include: { lote: true }
      })
      if (!merma) throw new Error("La merma no existe")
      return merma
    }
      */

  //nuevo findById

  async findById(idMerma: string, idEstablecimiento: string) {

    const merma = await prisma.merma.findUnique({
      where: { idMerma },

      include: {
        lote: {
          select: {
            idLote: true,
            numeroLote: true,
            fechaProduccion: true,
            idEstablecimiento: true
          }
        }
      }
    })

    if (!merma) {
      throw new AppError("Merma no encontrada", 404)
    }

    // =====================================================
    // Aislamiento multi-tenant
    // =====================================================
    if (merma.lote.idEstablecimiento !== idEstablecimiento) {
      throw new AppError("Merma no encontrada", 404)
    }

    return merma
  }

  async getByLote(idLote: string) {
    const lote = await prisma.loteProduccion.findUnique({ where: { idLote } })
    if (!lote) throw new Error("El lote indicado no existe")

    return prisma.merma.findMany({ where: { idLote } })
  }


  async update(idMerma: string, idEstablecimiento: string, data: any) {
    return prisma.$transaction(async (tx) => {

      const merma = await tx.merma.findUnique({
        where: { idMerma },
        include: { lote: true }
      });

      if (!merma) {
        throw new AppError("Merma no encontrada", 404);
      }

      if (merma.lote.idEstablecimiento !== idEstablecimiento) {
        throw new AppError("Merma no encontrada", 404);
      }

      await LoteService.obtenerLoteEditable(merma.idLote, tx);

      if (data.cantidad !== undefined) {
        if (isNaN(Number(data.cantidad)) || Number(data.cantidad) <= 0) {
          throw new AppError("La cantidad debe ser mayor a 0", 400);
        }

        const totalMermas = await tx.merma.aggregate({
          _sum: { cantidad: true },
          where: { idLote: merma.idLote, NOT: { idMerma } }
        });
        const sumaMermas = Number(totalMermas._sum.cantidad || 0);

        if (sumaMermas + Number(data.cantidad) > Number(merma.lote.cantidad)) {
          throw new AppError("La merma supera la producción del lote", 409);
        }
      }

      if (data.tipoMerma && !Object.values(TipoMerma).includes(data.tipoMerma)) {
        throw new AppError("Tipo de merma inválido", 400);
      }

      return tx.merma.update({
        where: { idMerma },
        data: {
          tipo: data.tipoMerma ?? merma.tipo,
          observacion: data.observaciones ?? merma.observacion,
          cantidad: data.cantidad ?? merma.cantidad
        }
      });
    });
  }

  async delete(idMerma: string, idEstablecimiento: string) {
    await prisma.$transaction(async (tx) => {
      const merma = await tx.merma.findUnique({
        where: { idMerma },
        include: { lote: true }
      })

      if (!merma) {
        throw new AppError("Merma no encontrada", 404)
      }

      const lote = await LoteService.obtenerLoteEditable(merma.idLote, tx)

      if (lote.idEstablecimiento !== idEstablecimiento) {
        throw new AppError("Merma no encontrada", 404)
      }

      await tx.merma.delete({ where: { idMerma } })
    })
  }
}

export default new MermaService()
