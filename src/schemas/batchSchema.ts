import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { Unidad } from "@prisma/client";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const ZONA_ARG = "America/Argentina/Buenos_Aires";

export const crearLoteSchema = z.object({
    idLote: z.uuid("Id de lote inválido"),
    idProducto: z
        .string()
        .uuid("Debe seleccionar un producto válido"),

    cantidad: z.coerce
        .number()
        .refine((v) => v !== undefined && v !== null, {
            message: "La cantidad es obligatoria",
        })
        .positive("La cantidad debe ser mayor a 0"),

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

            const fechaFinal = fechaBase
                .hour(ahoraArgentina.hour())
                .minute(ahoraArgentina.minute())
                .second(ahoraArgentina.second());

            return fechaFinal.toDate();
        }),
    estado: z.boolean().optional(),
    idRaza: z.string().uuid("Debe seleccionar una raza válida"),
    cantRaza: z.coerce.number().positive("La cantidad de raza debe ser mayor a 0"),
    unidad: z.enum(Unidad, "Unidad de medida inválida"),
});


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
    idRaza: z.string().uuid("Debe seleccionar una raza válida").optional(),
    cantRazas: z.coerce.number().positive("La cantidad de raza debe ser mayor a 0").optional(),
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

//esto estaba antes de la modificacion para la issue #29
/*
export const listarLotesSchema = z.object({
    nombre: z
        .string()
        .min(1, "El nombre no puede estar vacío")
        .optional(),

    numeroLote: z
        .string()
        .regex(/^\d+$/, "Número de lote inválido")
        .transform((val) => (val ? Number(val) : undefined))
        .optional(),

    fecha: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato inválido, usar dd/mm/aaaa")
        .optional()
        .transform((val) => {
            if (!val) return undefined;
            const [dd, mm, yyyy] = val.split("/").map(Number);
            const inicio = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
            const fin = new Date(yyyy, mm - 1, dd, 23, 59, 59, 999);
            return { inicio, fin };
        }),

    orden: z.enum(["asc", "desc"], "El orden debe ser 'asc' o 'desc'").optional(),

    pagina: z
        .string()
        .regex(/^\d+$/, "Página inválida")
        .transform((val) => (val ? Number(val) : 1))
        .refine((val) => val > 0, "La página debe ser mayor a 0")
        .optional(),
});
*/


export const idLoteParamSchema = z.object({
    idLote: z.string().uuid("Id de lote inválido"),
});

export type CrearLoteDTO = z.infer<typeof crearLoteSchema>;
export type EditarLoteDTO = z.infer<typeof editarLoteSchema>;
export type ListarLotesQuery = z.infer<typeof listarLotesSchema>;