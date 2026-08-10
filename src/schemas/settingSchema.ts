import { z } from "zod";

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

export type TransferenciaRodeo = z.infer<typeof transferenciaRodeoSchema>;