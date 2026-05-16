import { Categoria, ConceptoCosto, Merma, RolEstablecimiento, RolOrganizacion, TipoMerma, Unidad } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

declare module 'express' {
  interface Request {
    user?: { id: string };
    
    orgId?: string;
    estId?: string;
    orgAccess?: {
      idOrganizacionUsuario: string;
      idUsuario: string;
      idOrganizacion: string;
      rol: RolOrganizacion;
    };
    estAccess?: {
      idEstablecimientoOrganizacionUsuario: string;
      rol: RolEstablecimiento;
      idEstablecimiento: string;
    }
  }
}


export interface RequireRolesConfig {
  org?: RolOrganizacion[];
  est?: RolEstablecimiento[];
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

export const ORgRolObj = {
  ORG_OWNER: "ORG_OWNER",
  ORG_ADMIN: "ORG_ADMIN",
  ORG_MEMBER: "ORG_MEMBER"
} as const;



export const rolOrganizacionLabel: Record<RolOrganizacion, string> = {
  ORG_OWNER: "Propietario de la organización",
  ORG_ADMIN: "Administrador de la organización",
  MEMBER: "Miembro"
};

export const rolEstablecimientoLabel: Record<RolEstablecimiento, string> = {
  OWNER: "Propietario del establecimiento",
  ADMIN: "Administrador del establecimiento",
  EMPLOYEE: "Empleado"
};