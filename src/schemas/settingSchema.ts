import { z } from "zod";
import { TipoMovimientoAnimal, TipoSeguimiento, TipoOrdenie, EstadoSanitarioAnimal, CausaMovimientoAnimal, Razas, CategoriaAnimal } from "@prisma/client";
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
        "TRANSFERENCIA_SANITARIA",
        "TRANSFERENCIA_CICLO_PRODUCTIVO",
        "TRANSFERENCIA_RECUPERACION"
    ],
} as const;

const motivoSchema = z.enum([
    ...motivosPorTipo.INGRESO,
    ...motivosPorTipo.EGRESO,
    ...motivosPorTipo.TRANSFERENCIA
], "Motivo inválido");

export const causasPorMotivo = {
    TRANSFERENCIA_SANITARIA: [
        "MASTITIS",
        "PROBLEMA_PODAL",
        "PROBLEMA_UTERINO",
        "ENFERMEDAD_GENERAL",
    ],
    TRANSFERENCIA_CICLO_PRODUCTIVO: [
        "SECADA_PROGRAMADA",
        "PARTO",
        "ABORTO",
    ],
    TRANSFERENCIA_RECUPERACION: [
        "ALTA_MEDICA",
    ],
}




const transferenciaBaseSchema = z.object({
    tipo: z.enum([TipoMovimientoAnimal.TRANSFERENCIA]),
    motivo: z.enum(motivosPorTipo.TRANSFERENCIA, "Motivo de transferencia inválido"),
    causa: z.enum(CausaMovimientoAnimal, "Causa de transferencia inválida"),
    retorno: z.date().optional(),
    observacion: z.string().max(255).optional(),
}).superRefine((data, ctx) => {
    const causasPermitidas = causasPorMotivo[data.motivo];

    if (!causasPermitidas.includes(data.causa)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["causa"],
            message: "La causa no corresponde al motivo seleccionado",
        });
    }
});

const transferenciaRodeoSchema = transferenciaBaseSchema.extend({
    tipoSeguimiento: z.enum([TipoSeguimiento.RODEO, TipoSeguimiento.RODEO_UNICO], "Tipo de seguimiento inválido"),
    origen: z.string().uuid("Id de rodeo origen inválido"),
    destino: z.string().uuid("Id de rodeo destino inválido"),
    animal: z.object({
        raza: z.uuid("Id de raza inválido"),
        cantVacas: z.number("La cantidad de animales es obligatoria").int("La cantidad de animales debe ser un número entero").positive("La cantidad de animales debe ser un número entero positivo")
    })
}).refine((data) => data.origen !== data.destino, {
    message: "El origen y destino no pueden ser iguales",
})

const transferenciaAnimalSchema = transferenciaBaseSchema.extend({
    tipoSeguimiento: z.enum([TipoSeguimiento.INDIVIDUAL], "Tipo de seguimiento inválido"),
    origen: z.enum(CategoriaAnimal, "Categoría de animal inválida"),
    destino: z.enum(CategoriaAnimal, "Categoría de animal inválida"),
    animal: z.uuid("Id de animal inválido"),
}).refine((data) => data.origen !== data.destino, {
    message: "El origen y destino no pueden ser iguales",
})


export const transferenciaSchema = z.discriminatedUnion(
    "tipoSeguimiento",
    [
        transferenciaRodeoSchema,
        transferenciaAnimalSchema
    ]
);


const altaAnimalBaseSchema = z.object({
    observacion: z.string().max(255, "El detalle del motivo no puede superar los 255 caracteres").optional(),
    tipo: z.enum([TipoMovimientoAnimal.INGRESO], "Tipo de movimiento inválido"),
    motivo: z.enum(motivosPorTipo.INGRESO, "Motivo de ingreso inválido"),
})

const altaAnimalRodeoSchema = altaAnimalBaseSchema.extend({
    tipoSeguimiento: z.enum([TipoSeguimiento.RODEO, TipoSeguimiento.RODEO_UNICO], "Tipo de seguimiento inválido"),
    destino: z.string().uuid("Id de rodeo destino inválido"),
    razas: z.array(z.object({
        raza: z.enum(Razas, "La raza del animal debe ser un valor válido"),
        cantVacas: z.number("La cantidad de animales es obligatoria").int("La cantidad de animales debe ser un número entero").positive("La cantidad de animales debe ser un número entero positivo")
    })).min(1, { message: "Debe existir al menos una raza" })
})


const altaAnimalIndividualSchema = altaAnimalBaseSchema.extend({
    tipoSeguimiento: z.enum([TipoSeguimiento.INDIVIDUAL], "Tipo de seguimiento inválido"),
    animales: z.array(AnimalSchema).min(1, { message: "Debe existir al menos un animal", }),
})


export const altaAnimalSchema = z.discriminatedUnion(
    "tipoSeguimiento",
    [
        altaAnimalRodeoSchema,
        altaAnimalIndividualSchema
    ]
);



