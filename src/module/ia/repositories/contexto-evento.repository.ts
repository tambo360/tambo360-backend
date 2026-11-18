import { prisma} from "../../../lib/prisma";
import { AmbitoPromedioProductivo, TipoEventoIA,  TipoSeguimiento,  TipoRodeo,} from "@prisma/client";

/**
 * Cantidad máxima de producciones históricas que se recuperan
 * por cada animal.
 *
 * Se excluye el lote actual porque Python ya recibe esa producción
 * mediante el endpoint POST /analyses.
 */
const LIMITE_PRODUCCIONES_HISTORICAS = 30;

/**
 * Busca un evento de IA que pertenezca al establecimiento indicado.
 *
 * La condición por establecimiento evita devolver un evento
 * asociado a otro establecimiento.
 */
export const buscarEventoPorIdYEstablecimiento = async (
  idEventoIA: string,
  idEstablecimiento: string
) => {
  return prisma.aiAnalysisEvent.findFirst({
    where: {
      idEventoIA,
      idEstablecimiento,
    },
    select: {
      idEventoIA: true,
      idEstablecimiento: true,
      tipo: true,
      idLote: true,
      idResumenMensual: true,
    },
  });
};

/**
 * Busca la configuración correspondiente al establecimiento.
 *
 * De ella obtenemos el tipo de seguimiento configurado:
 * RODEO, RODEO_UNICO o INDIVIDUAL.
 */
export const buscarConfiguracionPorEstablecimiento = async (
  idEstablecimiento: string
) => {
  return prisma.configuracion.findUnique({
    where: {
      idEstablecimiento,
    },
    select: {
      idConfiguracion: true,
      tipoSeguimiento: true,
    },
  });
};

/**
 * Obtiene el período que corresponde al evento de IA.
 *
 * LOT_CLOSED:
 * - Identifica el ámbito mediante el tipo de seguimiento
 *   y el tipo de rodeo del lote.
 * - Recupera el período del promedio productivo.
 *
 * MONTH_CLOSED:
 * - Recupera las fechas del resumen mensual asociado.
 *
 * Si no existe un período válido, devuelve null.
 */
export const buscarPeriodoEvento = async (
  evento: {
    tipo: TipoEventoIA;
    idLote: string | null;
    idResumenMensual: string | null;
  },
  idEstablecimiento: string,
  tipoSeguimiento: TipoSeguimiento
): Promise<{ periodoDesde: Date; periodoHasta: Date } | null> => {

  // Los eventos mensuales utilizan las fechas del resumen.
  if (evento.tipo === TipoEventoIA.MONTH_CLOSED) {
    if (!evento.idResumenMensual) return null;

    const resumen = await prisma.resumenMensual.findFirst({
      where: {
        idResumenMensual: evento.idResumenMensual,
        idEstablecimiento,
      },
      select: {
        fechaDesde: true,
        fechaHasta: true,
      },
    });

    if (!resumen) return null;

    return validarPeriodo(resumen.fechaDesde, resumen.fechaHasta);
  }

  // Los eventos de lote necesitan identificar el lote.
  if (!evento.idLote) return null;

  let ambito: AmbitoPromedioProductivo | null = null;

  // En seguimiento individual el ámbito es independiente del rodeo.
  if (tipoSeguimiento === TipoSeguimiento.INDIVIDUAL) {
    ambito = AmbitoPromedioProductivo.INDIVIDUAL;
  } else {
    const lote = await prisma.loteProduccion.findFirst({
      where: {
        idLote: evento.idLote,
        idEstablecimiento,
      },
      select: {
        rodeo: {
          select: {
            tipoRodeo: true,
          },
        },
      },
    });

    if (!lote?.rodeo) return null;

    const tipoRodeo = lote.rodeo.tipoRodeo;

    if (tipoSeguimiento === TipoSeguimiento.RODEO) {
      if (tipoRodeo === TipoRodeo.ALTA_PRODUCCION) {
        ambito = AmbitoPromedioProductivo.RODEO_ALTO;
      }

      if (tipoRodeo === TipoRodeo.BAJA_PRODUCCION) {
        ambito = AmbitoPromedioProductivo.RODEO_BAJO;
      }
    }

    if (tipoSeguimiento === TipoSeguimiento.RODEO_UNICO) {
      if (
        tipoRodeo === TipoRodeo.UNICO_ORDENIE ||
        tipoRodeo === TipoRodeo.UNICO_SECA
      ) {
        ambito = AmbitoPromedioProductivo.RODEO_UNICO;
      }
    }
  }

  if (!ambito) return null;

  const promedio = await prisma.promedioProductivo.findFirst({
    where: {
      idEstablecimiento,
      ambito,
    },
    select: {
      periodoDesde: true,
      periodoHasta: true,
    },
  });

  if (!promedio?.periodoDesde || !promedio.periodoHasta) {
    return null;
  }

  return validarPeriodo(
    promedio.periodoDesde,
    promedio.periodoHasta
  );
};

