import { z } from "zod";
import { TipoMerma } from "@prisma/client";

export const crearMermaSchema = z.object({
    id_lote: z.string().uuid("ID de lote inválido"),
    tipoMerma: z.nativeEnum(TipoMerma, { message: "Tipo de merma inválido" }),
    cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
    observaciones: z.string().max(500).optional(),
});

export const actualizarMermaSchema = z.object({
    tipoMerma: z.nativeEnum(TipoMerma).optional(),
    cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0").optional(),
    observaciones: z.string().max(500).optional(),
});