import {TipoMovimientoAnimal, MotivoMovimientoAnimal, CausaMovimientoAnimal, CategoriaAnimal, EstadoSanitarioAnimal,} from "@prisma/client";
import {TipoEventoIA, TipoSeguimiento,} from "./ia.types";

/**
 * Datos generales del evento cuyo contexto solicita Python.
 */
export interface EventoContexto {
  idEventoIA: string;
  idEstablecimiento: string;
  tipo: TipoEventoIA;
  idLoteActual: string | null;
  tipoSeguimiento: TipoSeguimiento;
}

/**
 * Identificación de un animal asociado a un movimiento.
 *
 * La categoría y el estado corresponden a los datos actuales
 * del animal, no necesariamente a los que tenía al momento
 * histórico del movimiento.
 */
export interface AnimalMovimientoContexto {
  idAnimal: string;
  codigo: string | null;
  nombre: string | null;
  categoria: CategoriaAnimal;
  estado: EstadoSanitarioAnimal;
}

/**
 * Movimiento registrado en el establecimiento.
 *
 * Los campos de rodeo se utilizan para seguimiento por rodeos.
 * Los animales asociados se obtienen mediante MovimientoAnimalDetalle.
 */
export interface MovimientoContexto {
  idMovimiento: string;
  tipo: TipoMovimientoAnimal;
  motivo: MotivoMovimientoAnimal;
  causa: CausaMovimientoAnimal | null;
  cantidad: number;
  fechaCreacion: string;
  observacion: string | null;
  retorno: string | null;

  rodeoOrigen: string | null;
  rodeoDestino: string | null;
  categoriaOrigen: CategoriaAnimal | null;
  categoriaDestino: CategoriaAnimal | null;

  animales: AnimalMovimientoContexto[];
  
}

/**
 * Movimientos agrupados para establecimientos con seguimiento por rodeos.
 */
export interface MovimientosPorRodeo {
  ingresos: MovimientoContexto[];
  egresos: MovimientoContexto[];
  transferencias: MovimientoContexto[];
}

/**
 * Producción histórica de un animal.
 *
 * La fecha corresponde al lote de producción asociado.
 */
export interface ProduccionHistoricaAnimal {
  idLote: string;
  fechaProduccion: string;
  litros: string;
}

/**
 * Historial de producción agrupado por animal.
 */
export interface HistorialProduccionAnimal {
  idAnimal: string;
  producciones: ProduccionHistoricaAnimal[];
}

/**
 * Respuesta del endpoint de contexto de evento.
 *
 * Cuando no existen movimientos o producciones,
 * se devuelven colecciones vacías.
 *
 * La estructura de movimientos depende del tipo de seguimiento.
 */
export interface ContextoEventoResponse {
  evento: EventoContexto;
  movimientos: MovimientoContexto[] | MovimientosPorRodeo;
  historialProduccion: HistorialProduccionAnimal[];
}