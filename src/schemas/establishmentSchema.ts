import { Categoria, TipoOrdenie, VentaLeche, TipoRodeo, TipoSeguimiento, CategoriaAnimal, EstadoSanitarioAnimal, Razas } from "@prisma/client";
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
    tipo: z.literal("existente", "El tipo de producto debe ser 'existente'"),
    idProducto: z.string("El ID del producto es obligatorio").uuid("ID de producto no válido"),
    nombre: requiredString("El nombre del producto es obligatorio"),
})

const newProductsSchema = z.object({
    tipo: z.literal("nuevo", "El tipo de producto debe ser 'nuevo'"),
    nombre: requiredString("El nombre del producto es obligatorio"),
    categoria: z.enum(Categoria, "La categoría del producto debe ser un valor válido"),
})

const productSchema = z.discriminatedUnion("tipo", [
    existingProductsSchema,
    newProductsSchema
])


const RodeoSchema = z.object({
    tipoRodeo: z.enum(TipoRodeo, "El tipo de rodeo debe ser un valor válido"),
    cantVacas: z.number("La cantidad de vacas es obligatoria").int("La cantidad de vacas debe ser un número entero").positive("La cantidad de vacas debe ser un número entero positivo"),
    costoRacion: z.number("El costo de la ración es obligatorio").positive("El costo de la ración debe ser un número positivo"),
    razas: z.array(z.object({
        raza: z.enum(Razas, "La raza del animal debe ser un valor válido"),
        cantVacas: z.number("La cantidad de animales es obligatoria").int("La cantidad de animales debe ser un número entero").positive("La cantidad de animales debe ser un número entero positivo")
    })).min(1, { message: "Debe existir al menos una raza" })
})

export const AnimalSchema = z.object({
    codigo: z.string().optional(),
    nombre: z.string().optional(),
    categoria: z.enum(CategoriaAnimal, "La categoría del animal debe ser un valor válido"),
    estado: z.enum(EstadoSanitarioAnimal, "El estado del animal debe ser un valor válido"),
    fechaNacimiento: z.string().transform(val => new Date(val)).optional(),
    observacion: z.string().optional(),
    fechaParto: z.string().transform(val => new Date(val)).optional(),
    raza: z.enum(Razas, "La raza del animal debe ser un valor válido")
}).refine((data) => {
    return !!data.codigo || !!data.nombre;
}, {
    message: "Debe proporcionar al menos un código o un nombre para el animal",
})
.refine((data) => {
    if (data.categoria === "ORDENE" && data.estado !== "SANO") {
        return false;
    }
    return true;
}, {
    message: "Un animal de categoría ordeñe solo puede tener estado sano",
});

const questionnaireBaseSchema = z.object({
    idEstablecimiento: z.string("El ID del establecimiento es obligatorio").uuid("ID de establecimiento no válido"),
    productos: z.array(productSchema).optional(),
    cantVacas: z.number("La cantidad de vacas es obligatoria").int("La cantidad de vacas debe ser un número entero").positive("La cantidad de vacas debe ser un número entero positivo"),
    cantOrdenie: z.number("La cantidad de ordeñe es obligatoria").int("La cantidad de ordeñe debe ser un número entero").positive("La cantidad de ordeñe debe ser un número entero positivo"),
    tipoOrdenie: z.enum(TipoOrdenie, "El tipo de ordeñe debe ser un valor válido"),
    promDEL: z.number("El promedio de DEL es obligatorio").positive("El promedio de DEL debe ser un número positivo"),
    promLitros: z.number("El promedio de litros es obligatorio").positive("El promedio de litros debe ser un número positivo"),
    ventaLeche: z.enum(VentaLeche, "El tipo de venta de leche debe ser un valor válido"),
    precioLitro: z.number("El precio por litro es obligatorio").positive("El precio por litro debe ser un número positivo"),
    ubicacion: z.object({
        provincia: requiredString("La provincia es obligatoria"),
        localidad: requiredString("La localidad es obligatoria"),
    }),
});

const questionnaireRodeoSchema = questionnaireBaseSchema.extend({
    TipoSeguimiento: z.literal(TipoSeguimiento.RODEO, "El tipo de seguimiento debe ser un valor válido"),
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
    TipoSeguimiento: z.literal(TipoSeguimiento.RODEO_UNICO, "El tipo de seguimiento debe ser un valor válido"),
    rodeos: z.array(RodeoSchema)
        .refine((rodeos) => {
            const tiposPresentes = new Set(
                rodeos.map(r => r.tipoRodeo)
            );
            const tiposRequeridos = [
                TipoRodeo.UNICO_ORDENIE,
                TipoRodeo.UNICO_SECA
            ];
            return tiposRequeridos.every(tipo => tiposPresentes.has(tipo));
        }, {
            message: "Debe existir al menos un rodeo de cada tipo",
        }),
    animales: z.undefined(),
});

const questionnaireIndividualSchema = questionnaireBaseSchema.extend({
    TipoSeguimiento: z.literal(TipoSeguimiento.INDIVIDUAL, "El tipo de seguimiento debe ser un valor válido"),
    animales: z.array(AnimalSchema).min(1, { message: "Debe existir al menos un animal", }),
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
    correo: z.string("El correo electrónico es obligatorio").email("Correo electrónico no válido"),
    rol: z.enum(["ADMIN", "EMPLOYEE"], "El rol no es válido")
});

export const deleteInvitationSchema = z.object({
    idInvitacion: z.string("El ID de invitación es obligatorio").uuid("ID de invitación no válido")
});

export type sendInvitationSchemaInput = z.infer<typeof sendInvitationSchema>;
export type DeleteInvitationInput = z.infer<typeof deleteInvitationSchema>;


export type CreateEstablishmentData = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentNameData = z.infer<typeof updateEstablishmentNameSchema>;
export type QuestionnaireData = z.infer<typeof questionnaireSchema>;