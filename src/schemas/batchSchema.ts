import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { Unidad, TipoDestino, TipoSeguimiento, EstadoAnimal} from "@prisma/client";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const ZONA_ARG = "America/Argentina/Buenos_Aires";

//Estructura base de un lote, utilizada para crear 
const baseLoteSchema = z.object({
    idLote: z.uuid("Id de lote inválido"),
    tempTanque: z.coerce
        .number()
        .refine((v) => v !== undefined && v !== null, {
            message: "La temperatura del tanque es obligatoria",
        })
        .positive("La temperatura del tanque debe ser mayor a 0"),

    destino: z.enum(TipoDestino, "Destino inválido"),
    idProducto: z
        .string()
        .uuid("Debe seleccionar un producto válido"),
    fechaProduccion: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato inválido, usar dd/mm/aaaa")
        .refine((val) => {
            const hoy = dayjs().tz(ZONA_ARG).startOf("day");

            const fecha = dayjs(val, "DD/MM/YYYY", true).startOf("day");

            if (!fecha.isValid()) return false;

            const hace7Dias = hoy.subtract(7, "day");

            return !fecha.isAfter(hoy) && !fecha.isBefore(hace7Dias);
        }, "La fecha de producción debe estar entre hoy y 7 días anteriores")
        .transform((val) => {
            const ahoraArgentina = dayjs().tz(ZONA_ARG);

            const fechaBase = dayjs(val, "DD/MM/YYYY", true).startOf("day");

            return fechaBase
                .hour(ahoraArgentina.hour())
                .minute(ahoraArgentina.minute())
                .second(ahoraArgentina.second())
                .toDate();
        }),

    estado: z.boolean().optional(),

    unidad: z.enum(Unidad, "Unidad de medida inválida"),
});

// Estructura de un lote con seguimiento por rodeo + Estructura base
const loteRodeoSchema = baseLoteSchema.extend({
    tipoSeguimiento: z.literal(TipoSeguimiento.RODEO),
    idRodeo: z.string().uuid("Debe seleccionar un rodeo válido"),
    cantidad: z.coerce
        .number()
        .refine((v) => v !== undefined && v !== null, {
            message: "La cantidad es obligatoria",
        })
        .positive("La cantidad debe ser mayor a 0"),
});

//Estructura de objeto de un animal para seguimiento individual
const produccionAnimalSchema = z.object({
    idAnimal: z.string().uuid("Animal inválido"),

    litros: z.coerce
        .number()
        .positive("Los litros deben ser mayores a 0"),

    estado: z.enum(EstadoAnimal, "Estado inválido"),
});

// Estructura de un lote con seguimiento individual + Estructura base
const loteIndividualSchema = baseLoteSchema.extend({
    tipoSeguimiento: z.literal(TipoSeguimiento.INDIVIDUAL),

    cantidad: z.coerce
        .number()
        .refine((v) => v !== undefined && v !== null, {
            message: "La cantidad es obligatoria",
        })
        .positive("La cantidad debe ser mayor a 0"),

    animales: z
        .array(produccionAnimalSchema)
        .min(1, "Debe seleccionar al menos un animal")
        .refine(
            (animales) =>
                new Set(animales.map((a) => a.idAnimal)).size === animales.length,
            {
                message: "No puede seleccionar un mismo animal más de una vez",
            }
        ),
});

// Discriminacion de tipos de lote según el tipo de seguimiento (rodeo o individual) (USADO EN CREAR LOTE)
export const crearLoteSchema = z.discriminatedUnion("tipoSeguimiento", [
    loteRodeoSchema,
    loteIndividualSchema,
]);


export const editarLoteSchema = z.object({
    idProducto: z
        .string()
        .uuid("Producto inválido")
        .optional(),

    cantidad: z.coerce
        .number()
        .positive("La cantidad debe ser mayor a 0")
        .optional(),
    unidad: z.enum(Unidad, "Unidad de medida inválida").optional(),
    fechaProduccion: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato inválido, usar dd/mm/aaaa")
        .optional()
        .transform((val) => {
            if (!val) return undefined;

            const [dd, mm, yyyy] = val.split("/").map(Number);
            return new Date(yyyy, mm - 1, dd);
        }),
    idRodeo: z.string().uuid("Debe seleccionar un rodeo válido"),
});

//Para utlizar en GETLOTES
export const listarLotesSchema = z.object({

    // Estado del lote:
    // true  -> lote completo/cerrado
    // false -> lote incompleto/modificable
    estado: z
        .enum(["true", "false"])
        .optional()
        .transform((val) => {
            if (val === undefined) return undefined;
            return val === "true";
        }),

    // Filtro por producto/nombre.
    // Se mantiene por compatibilidad con lógica anterior.
    // Actualmente puede utilizarse para búsquedas parciales.
    nombre: z
        .string()
        .min(1, "El nombre no puede estar vacío")
        .optional(),

    // Número de lote exacto.
    // Se mantiene temporalmente durante migración.
    numeroLote: z
        .string()
        .regex(/^\d+$/, "Número de lote inválido")
        .transform((val) => Number(val))
        .optional(),

    // Fecha desde:
    // Genera inicio del día para búsquedas por rango.
    fecha_desde: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato inválido, usar dd/mm/aaaa")
        .optional()
        .transform((val) => {
            if (!val) return undefined;

            const [dd, mm, yyyy] = val.split("/").map(Number);

            return new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
        }),

    // Fecha hasta:
    // Genera fin del día para incluir registros completos.
    fecha_hasta: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato inválido, usar dd/mm/aaaa")
        .optional()
        .transform((val) => {
            if (!val) return undefined;

            const [dd, mm, yyyy] = val.split("/").map(Number);

            return new Date(yyyy, mm - 1, dd, 23, 59, 59, 999);
        }),

    // Filtro específico por producto.
    // Actualmente se utiliza como búsqueda textual.
    producto: z
        .string()
        .min(1, "El producto no puede estar vacío")
        .optional(),

    // Ordenamiento.
    // Se mantiene lógica asc/desc por compatibilidad.
    // Actualmente se aplica sobre:
    // - numeroLote
    // - fechaProduccion
    orden: z
        .enum(["asc", "desc"], "El orden debe ser 'asc' o 'desc'")
        .optional(),

    // Página actual.
    // Valor mínimo permitido: 1
    page: z
        .string()
        .regex(/^\d+$/, "Página inválida")
        .transform((val) => Number(val))
        .refine((val) => val > 0, "La página debe ser mayor a 0")
        .optional()
        .default(1),

    // Cantidad de registros por página.
    // Se limita para evitar consultas demasiado pesadas.
    limit: z
        .string()
        .regex(/^\d+$/, "Límite inválido")
        .transform((val) => Number(val))
        .refine((val) => val > 0, "El límite debe ser mayor a 0")
        .refine((val) => val <= 100, "El límite máximo permitido es 100")
        .optional()
        .default(10),
});


export const idLoteParamSchema = z.object({
    idLote: z.string().uuid("Id de lote inválido"),
});

export type CrearLoteDTO = z.infer<typeof crearLoteSchema>;
export type CrearLoteRodeoDTO = z.infer<typeof loteRodeoSchema>;
export type ProduccionAnimalDTO = z.infer<typeof produccionAnimalSchema>;
export type CrearLoteIndividualDTO = z.infer<typeof loteIndividualSchema>;
export type EditarLoteDTO = z.infer<typeof editarLoteSchema>;
export type ListarLotesQuery = z.infer<typeof listarLotesSchema>;