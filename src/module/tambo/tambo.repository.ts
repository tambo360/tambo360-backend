import { prisma } from "../../lib/prisma";

export const tamboRepository = {
  /**
   * Obtiene el promedio de merma para una categoría específica
   * dentro de un establecimiento.
   *
   * @param idEstablecimiento - ID del establecimiento
   * @param categoria - Categoría del lote (ej: quesos, leches)
   * @returns Registro de promedio de la categoría o null si no existe
   */
  async getPromedio(idEstablecimiento: string, categoria: string) {
    return prisma.promedioCategoria.findFirst({
      where: {
        idEstablecimiento,
        categoria,
      },
    });
  },

  /**
   * Crea un nuevo registro de promedio de categoría.
   *
   * @param data - Datos del promedio a crear
   * @param data.idEstablecimiento - ID del establecimiento
   * @param data.categoria - Categoría del lote
   * @param data.produccionAcumulada - Producción total acumulada (opcional)
   * @param data.mermaAcumulada - Merma total acumulada (opcional)
   * @param data.pctMermaPromedio - Porcentaje promedio de merma (opcional)
   * @param data.cantidadLotes - Cantidad de lotes considerados (opcional)
   * @returns Registro creado en la base de datos
   */
  async createPromedio(data: {
    idEstablecimiento: string;
    categoria: string;
    produccionAcumulada?: number;
    mermaAcumulada?: number;
    pctMermaPromedio?: number;
    cantidadLotes?: number;
  }) {
    return prisma.promedioCategoria.create({
      data,
    });
  },

  /**
   * Actualiza un registro de promedio de categoría existente.
   *
   * @param id - ID del registro a actualizar
   * @param data - Campos a actualizar
   * @param data.produccionAcumulada - Nueva producción acumulada (opcional)
   * @param data.mermaAcumulada - Nueva merma acumulada (opcional)
   * @param data.pctMermaPromedio - Nuevo porcentaje promedio de merma (opcional)
   * @param data.cantidadLotes - Nueva cantidad de lotes (opcional)
   * @param data.categoria - Nueva categoría (opcional)
   * @param data.idEstablecimiento - Nuevo ID de establecimiento (opcional)
   * @returns Registro actualizado
   */
  async updatePromedio(
    id: string,
    data: {
      produccionAcumulada?: number;
      mermaAcumulada?: number;
      pctMermaPromedio?: number;
      cantidadLotes?: number;
      categoria?: string;
      idEstablecimiento?: string;
    }
  ) {
    return prisma.promedioCategoria.update({
      where: { id },
      data,
    });
  },
};