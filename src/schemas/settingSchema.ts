import { z } from "zod";
import { TipoMovimientoAnimal, TipoSeguimiento } from "@prisma/client";
import { AnimalSchema } from "./establishmentSchema"
export const motivosPorTipo = {
    INGRESO: [
        "INGRESO_COMPRA",
        "INGRESO_NACIMIENTO",
    ],

    EGRESO: [
        "EGRESO_VENTA",
        "EGRESO_DESCARTE",
        "EGRESO_MUERTE"
    ],

    TRANSFERENCIA: [
        "TRANSFERENCIA_BAJA_PRODUCCION",
        "TRANSFERENCIA_ALTA_PRODUCCION",
        "TRANSFERENCIA_SECADO",
        "TRANSFERENCIA_CAMBIO_ESTADO",
        "TRANSFERENCIA_OTRO"
    ],
} as const;

const motivoSchema = z.enum([
    ...motivosPorTipo.INGRESO,
    ...motivosPorTipo.EGRESO,
    ...motivosPorTipo.TRANSFERENCIA
], "Motivo inválido");

export const transferenciaRodeoSchema = z.object({
    rodeoOrigen: z.string().uuid("Id de rodeo origen inválido"),
    rodeoDestino: z.string().uuid("Id de rodeo destino inválido"),
    motivo: z.enum(motivosPorTipo.TRANSFERENCIA, "Motivo de transferencia inválido"),
    cantidad: z.number().int().positive("La cantidad debe ser un número entero positivo"),
    observacion: z.string().max(255, "El detalle del motivo no puede superar los 255 caracteres").optional(),
})

const altaAnimalBaseSchema = z.object({
    cantidad: z.number().int().positive("La cantidad debe ser un número entero positivo"),
    observacion: z.string().max(255, "El detalle del motivo no puede superar los 255 caracteres").optional(),
    tipo: z.enum([TipoMovimientoAnimal.INGRESO], "Tipo de movimiento inválido"),
    motivo: z.enum(motivosPorTipo.INGRESO, "Motivo de ingreso inválido"),
})

const altaAnimalRodeoSchema = altaAnimalBaseSchema.extend({
    tipoSeguimiento: z.enum([TipoSeguimiento.RODEO, TipoSeguimiento.RODEO_UNICO], "Tipo de seguimiento inválido"),
    rodeoDestino: z.string().uuid("Id de rodeo destino inválido"),
    costoRacion: z.number().positive("El costo de ración debe ser un número positivo").optional(),
})


const altaAnimalIndividualSchema = altaAnimalBaseSchema.extend({
    tipoSeguimiento: z.enum([TipoSeguimiento.INDIVIDUAL], "Tipo de seguimiento inválido"),
    animales: z.array(AnimalSchema).min(1, {message: "Debe existir al menos un animal",}),
})


export const altaAnimalSchema = z.discriminatedUnion(
    "tipoSeguimiento",
    [
        altaAnimalRodeoSchema,
        altaAnimalIndividualSchema
    ]
);

export type TransferenciaRodeo = z.infer<typeof transferenciaRodeoSchema>;

export type AltaAnimal = z.infer<typeof altaAnimalSchema>;
export type AltaAnimalRodeo = z.infer<typeof altaAnimalRodeoSchema>;
export type AltaAnimalIndividual = z.infer<typeof altaAnimalIndividualSchema>;