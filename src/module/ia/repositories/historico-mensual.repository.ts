import { prisma } from "../../../lib/prisma";

/**
 * Busca el resumen mensual actual.
 *
 * Se necesita conocer su establecimiento
 * y período para poder consultar el histórico.
 */
export const buscarResumenMensualPorId = async (idResumenMensual: string) => {
  return prisma.resumenMensual.findUnique({
    where: {
      idResumenMensual,
    },
    select: {
      idEstablecimiento: true,
      anio: true,
      mes: true,
    },
  });
};

/**
 * Busca los seis resúmenes mensuales anteriores
 * correspondientes al mismo establecimiento.
 */
export const buscarResumenesAnteriores = async (idEstablecimiento: string, anio: number, mes: number) => {
  return prisma.resumenMensual.findMany({
    where: {
      idEstablecimiento,

      OR: [
        {
          anio: {
            lt: anio,
          },
        },
        {
          anio,
          mes: {
            lt: mes,
          },
        },
      ],
    },

    include: {
      costosPorCategoria: {
        select: {
          idResumenCostoCategoria: true,
          categoria: true,
          monto: true,
        },
      },
    },

    orderBy: [
      {
        anio: "desc",
      },
      {
        mes: "desc",
      },
    ],

    take: 6,
  });
};
