import { Categoria, ConceptoCosto, Merma, TipoMerma, Unidad } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import e from "express";

declare module 'express' {
  interface Request {
    user?: { id: string };

  }
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ValidationError {
  field: string;
  message: string;
}
export { RegistrationData, LoginData, ValidationError };

export type InfoMes = {
  idLote: string;
  numeroLote: number;
  fechaProduccion: Date;
  cantidad: Decimal;
  unidad: Unidad;
  estado: boolean;
  idProducto: string;
  idEstablecimiento: string;
  producto: {
    idProducto: string;
    nombre: string;
    categoria: Categoria;
  };
  mermas: {
    idLote: string;
    cantidad: Decimal;
    fechaCreacion: Date;
    idMerma: string;
    tipo: TipoMerma;
    observacion: string | null;
  }[];
  costosDirectos: {
    idLote: string;
    fechaCreacion: Date;
    idCostoDirecto: string;
    concepto: ConceptoCosto;
    monto: Decimal;
    observaciones: string | null;
  }[];
}[]

type CategorySummary = { cantidad: number; costos: number; mermas: number; };
export type SummaryResult = Record<string, CategorySummary>;

export const MetricaObj = {
  cantidad: "cantidad",
  mermas: "mermas",
  costos: "costos"
} as const;

export type Metrica = typeof MetricaObj[keyof typeof MetricaObj];
