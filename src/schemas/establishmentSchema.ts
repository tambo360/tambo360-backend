import { z } from "zod";

const requiredString = (message: string) =>
    z
        .string()
        .trim()
        .min(2, { message })
        .max(100, { message: "No puede superar los 100 caracteres" });

export const createEstablishmentSchema = z.object({
    nombre: requiredString("El nombre es obligatorio"),
    localidad: requiredString("La localidad es obligatoria"),
    provincia: requiredString("La provincia es obligatoria"),
});

export const updateEstablishmentNameSchema = z.object({
    nombre: requiredString("El nombre es obligatorio"),
});

export type CreateEstablishmentData = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentNameData = z.infer<typeof updateEstablishmentNameSchema>;