/**
 * Comprueba que las dos fechas existan y que el rango sea válido.
 */
const validarPeriodo = (
  desde: Date | null,
  hasta: Date | null
): { periodoDesde: Date; periodoHasta: Date } | null => {
  if (!desde || !hasta || desde > hasta) {
    return null;
  }

  return {
    periodoDesde: desde,
    periodoHasta: hasta,
  };
};


/**
 * Busca los movimientos registrados en la configuración
 * del establecimiento.
 *
 * Los animales se obtienen mediante MovimientoAnimalDetalle.
 * No se filtran por activo, porque también interesa conservar
 * el contexto de animales que ya egresaron.
 */
export const buscarMovimientosPorConfiguracion = async (
  idConfiguracion: string,
  periodo: { periodoDesde: Date; periodoHasta: Date }
) => {
  return prisma.movimientoAnimal.findMany({
    where: {
      idConfiguracion,
      fechaCreacion: {
        gte: periodo.periodoDesde,
        lte: periodo.periodoHasta,
      },
    },
    select: {
      idMovimiento: true,
      tipo: true,
      motivo: true,
      causa: true,
      cantidad: true,
      fechaCreacion: true,
      observacion: true,
      retorno: true,
      rodeoOrigen: true,
      rodeoDestino: true,
      categoriaOrigen: true,
      categoriaDestino: true,
      detalles: {
        select: {
          animal: {
            select: {
              idAnimal: true,
              codigo: true,
              nombre: true,
              categoria: true,
              estado: true,
            },
          },
        },
      },
    },
    orderBy: {
      fechaCreacion: "desc",
    },
  });
};
/**
 * Busca las últimas producciones de un animal dentro
 * del establecimiento indicado.
 *
 * Se excluye el lote actual para evitar duplicar información.
 * El límite se aplica individualmente a cada animal.
 */
export const buscarProduccionesHistoricasPorAnimal = async (
  idAnimal: string,
  idEstablecimiento: string,
  idLoteActual: string | null
) => {
  return prisma.produccionAnimal.findMany({
    where: {
      idAnimal,

      // Garantiza que el animal corresponda al establecimiento.
      animal: {
        is: {
          idEstablecimiento,
        },
      },

      // Garantiza que el lote también corresponda al establecimiento.
      lote: {
        is: {
          idEstablecimiento,
          ...(idLoteActual
            ? {
                idLote: {
                  not: idLoteActual,
                },
              }
            : {}),
        },
      },
    },
    select: {
      idLote: true,
      litros: true,

      lote: {
        select: {
          fechaProduccion: true,
        },
      },
    },
    orderBy: {
      lote: {
        fechaProduccion: "desc",
      },
    },
    take: LIMITE_PRODUCCIONES_HISTORICAS,
  });
};
