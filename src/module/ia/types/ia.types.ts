
import { TipoSeguimiento as TipoSeguimientoDB, TipoEventoIA as TipoEventoIADB, AmbitoPromedioProductivo as AmbitoPromedioProductivoDB, TipoAlertaIA as TipoAlertaIADB, NivelAlerta as NivelAlertaDB, TipoMerma, CategoriaCostoResumen} from "@prisma/client";
import { ErrorEjecucionIA, EstadoEjecucionIAType, MetricasEjecucionIA } from "./ia.execution.types";

export type TipoEventoIA = TipoEventoIADB;
export type TipoSeguimiento = TipoSeguimientoDB;
export type AmbitoPromedioProductivo = AmbitoPromedioProductivoDB;
export type TipoAlertaIA = TipoAlertaIADB;
export type NivelAlerta = NivelAlertaDB;

export type ResultadoAnalisisIA =
    | "COMPLETED"
    | "INSUFFICIENT_HISTORY";



//------------------PARA EVENTO DE LOTE ---------------------------------------------------------------------------

export interface ProduccionAnimal {
    idAnimal: string;
    litros: string;
}

export interface PromedioProductivoLote {
    idLote: string;
    cantLitros: string;
    cantAnimales: number;
    creadoEn: string;
    mermas: {
        tipo: TipoMerma;
        cantidad: string;
    }[];
}

export interface PromedioProductivo {
    idPromedioProductivo: string;
    ambito: AmbitoPromedioProductivo;
    promedioLitrosPorAnimal: string;
    cantLotes: number;
    periodoDesde: string | null;
    periodoHasta: string | null;
    lotes: PromedioProductivoLote[];
}

export interface DataForLotEvent {
    lote: {
        idLote: string;
        cantidad: string;
        cantAnimales: number;
        fechaProduccion: string;
        listaAnimales: ProduccionAnimal[] | null;
    };
    contexto: {
        tipoSeguimiento: TipoSeguimiento;
        promedioProductivo: PromedioProductivo;
    };
}

//-------------------------------------------------------------------------------------------------------

//-------------------- PARA EVENTO DE MES CERRADO------------------------------------------------------------
export interface CostoPorCategoria {
    idResumenCostoCategoria: string;
    categoria: CategoriaCostoResumen;
    monto: string;
}

export interface DataForMonthEvent {
    idResumenMensual: string;
    anio: number;
    mes: number;
    fechaDesde: string;
    fechaHasta: string;
    cantLotes: number;
    litrosProduccion: string;
    litrosMermas: string;
    litrosTotales: string;
    litrosLibres: string | null;
    costosTotales: string;
    costoPorLitro: string | null;
    costoPorCategoria: CostoPorCategoria[];
}

//--------------------------------------------------------------------------------------------------------------

export interface AnalisisIARequest {
    idEventoIA: string;
    tipo: TipoEventoIA;
    idEstablecimiento: string;
    datos: DataForLotEvent | DataForMonthEvent;
}

export interface AlertaIAResponse {
    tipo: TipoAlertaIA;
    nivel: NivelAlerta;
    titulo: string;
    descripcion: string;
    recomendacion?: string | null;
    datosContexto?: Record<string, unknown> | null;
}

export interface AnalisisIAResponse {
    idEventoIA: string;
    resultado: ResultadoAnalisisIA;
    alerta: AlertaIAResponse | null;
}

export interface ErrorIAResponse {
    error: {
        codigo: string;
        mensaje: string;
        reintentable: boolean;
        detalles?: Array<{
            campo: string;
            mensaje: string;
        }>;
    };
}

export interface EventoLoteParams {
    idEstablecimiento: string;
    idLote: string;
}

export interface EventoReclamado {
    idEventoIA: string;
    idEjecucionIA: string;
    tokenBloqueo: string;
    intentos: number;
    intentosMaximos: number;
}

export interface ErrorProcesamiento {
    codigo: string;
    mensaje: string;
    reintentable: boolean;
}


export interface CrearEventoIAParams {
  idEstablecimiento: string;
  tipo: TipoEventoIA;
  claveIdempotencia: string;
  idLote?: string;
  idResumenMensual?: string;
}


export interface FallarEventoIAParams {
  idEventoIA: string;
  tokenBloqueo: string;
  codigo: string;
  mensaje: string;
  reintentable: boolean;
}

export interface ReactivarEventoIAParams {
  idEventoIA: string;
  intentosAdicionales: number;
}