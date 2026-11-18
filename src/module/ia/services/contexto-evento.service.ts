import { AppError } from "../../../utils/AppError";

import { buscarEventoPorIdYEstablecimiento, buscarConfiguracionPorEstablecimiento,  buscarPeriodoEvento,  buscarMovimientosPorConfiguracion,  buscarProduccionesHistoricasPorAnimal,} from "../repositories/contexto-evento.repository";

import {ContextoEventoResponse, MovimientoContexto,  MovimientosPorRodeo,  HistorialProduccionAnimal,} from "../types/contexto-evento.types";

/**
 * Obtiene el contexto productivo de un evento de IA.
 *
 * Reglas:
 * - El evento debe existir y pertenecer al establecimiento indicado.
 * - Se consulta la configuración productiva del establecimiento.
 * - Se recuperan los movimientos registrados.
 * - Si el seguimiento es INDIVIDUAL, se recuperan hasta
 *   30 producciones anteriores por cada animal involucrado.
 * - Se excluye el lote actual del historial productivo.
 */
export const obtenerContextoEvento = async (
  idEventoIA: string,
  idEstablecimiento: string
): Promise<ContextoEventoResponse> => {

  // 1. Buscar el evento y validar su pertenencia al establecimiento.
  const evento = await buscarEventoPorIdYEstablecimiento(
    idEventoIA,
    idEstablecimiento
  );

  if (!evento) {
    throw new AppError("Evento de IA no encontrado", 404);
  }

  // 2. Obtener la configuración del establecimiento.
  const configuracion = await buscarConfiguracionPorEstablecimiento(
    idEstablecimiento
  );

  if (!configuracion) {
    throw new AppError(
      "No existe una configuración para el establecimiento",
      404
    );
  }

   // 3. Obtener el período correspondiente al evento.
  const periodo = await buscarPeriodoEvento(
    evento,
    idEstablecimiento,
    configuracion.tipoSeguimiento
  );

  // 4. Consultar movimientos únicamente si existe un período válido.
  // Si no existe, devolvemos una lista vacía y evitamos consultar
  // todos los movimientos históricos del establecimiento.
  const movimientosDB = periodo
    ? await buscarMovimientosPorConfiguracion(
        configuracion.idConfiguracion,
        periodo
      )
    : [];

  //5. Transformar los movimientos al formato de respuesta.
  const movimientos: MovimientoContexto[] = movimientosDB.map(
    (movimiento) => ({
      idMovimiento: movimiento.idMovimiento,
      tipo: movimiento.tipo,
      motivo: movimiento.motivo,
      causa: movimiento.causa,
      cantidad: movimiento.cantidad,
      fechaCreacion: movimiento.fechaCreacion.toISOString(),
      observacion: movimiento.observacion,
      retorno: movimiento.retorno?.toISOString() ?? null,
      rodeoOrigen: movimiento.rodeoOrigen,
      rodeoDestino: movimiento.rodeoDestino,
      categoriaOrigen: movimiento.categoriaOrigen,
      categoriaDestino: movimiento.categoriaDestino,

      animales: movimiento.detalles.map((detalle) => ({
        idAnimal: detalle.animal.idAnimal,
        codigo: detalle.animal.codigo,
        nombre: detalle.animal.nombre,
        categoria: detalle.animal.categoria,
        estado: detalle.animal.estado,
      })),
    })
  );

    // Agrupar movimientos según el tipo de seguimiento.
  let movimientosRespuesta:
    | MovimientoContexto[]
    | MovimientosPorRodeo;

  if (configuracion.tipoSeguimiento === "INDIVIDUAL") {
    // En seguimiento individual se devuelven los movimientos
    // con los animales asociados.
    movimientosRespuesta = movimientos;
  } else {
    // En seguimiento por rodeos se agrupan por tipo de movimiento.
    movimientosRespuesta = {
      ingresos: movimientos.filter(
        (movimiento) => movimiento.tipo === "INGRESO"
      ),
      egresos: movimientos.filter(
        (movimiento) => movimiento.tipo === "EGRESO"
      ),
      transferencias: movimientos.filter(
        (movimiento) => movimiento.tipo === "TRANSFERENCIA"
      ),
    };
  }

  // 6. Recuperar el historial productivo solamente
  // cuando el establecimiento utiliza seguimiento individual.
  let historialProduccion: HistorialProduccionAnimal[] = [];

  if (configuracion.tipoSeguimiento === "INDIVIDUAL") {

    // Obtener los identificadores únicos de los animales
    // que aparecen en los movimientos consultados.
    const idsAnimales = [
      ...new Set(
        movimientosDB.flatMap((movimiento) =>
          movimiento.detalles.map((detalle) => detalle.animal.idAnimal)
        )
      ),
    ];

    // Consultar el historial de cada animal.
    historialProduccion = await Promise.all(
      idsAnimales.map(async (idAnimal) => {
        const producciones = await buscarProduccionesHistoricasPorAnimal(
          idAnimal,
          idEstablecimiento,
          evento.idLote
        );

        return {
          idAnimal,
          producciones: producciones.map((produccion) => ({
            idLote: produccion.idLote,
            fechaProduccion: produccion.lote.fechaProduccion.toISOString(),
            litros: produccion.litros.toString(),
          })),
        };
      })
    );
  }

  // 7. Devolver el contexto completo.
  return {
    evento: {
      idEventoIA: evento.idEventoIA,
      idEstablecimiento: evento.idEstablecimiento,
      tipo: evento.tipo,
      idLoteActual: evento.idLote,
      tipoSeguimiento: configuracion.tipoSeguimiento,
    },
    movimientos: movimientosRespuesta,
    historialProduccion,
  };
};
