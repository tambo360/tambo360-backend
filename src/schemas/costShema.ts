import { z } from "zod";
import { ConceptoCosto } from "@prisma/client";

const conceptoEnumValues = Object.values(ConceptoCosto);

export const crearCostoSchema = z.object({
    loteId: z.string().uuid("loteId inválido"),

    concepto: z
        .string()
        .refine(
            (val) => conceptoEnumValues.includes(val as ConceptoCosto),
            { message: "El concepto debe ser uno de: insumos_basicos, leche_cruda, cuajo_y_fermentos, refrigeracion" }
        ) as z.ZodType<ConceptoCosto>,

    monto: z.coerce
        .number()
        .positive("El monto debe ser mayor a cero")
        .max(999_999_999, "El monto no puede superar 999.999.999")
        .transform((val) => Number(val.toFixed(2))),

    observaciones: z
        .string()
        .max(500, "Observaciones demasiado largas")
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Observaciones no puede contener solo espacios",
        }),
});

export const actualizarCostoSchema = z.object({

    concepto: (
        z
            .string()
            .refine(
                (val) => conceptoEnumValues.includes(val as ConceptoCosto),
                { message: "El concepto debe ser uno de: insumos_basicos, leche_cruda, cuajo_y_fermentos, refrigeracion" }
            ) as z.ZodType<ConceptoCosto>
    ).optional(),

    monto: z.coerce
        .number()
        .positive("El monto debe ser mayor a cero")
        .max(999_999_999, "El monto no puede superar 999.999.999")
        .transform((val) => Number(val.toFixed(2))).optional(),

    observaciones: z
        .string()
        .max(500, "Observaciones demasiado largas")
        .optional()
        .refine((val) => !val || val.trim().length > 0, {
            message: "Observaciones no puede contener solo espacios",
        }).optional(),
});

export const idParamSchema = z.object({
    id: z.string().uuid("ID inválido"),
});

export const loteParamSchema = z.object({
    loteId: z.string().uuid("loteId inválido"),
});


export type CrearCostoDTO = z.infer<typeof crearCostoSchema>;
export type ActualizarCostoDTO = z.infer<typeof actualizarCostoSchema>;