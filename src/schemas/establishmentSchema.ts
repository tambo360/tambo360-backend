import { Categoria, TipoOrdenie, VentaLeche, TipoRodeo, TipoSeguimiento, CategoriaAnimal, EstadoAnimal } from "@prisma/client";
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


const RodeoSchema = z.object({
    tipoRodeo: z.enum(TipoRodeo, "El tipo de rodeo debe ser un valor válido"),
    cantVacas: z.number().int().positive("La cantidad de vacas debe ser un número entero positivo"),
    costoRacion: z.number().positive("El costo de la ración debe ser un número positivo"),
})

const AnimalSchema = z.object({
    codigo: z.string().optional(),
    nombre: z.string().optional(),
    categoria: z.enum(CategoriaAnimal, "La categoría del animal debe ser un valor válido"),
    estado: z.enum(EstadoAnimal, "El estado del animal debe ser un valor válido"),
    fechaNacimiento: z.date().optional(),
}).refine((data) => {
    return !!data.codigo || !!data.nombre;
}, {
    message: "Debe proporcionar al menos un código o un nombre para el animal",
})

const questionnaireBaseSchema = z.object({
    idEstablecimiento: z.string().uuid("ID de establecimiento no válido"),
    productos: z.array(productSchema).optional(),
    cantVacas: z.number().int().positive("La cantidad de vacas debe ser un número entero positivo"),
    cantOrdenie: z.number().int().positive("La cantidad de ordeñe debe ser un número entero positivo"),
    tipoOrdenie: z.enum(TipoOrdenie,"El tipo de ordeñe debe ser un valor válido"),
    promLitros: z.number().positive("El promedio de litros debe ser un número positivo"),
    ventaLeche: z.enum(VentaLeche,"El tipo de venta de leche debe ser un valor válido"),
    empleados: z.boolean("Debe indicar si tiene empleados o no"),
    cantEmpleados: z.number().int().positive("La cantidad de empleados debe ser un número entero positivo").optional(),
    ubicacion: z.object({
        provincia: requiredString("La provincia es obligatoria"),
        localidad: requiredString("La localidad es obligatoria"),
    }),
});

const questionnaireRodeoSchema = questionnaireBaseSchema.extend({
    TipoSeguimiento: z.literal(TipoSeguimiento.RODEO),
    rodeos: z.array(RodeoSchema)
        .refine((rodeos) => {
            const tiposPresentes = new Set(
                rodeos.map(r => r.tipoRodeo)
            );
            const tiposRequeridos = [
                TipoRodeo.ALTA_PRODUCCION,
                TipoRodeo.BAJA_PRODUCCION,
                TipoRodeo.VACAS_SECAS,
            ];
            return tiposRequeridos.every(tipo => tiposPresentes.has(tipo));
        }, {
            message: "Debe existir al menos un rodeo de cada tipo",
        }),
    animales: z.undefined(),
});

const questionnaireRodeoUnicoSchema = questionnaireBaseSchema.extend({
    TipoSeguimiento: z.literal(TipoSeguimiento.RODEO_UNICO),
    rodeos: z.array(RodeoSchema).length(1, {message: "Debe existir un único rodeo",})
        .refine((rodeos) => {
            return rodeos[0]?.tipoRodeo === TipoRodeo.UNICO;
        }, { message: "El rodeo debe ser de tipo único"}),
    animales: z.undefined(),
});

const questionnaireIndividualSchema = questionnaireBaseSchema.extend({
    TipoSeguimiento: z.literal(TipoSeguimiento.INDIVIDUAL),
    animales: z.array(AnimalSchema).min(1, {message: "Debe existir al menos un animal",}),
    rodeos: z.undefined(),
});

export const questionnaireSchema = z.discriminatedUnion(
    "TipoSeguimiento",
    [
        questionnaireRodeoSchema,
        questionnaireRodeoUnicoSchema,
        questionnaireIndividualSchema,
    ]
);


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