import { TipoOrdenie, VentaLeche } from "@prisma/client";
import { z } from "zod";

const requiredString = (message: string) =>
    z
        .string()
        .trim()
        .min(2, { message })
        .max(100, { message: "No puede superar los 100 caracteres" });

export const createEstablishmentSchema = z.object({
    nombre: requiredString("El nombre es obligatorio"),
});

export const updateEstablishmentNameSchema = z.object({
    nombre: requiredString("El nombre es obligatorio"),
});


export const questionnaireSchema = z.object({
    idEstablecimiento: z.string().uuid("ID de establecimiento no válido"),
    cantidadVacas: z.number().int().positive("La cantidad de vacas debe ser un número entero positivo"),
    Razas: z.array(z.object({
        idRaza: z.string().uuid("ID de raza no válido"),
        nombre: requiredString("El nombre de la raza es obligatorio"),
    })).min(1, "Debe haber al menos una raza"),
    cantOrdenie: z.number().int().positive("La cantidad de ordeñe debe ser un número entero positivo"),
    tipoOrdenie: z.enum(TipoOrdenie, "El tipo de ordeñe debe ser un valor válido"),
    promLitros: z.number().positive("El promedio de litros debe ser un número positivo"),
    ventaLeche: z.enum(VentaLeche, "El tipo de venta de leche debe ser un valor válido"),
    empleados: z.boolean("Debe indicar si tiene empleados o no"),
    cantEmpleados: z.number().int().positive("La cantidad de empleados debe ser un número entero positivo").optional(),
    ubicacion: z.object({
        provincia: requiredString("La provincia es obligatoria"),
        localidad: requiredString("La localidad es obligatoria"),
    }),
})

export type CreateEstablishmentData = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentNameData = z.infer<typeof updateEstablishmentNameSchema>;
export type QuestionnaireData = z.infer<typeof questionnaireSchema>;