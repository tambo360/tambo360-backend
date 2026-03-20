import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

const ZONA_ARG = "America/Argentina/Buenos_Aires";

export const crearLoteSchema = z.object({
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

    fechaProduccion: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato inválido, usar dd/mm/aaaa")
        .optional()
        .transform((val) => {
            if (!val) return undefined;

            const [dd, mm, yyyy] = val.split("/").map(Number);
            return new Date(yyyy, mm - 1, dd);
        }),
});


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

export const idLoteParamSchema = z.object({
    idLote: z.string().uuid("Id de lote inválido"),
});

export type CrearLoteDTO = z.infer<typeof crearLoteSchema>;
export type EditarLoteDTO = z.infer<typeof editarLoteSchema>;
export type ListarLotesQuery = z.infer<typeof listarLotesSchema>;