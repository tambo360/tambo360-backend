import { MotivoMovimientoAnimal, Razas, TipoMerma, TipoRodeo, CausaMovimientoAnimal, EstadoSanitarioAnimal, CategoriaAnimal, TipoMovimientoAnimal } from "@prisma/client";
import { MotivoMovimientoAnimalTransferencia } from "../types";

export const formatDate = (date: Date): string => {
    const fecha = new Date(date);
    const soloFecha = fecha.toISOString().split('T')[0];

    return soloFecha;
}

export const normalizarMotivo = (motivo: MotivoMovimientoAnimal): string => {
    const sinPrefijo = motivo.split("_").slice(1).join(" ");
    return sinPrefijo
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
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

export const EstadoSanitarioAnimalMetaData: Record<EstadoSanitarioAnimal, { label: string, value: string }> = {
    [EstadoSanitarioAnimal.ENFERMEDAD_GENERAL]: {
        label: "Enfermedad General",
        value: EstadoSanitarioAnimal.ENFERMEDAD_GENERAL
    },
    [EstadoSanitarioAnimal.MASTITIS]: {
        label: "Mastitis",
        value: EstadoSanitarioAnimal.MASTITIS
    },
    [EstadoSanitarioAnimal.PREPARTO]: {
        label: "Preparto",
        value: EstadoSanitarioAnimal.PREPARTO
    },
    [EstadoSanitarioAnimal.PROBLEMA_PODAL]: {
        label: "Problema Podal",
        value: EstadoSanitarioAnimal.PROBLEMA_PODAL
    },
    [EstadoSanitarioAnimal.PROBLEMA_UTERINO]: {
        label: "Problema Uterino",
        value: EstadoSanitarioAnimal.PROBLEMA_UTERINO
    },
    [EstadoSanitarioAnimal.SANO]: {
        label: "Sano",
        value: EstadoSanitarioAnimal.SANO
    }
}


export const CategoriaAnimalMetaData: Record<CategoriaAnimal, { label: string, value: string }> = {
    [CategoriaAnimal.ORDENE]: {
        label: "Ordeñe",
        value: CategoriaAnimal.ORDENE
    },
    [CategoriaAnimal.SECAS]: {
        label: "Secas",
        value: CategoriaAnimal.SECAS
    }
}

export const MotivosPorTipoMetaData: Record<TipoMovimientoAnimal, { label: string, value: string }[]> = {
    [TipoMovimientoAnimal.INGRESO]: [
        {
            label: normalizarMotivo(MotivoMovimientoAnimal.INGRESO_COMPRA),
            value: MotivoMovimientoAnimal.INGRESO_COMPRA
        },
        {
            label: normalizarMotivo(MotivoMovimientoAnimal.INGRESO_NACIMIENTO),
            value: MotivoMovimientoAnimal.INGRESO_NACIMIENTO
        }
    ],
    [TipoMovimientoAnimal.EGRESO]: [
        {
            label: normalizarMotivo(MotivoMovimientoAnimal.EGRESO_DESCARTE),
            value: MotivoMovimientoAnimal.EGRESO_DESCARTE
        },
        {
            label: normalizarMotivo(MotivoMovimientoAnimal.EGRESO_MUERTE),
            value: MotivoMovimientoAnimal.EGRESO_MUERTE
        },
        {
            label: normalizarMotivo(MotivoMovimientoAnimal.EGRESO_VENTA),
            value: MotivoMovimientoAnimal.EGRESO_VENTA
        }
    ],
    [TipoMovimientoAnimal.TRANSFERENCIA]: [
        {
            label: normalizarMotivo(MotivoMovimientoAnimal.TRANSFERENCIA_CICLO_PRODUCTIVO),
            value: MotivoMovimientoAnimal.TRANSFERENCIA_CICLO_PRODUCTIVO
        },
        {
            label: normalizarMotivo(MotivoMovimientoAnimal.TRANSFERENCIA_RECUPERACION),
            value: MotivoMovimientoAnimal.TRANSFERENCIA_RECUPERACION
        },
        {
            label: normalizarMotivo(MotivoMovimientoAnimal.TRANSFERENCIA_SANITARIA),
            value: MotivoMovimientoAnimal.TRANSFERENCIA_SANITARIA
        }

    ],
}

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



export const estadoPorCausa: Record<CausaMovimientoAnimal, EstadoSanitarioAnimal> = {
    [CausaMovimientoAnimal.MASTITIS]:
        EstadoSanitarioAnimal.MASTITIS,

    [CausaMovimientoAnimal.PROBLEMA_PODAL]:
        EstadoSanitarioAnimal.PROBLEMA_PODAL,

    [CausaMovimientoAnimal.PROBLEMA_UTERINO]:
        EstadoSanitarioAnimal.PROBLEMA_UTERINO,

    [CausaMovimientoAnimal.ENFERMEDAD_GENERAL]:
        EstadoSanitarioAnimal.ENFERMEDAD_GENERAL,

    [CausaMovimientoAnimal.SECADA_PROGRAMADA]:
        EstadoSanitarioAnimal.PREPARTO,

    [CausaMovimientoAnimal.PARTO]:
        EstadoSanitarioAnimal.SANO,

    [CausaMovimientoAnimal.ABORTO]:
        EstadoSanitarioAnimal.SANO,

    [CausaMovimientoAnimal.ALTA_MEDICA]:
        EstadoSanitarioAnimal.SANO,
};


export const estadoTratamientoPorEstado = (
    estado: EstadoSanitarioAnimal
): "Sana" | "En Tratamiento" => {
    const estadosEnTratamiento: EstadoSanitarioAnimal[] = [
        EstadoSanitarioAnimal.MASTITIS,
        EstadoSanitarioAnimal.PROBLEMA_PODAL,
        EstadoSanitarioAnimal.PROBLEMA_UTERINO,
        EstadoSanitarioAnimal.ENFERMEDAD_GENERAL,
    ];

    return estadosEnTratamiento.includes(estado) ? "En Tratamiento" : "Sana";
};


export const motivosPorTipo = {
    [TipoMovimientoAnimal.INGRESO]: [
        MotivoMovimientoAnimal.INGRESO_COMPRA,
        MotivoMovimientoAnimal.INGRESO_NACIMIENTO,
    ],

    [TipoMovimientoAnimal.EGRESO]: [
        MotivoMovimientoAnimal.EGRESO_VENTA,
        MotivoMovimientoAnimal.EGRESO_MUERTE,
        MotivoMovimientoAnimal.EGRESO_DESCARTE
    ],

    [TipoMovimientoAnimal.TRANSFERENCIA]: [
        MotivoMovimientoAnimal.TRANSFERENCIA_CICLO_PRODUCTIVO,
        MotivoMovimientoAnimal.TRANSFERENCIA_RECUPERACION,
        MotivoMovimientoAnimal.TRANSFERENCIA_SANITARIA
    ],
} as const;

export const causasPorMotivo: Record<MotivoMovimientoAnimalTransferencia, CausaMovimientoAnimal[]> = {
    [MotivoMovimientoAnimal.TRANSFERENCIA_SANITARIA]: [
        CausaMovimientoAnimal.MASTITIS,
        CausaMovimientoAnimal.PROBLEMA_PODAL,
        CausaMovimientoAnimal.PROBLEMA_UTERINO,
        CausaMovimientoAnimal.ENFERMEDAD_GENERAL,
    ],
    [MotivoMovimientoAnimal.TRANSFERENCIA_CICLO_PRODUCTIVO]: [
        CausaMovimientoAnimal.SECADA_PROGRAMADA,
        CausaMovimientoAnimal.PARTO,
        CausaMovimientoAnimal.ABORTO,
    ],
    [MotivoMovimientoAnimal.TRANSFERENCIA_RECUPERACION]: [
        CausaMovimientoAnimal.ALTA_MEDICA,
    ],
};