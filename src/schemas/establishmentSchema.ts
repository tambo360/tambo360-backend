import {Categoria, TipoOrdenie, VentaLeche } from "@prisma/client";
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


const existingProductsSchema = z.object({
    tipo: z.literal("existente"),
    idProducto: z.string().uuid("ID de producto no válido"),
    nombre: requiredString("El nombre del producto es obligatorio"),
})

const newProductsSchema = z.object({
    tipo: z.literal("nuevo"),
    nombre: requiredString("El nombre del producto es obligatorio"),
    categoria: z.enum(Categoria, "La categoría del producto debe ser un valor válido"),
})

const productSchema = z.discriminatedUnion("tipo", [
    existingProductsSchema,
    newProductsSchema
])


const existingRazasSchema = z.object({
    tipo: z.literal("existente"),
    idRaza: z.string().uuid("ID de raza no válido"),
    nombre: requiredString("El nombre de la raza es obligatorio"),
})

const newRazasSchema = z.object({
    tipo: z.literal("nuevo"),
    nombre: requiredString("El nombre de la raza es obligatorio"),
})

const razaSchema = z.discriminatedUnion("tipo", [
    existingRazasSchema,
    newRazasSchema
])


export const questionnaireSchema = z.object({
    idEstablecimiento: z.string().uuid("ID de establecimiento no válido"),
    cantidadVacas: z.number().int().positive("La cantidad de vacas debe ser un número entero positivo"),
    razas: z.array(razaSchema).optional(),
    productos: z.array(productSchema).optional(),
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

export const sendInvitationSchema = z.object({
    correo: z.string().email("Correo electrónico no válido"),
    rol: z.enum(["ADMIN", "EMPLOYEE"])
});

export const deleteInvitationSchema = z.object({
    idInvitacion: z.string().uuid("ID de invitación no válido")
});

export type sendInvitationSchemaInput = z.infer<typeof sendInvitationSchema>;
export type DeleteInvitationInput = z.infer<typeof deleteInvitationSchema>;


export type CreateEstablishmentData = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentNameData = z.infer<typeof updateEstablishmentNameSchema>;
export type QuestionnaireData = z.infer<typeof questionnaireSchema>;