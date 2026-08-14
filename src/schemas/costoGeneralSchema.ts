import { z } from "zod";
import { TipoCostoGeneral } from "@prisma/client";

export const crearCostoGeneralSchema = z.object({
    tipoCosto: z.nativeEnum(TipoCostoGeneral, { message: "Tipo de costo inválido" }),
    descripcion: z.string().max(500).optional(),
    monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
    fecha: z.coerce.date({ message: "Fecha inválida" }),
});

export const actualizarCostoGeneralSchema = z.object({
    tipoCosto: z.nativeEnum(TipoCostoGeneral).optional(),
    descripcion: z.string().max(500).optional(),
    monto: z.coerce.number().positive("El monto debe ser mayor a 0").optional(),
    fecha: z.coerce.date().optional(),
});

// Épica: Costos Generales y Resumen Económico
// Valida el período recibido por query params en GET /resumen.
// Ambas fechas son obligatorias: el resumen no tiene un período
// por defecto, a diferencia de otros módulos (ej. dashboard).
export const resumenEconomicoQuerySchema = z.object({
    fechaDesde: z.coerce.date({ message: "fechaDesde inválida" }),
    fechaHasta: z.coerce.date({ message: "fechaHasta inválida" }),
}).refine((data) => data.fechaDesde <= data.fechaHasta, {
    message: "fechaDesde no puede ser posterior a fechaHasta",
    path: ["fechaDesde"],
});
