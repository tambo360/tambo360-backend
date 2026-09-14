import { MotivoMovimientoAnimal, Razas, TipoMerma, TipoRodeo } from "@prisma/client";

export const formatDate = (date: Date): string => {
    const fecha = new Date(date);
    const soloFecha = fecha.toISOString().split('T')[0];

    return soloFecha;
}


export const TipoMermaMetadata: Record<TipoMerma, { label: string; }> = {
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

export const TipoRodeoMetaData: Record<TipoRodeo, { label: string, value: string }> = {
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
    },
    [TipoRodeo.UNICO_ORDENIE]: {
        label: "Rodeo Único de Ordeñe",
        value: TipoRodeo.UNICO_ORDENIE
    },
    [TipoRodeo.UNICO_SECA]: {
        label: "Rodeo Único Seco",
        value: TipoRodeo.UNICO_SECA
    },
};

export const RazasMetaData: Record<Razas, { label: string; value: string }> = {
    [Razas.HOLANDO_ARGENTINO]: {
        label: "Holando Argentino",
        value: Razas.HOLANDO_ARGENTINO,
    },
    [Razas.JERSEY]: {
        label: "Jersey",
        value: Razas.JERSEY,
    },
    [Razas.PARDO_SUIZO]: {
        label: "Pardo Suizo",
        value: Razas.PARDO_SUIZO,
    },
    [Razas.GIR_LECHERO]: {
        label: "Gir Lechero",
        value: Razas.GIR_LECHERO,
    },
    [Razas.HOLANDO_JERSEY_CRUZA]: {
        label: "Holando-Jersey (Cruza)",
        value: Razas.HOLANDO_JERSEY_CRUZA,
    },
    [Razas.AYRSHIRE]: {
        label: "Ayrshire",
        value: Razas.AYRSHIRE,
    },
    [Razas.NORMANDO]: {
        label: "Normando",
        value: Razas.NORMANDO,
    },
    [Razas.BROWN_SWISS]: {
        label: "Brown Swiss",
        value: Razas.BROWN_SWISS,
    },
    [Razas.MONTBELIARDE]: {
        label: "Montbeliarde",
        value: Razas.MONTBELIARDE,
    },
    [Razas.SIMMENTAL_LECHERO]: {
        label: "Simmental Lechero",
        value: Razas.SIMMENTAL_LECHERO,
    },
    [Razas.OTRAS]: {
        label: "Otras Razas",
        value: Razas.OTRAS,
    },
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

export const normalizarMotivo = (motivo: MotivoMovimientoAnimal): string => {
    const sinPrefijo = motivo.split("_").slice(1).join(" ");
    return sinPrefijo
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}