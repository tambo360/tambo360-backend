import { z } from "zod";

import { TipoCostoGeneral } from "@prisma/client";

export const crearCostoGeneralSchema = z.object({

    tipoCosto: z.nativeEnum(TipoCostoGeneral, {
        message: "Tipo de costo inválido"
    }),

    descripcion: z.string().max(500).optional(),

    monto: z.coerce.number().positive(
        "El monto debe ser mayor a 0"
    ),

    fecha: z.coerce.date({
        message: "Fecha inválida"
    }),

});

export const actualizarCostoGeneralSchema = z.object({

    tipoCosto: z.nativeEnum(TipoCostoGeneral).optional(),

    descripcion: z.string().max(500).optional(),

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
        .default(10),

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