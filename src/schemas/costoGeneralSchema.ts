import { z } from "zod";

import { TipoCostoGeneral } from "@prisma/client";

export const MAX_DIAS_ATRAS_GASTO = 7;

const ZONA_HORARIA = "America/Argentina/Buenos_Aires";
const MS_POR_DIA = 24 * 60 * 60 * 1000;

// Número de día (días desde 1970) que le corresponde a una fecha en la zona dada.
function numeroDeDia(fecha: Date, zona: string): number {
    const [anio, mes, dia] = fecha
        .toLocaleDateString("en-CA", { timeZone: zona })
        .split("-")
        .map(Number);

    return Date.UTC(anio, mes - 1, dia) / MS_POR_DIA;
}

// El front manda el día elegido como medianoche UTC (ej. 2026-11-05T00:00:00.000Z).
// En Argentina esa hora cae en el día anterior, así que en ese caso se toma el día tal cual.
function diaDelGasto(fecha: Date): number {
    const esMedianocheUTC = fecha.getTime() % MS_POR_DIA === 0;

    return numeroDeDia(fecha, esMedianocheUTC ? "UTC" : ZONA_HORARIA);
}

// Devuelve el mensaje de error, o null si la fecha es válida.
export function validarFechaGasto(fecha: Date, ahora: Date = new Date()): string | null {
    const hoy = numeroDeDia(ahora, ZONA_HORARIA);
    const dia = diaDelGasto(fecha);

    if (dia > hoy) {
        return "La fecha del gasto no puede ser futura";
    }

    if (dia < hoy - MAX_DIAS_ATRAS_GASTO) {
        return `La fecha del gasto no puede ser anterior a ${MAX_DIAS_ATRAS_GASTO} días`;
    }

    return null;
}


export const crearCostoGeneralSchema = z.object({

    tipoCosto: z.nativeEnum(TipoCostoGeneral, {
        message: "Tipo de costo inválido"
    }),

    descripcion: z.string().max(100, "La descripción no puede superar los 100 caracteres").optional(),

    monto: z.coerce.number().positive(
        "El monto debe ser mayor a 0"
    ),

    fecha: z.coerce.date({
        message: "Fecha inválida"
    }).superRefine((fecha, ctx) => {
        const error = validarFechaGasto(fecha);

        if (error) {
            ctx.addIssue({ code: "custom", message: error });
        }
    }),

});

export const actualizarCostoGeneralSchema = z.object({

    tipoCosto: z.nativeEnum(TipoCostoGeneral).optional(),

    descripcion: z.string().max(100, "La descripción no puede superar los 100 caracteres").optional(),

    monto: z.coerce.number().positive(
        "El monto debe ser mayor a 0"
    ).optional(),

    fecha: z.coerce.date().optional(),

});

// =====================================================
// Listado de Costos Generales
//
// Permite:
// - Filtrar por período
// - Filtrar por tipo de costo
// - Ordenar por fecha o monto
// - Orden ascendente o descendente
// - Paginar resultados
// =====================================================

export const listarCostosGeneralesSchema = z.object({

    fechaDesde: z.coerce.date({
        message: "fechaDesde inválida"
    }).optional(),

    fechaHasta: z.coerce.date({
        message: "fechaHasta inválida"
    }).optional(),

    tipoCosto: z.nativeEnum(TipoCostoGeneral, {
        message: "Tipo de costo inválido"
    }).optional(),

    ordenarPor: z.enum(["fecha", "monto"]).optional(),

    orden: z.enum(["asc", "desc"]).optional(),

    page: z.coerce.number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce.number()
        .int()
        .positive()
        .default(20),

}).refine(
    (data) =>
        !data.fechaDesde ||
        !data.fechaHasta ||
        data.fechaDesde <= data.fechaHasta,
    {
        message: "fechaDesde no puede ser posterior a fechaHasta",
        path: ["fechaDesde"],
    }
);

// =====================================================
// Resumen Económico
//
// Valida el período recibido por query params en
// GET /resumen.
//
// Ambas fechas son obligatorias.
// =====================================================

export const resumenEconomicoQuerySchema = z.object({

    fechaDesde: z.coerce.date({
        message: "fechaDesde inválida"
    }),

    fechaHasta: z.coerce.date({
        message: "fechaHasta inválida"
    }),

}).refine(
    (data) => data.fechaDesde <= data.fechaHasta,
    {
        message: "fechaDesde no puede ser posterior a fechaHasta",
        path: ["fechaDesde"],
    }
);