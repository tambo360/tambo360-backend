// src/modules/tambo/tambo.repository.ts

import { prisma } from "../../lib/prisma";
import { Categoria } from "./tambo.types";

export const tamboRepository = {
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
    return prisma.promedioCategoria.create({
      data,
    });
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
};