const bajaAnimalBaseSchema = z.object({
    observacion: z.string().max(255, "El detalle del motivo no puede superar los 255 caracteres").optional(),
    tipo: z.enum([TipoMovimientoAnimal.EGRESO], "Tipo de movimiento inválido"),
    motivo: z.enum(motivosPorTipo.EGRESO, "Motivo de egreso inválido"),
})

const bajaAnimalRodeoSchema = bajaAnimalBaseSchema.extend({
    tipoSeguimiento: z.enum([TipoSeguimiento.RODEO, TipoSeguimiento.RODEO_UNICO], "Tipo de seguimiento inválido"),
    origen: z.string().uuid("Id de rodeo origen inválido"),
    raza: z.object({
        idRaza: z.string().uuid("Id de rodeo origen inválido"),
        raza: z.enum(Razas, "La raza del animal debe ser un valor válido"),
        cantVacas: z.number("La cantidad de animales es obligatoria").int("La cantidad de animales debe ser un número entero").positive("La cantidad de animales debe ser un número entero positivo")
    })
})

const bajaAnimalIndividualSchema = bajaAnimalBaseSchema.extend({
    tipoSeguimiento: z.enum([TipoSeguimiento.INDIVIDUAL], "Tipo de seguimiento inválido"),
    animal: z.uuid("Id de animal inválido")
})

export const bajaAnimalSchema = z.discriminatedUnion(
    "tipoSeguimiento",
    [
        bajaAnimalRodeoSchema,
        bajaAnimalIndividualSchema
    ]
);


export const listarAnimalesFiltrosSchema = z.object({
    codigo: z.string().optional(),
    nombre: z.string().optional(),
    estado: z.enum(EstadoSanitarioAnimal, "El formato del estado no es válido").optional(),
    orden: z
        .enum(["asc", "desc"], "El orden debe ser 'asc' o 'desc'")
        .optional(),
    page: z
        .string()
        .regex(/^\d+$/, "Página inválida")
        .transform((val) => Number(val))
        .refine((val) => val > 0, "La página debe ser mayor a 0")
        .optional()
        .default(1),
    limit: z
        .string()
        .regex(/^\d+$/, "Límite inválido")
        .transform((val) => Number(val))
        .refine((val) => val > 0, "El límite debe ser mayor a 0")
        .refine((val) => val <= 100, "El límite máximo permitido es 100")
        .optional()
        .default(10),
});

export const actualizarAnimalSchema = z.object({
    id: z.string().uuid("Formato de ID inválido"),
    codigo: z.string().optional(),
    nombre: z.string().optional(),
    observacion: z.string().optional(),
    fechaNacimiento: z.date().optional(),
    fechaParto: z.date().optional()
}).refine((data) => {
    return !!data.codigo || !!data.nombre;
}, {
    message: "Debe proporcionar al menos un código o un nombre para el animal",
})

export const listaMovimientosSchema = z.object({
    idEst: z.string().uuid("Formato de ID inválido")
})



export type BajaAnimal = z.infer<typeof bajaAnimalSchema>;
export type BajaAnimalRodeo = z.infer<typeof bajaAnimalRodeoSchema>;
export type BajaAnimalIndividual = z.infer<typeof bajaAnimalIndividualSchema>;

export type AltaAnimal = z.infer<typeof altaAnimalSchema>;
export type AltaAnimalRodeo = z.infer<typeof altaAnimalRodeoSchema>;
export type AltaAnimalIndividual = z.infer<typeof altaAnimalIndividualSchema>;

export type ListarAnimalesFiltros = z.infer<typeof listarAnimalesFiltrosSchema>
export type ActualizarAnimal = z.infer<typeof actualizarAnimalSchema>

export type Transferencia = z.infer<typeof transferenciaSchema>
export type TransferenciaRodeo = z.infer<typeof transferenciaRodeoSchema>;
export type TransferenciaAnimal = z.infer<typeof transferenciaAnimalSchema>;
//Establecimiento -------------------------------------------------


const requiredString = (message: string) =>
    z
        .string()
        .trim()
        .min(2, { message })
        .max(100, { message: "No puede superar los 100 caracteres" });

export const actualizarEstSchema = z.object({
    idEst: z.string().uuid("ID de establecimiento inválido"),
    nombre: z.string().max(50, "El nombre del establecimiento no puede superar los 50 caracteres"),
    tipo_ordenie: z.enum(TipoOrdenie, "Formato de ordeñe inválido"),
    ordenie_dia: z.number("La cantidad debe ser un número").int("La cantidad deber ser un entero").positive("La cantidad debe ser positiva").max(3, "La cantidad de ordeñes por dia no puede ser mayor a 3"),
    promLitros: z.number().positive("El promedio de litros debe ser un número positivo"),
    ubicacion: z.object({
        provincia: requiredString("La provincia es obligatoria"),
        localidad: requiredString("La localidad es obligatoria"),
    }),
})

export type ActualizarEst = z.infer<typeof actualizarEstSchema>