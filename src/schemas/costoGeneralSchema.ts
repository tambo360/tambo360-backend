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