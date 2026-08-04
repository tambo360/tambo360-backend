import { TipoMerma, TipoRodeo } from "@prisma/client";

export const formatDate = (date: Date): string => {
    const fecha = new Date(date);
    const soloFecha = fecha.toISOString().split('T')[0];

    return soloFecha;
}




export const TipoMermaMetadata: Record<TipoMerma,{label: string;}> = {
    MASTITIS: {
        label: "Mastitis",
    },
    ESTRES_CALORICO: {
        label: "Estrés calórico",
    },
    DERRAME_EN_ORDENE: {
        label: "Derrame en ordeñe",
    },
    FALLA_EQUIPO: {
        label: "Falla de equipo",
    },
    RECHAZO_ANTIBIOTICOS: {
        label: "Rechazo por antibióticos",
    },
    ACIDOSIS_RUMINAL: {
        label: "Acidosis ruminal",
    },
    PERDIDA_EN_TRANSPORTE: {
        label: "Pérdida en transporte",
    },
    VENCIMIENTO_PRODUCTO: {
        label: "Vencimiento de producto",
    },

    DANO_POR_MANIPULACION: {
        label: "Daño por manipulación",
    },
    DISCREPANCIA_INVENTARIO: {
        label: "Discrepancia de inventario",
    },
    MERMA_DESCONOCIDA: {
        label: "Merma desconocida",
    },
    OTRO: {
        label: "Otro",
    },
};

export const TipoRodeoMetaData: Record<TipoRodeo, {label: string, value: string}> = {
    [TipoRodeo.ALTA_PRODUCCION]: {
        label: "Rodeo Alta Producción",
        value: TipoRodeo.ALTA_PRODUCCION
    },
    [TipoRodeo.BAJA_PRODUCCION]: {
        label: "Rodeo Baja Producción",
        value: TipoRodeo.BAJA_PRODUCCION
    },
    [TipoRodeo.VACAS_SECAS]: {
        label: "Vacas Secas (Preparto)",
        value: TipoRodeo.VACAS_SECAS
    }
};

export const UUIDS = {
  establishment: '550e8400-e29b-41d4-a716-446655440000',
  raza: '550e8400-e29b-41d4-a716-446655440001',
  producto: '550e8400-e29b-41d4-a716-446655440002',
};


export const obtenerTurno = (fechaProduccion: Date): "mañana" | "tarde" => {
  const hora = fechaProduccion.getHours();
  // Definimos mañana hasta las 12:59, tarde desde las 13:00
  return hora < 13 ? "mañana" : "tarde";
}