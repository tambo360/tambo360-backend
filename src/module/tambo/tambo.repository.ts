// src/modules/tambo/tambo.repository.ts

import { prisma } from "../../lib/prisma";
import { Categoria, NivelAlerta } from "./tambo.types";

export const tamboRepository = {
  // -----------------------------
  // PROMEDIOS
  // -----------------------------
  async getPromedio(idEstablecimiento: string, categoria: Categoria) {
    return prisma.promedioCategoria.findUnique({
      where: {
        idEstablecimiento_categoria: {
          idEstablecimiento,
          categoria,
        },
      },
    });
  },

  async createPromedio(data: {
    idEstablecimiento: string;
    categoria: Categoria;
    produccionAcumulada: number;
    mermaAcumulada: number;
    pctMermaPromedio: number;
    cantidadLotes: number;
  }) {
    return prisma.promedioCategoria.create({ data });
  },

  async updatePromedio(
    idEstablecimiento: string,
    categoria: Categoria,
    data: {
      produccionAcumulada?: number;
      mermaAcumulada?: number;
      pctMermaPromedio?: number;
      cantidadLotes?: number;
    }
  ) {
    return prisma.promedioCategoria.update({
      where: {
        idEstablecimiento_categoria: {
          idEstablecimiento,
          categoria,
        },
      },
      data,
    });
  },

  // -----------------------------
  // ALERTAS
  // -----------------------------
  async createAlerta(data: {
    idEstablecimiento: string;
    idLote: string;
    producto: string;
    categoria: Categoria;
    nivel: NivelAlerta;
    descripcion: string;
  }) {
    return prisma.alerta.create({
      data,
    });
  },

  async getAlertas(idEstablecimiento: string, rangoDias?: number) {
    const where: any = {
      idEstablecimiento,
    };

    if (rangoDias) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - rangoDias);

      where.creadoEn = {
        gte: fecha,
      };
    }

    return prisma.alerta.findMany({
      where,
      orderBy: {
        creadoEn: "desc",
      },
    });
  },

  async getUltimasAlertas(idEstablecimiento: string) {
    return prisma.alerta.findMany({
      where: {
        idEstablecimiento,
      },
      orderBy: {
        creadoEn: "desc",
      },
      take: 2,
    });
  },

  async marcarAlertaVisto(idAlerta: string) {
    return prisma.alerta.update({
      where: { id: idAlerta },
      data: { visto: true },
    });
  },

  async countAlertasNoVistas(idEstablecimiento: string) {
    const count = await prisma.alerta.count({
      where: {
        idEstablecimiento,
        visto: false,
      },
    });

    return { cantidad: count };
  },

  async getAlertasPorLote(idEstablecimiento: string, idLote: string) {
    return prisma.alerta.findMany({
      where: {
        idEstablecimiento,
        idLote,
      },
      orderBy: {
        creadoEn: "desc",
      },
    });
  }
};