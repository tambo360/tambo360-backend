export interface MetricasEjecucionIA {
  usoLLM?: boolean;
  proveedor?: string | null;
  modelo?: string | null;
  tokensEntrada?: number | null;
  tokensSalida?: number | null;
}

export interface ErrorEjecucionIA {
  codigo: string;
  mensaje: string;
}


export enum EstadoEjecucionIAType {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RUNNING = 'RUNNING'
}

export interface FinalizarEjecucionParams {
  idEjecucionIA: string;
  estadoFinal: EstadoEjecucionIAType.COMPLETED | EstadoEjecucionIAType.FAILED;
  error?: ErrorEjecucionIA;
  metricas?: MetricasEjecucionIA;
}
