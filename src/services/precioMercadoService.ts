
import axios from "axios";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

const URL_PRECIO_MERCADO =
    "https://www.magyp.gob.ar/sitio/areas/ss_lecheria/mercado_futuro/";

// Meses publicados por el Ministerio.
const meses: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
};

interface PrecioPublicado {
    precioLitro: number;
    mes: number;
    anio: number;
}

export class PrecioMercadoService {

    // Consulta la página oficial y extrae exclusivamente el precio por litro.
    private static async consultarPrecioOficial(): Promise<PrecioPublicado> {

        const respuesta = await axios.get<string>(
            URL_PRECIO_MERCADO,
            {
                timeout: 15000,
                responseType: "text",
                maxContentLength: 2 * 1024 * 1024,
                maxBodyLength: 2 * 1024 * 1024,
                headers: {
                    Accept: "text/html",
                },
            }
        );

        if (typeof respuesta.data !== "string") {
            throw new Error("La respuesta oficial no contiene HTML válido");
        }

        const html = respuesta.data;

        /*
         * Busca el precio que contiene la expresión "por litro".
         * De esta manera no toma el precio anterior correspondiente
         * a Kg/SU.
         *
         * También obtiene el mes y año publicados en el h4 siguiente.
         */
        const coincidencia = html.match(
            /<h3[^>]*>\s*\$\s*([\d.,]+)\s*por\s+litro\s*<\/h3>\s*<h4[^>]*>\s*([\p{L}]+)\s+(\d{4})\s*<\/h4>/iu
        );

        if (!coincidencia) {
            throw new Error(
                "No se encontró el precio por litro y su período en la página oficial"
            );
        }

        // Convierte el formato argentino: 7.387,13 -> 7387.13.
        const precioTexto = coincidencia[1];

        const formatoPrecioValido =
            /^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(precioTexto);

        if (!formatoPrecioValido) {
            throw new Error("El formato del precio oficial no es válido");
        }

        const precioLitro = Number(
            precioTexto.replace(/\./g, "").replace(",", ".")
        );

        // Normaliza el nombre del mes para evitar problemas con tildes.
        const nombreMes = coincidencia[2]
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        const mes = meses[nombreMes];
        const anio = Number(coincidencia[3]);

        // Validación del importe.
        if (!Number.isFinite(precioLitro) || precioLitro <= 0) {
            throw new Error("El precio oficial obtenido no es válido");
        }

        // Validación del período publicado.
        const anioActual = new Date().getFullYear();

        if (
            !mes ||
            !Number.isInteger(anio) ||
            anio < 2016 ||
            anio > anioActual
        ) {
            throw new Error("El período publicado no es válido");
        }

        return {
            precioLitro,
            mes,
            anio,
        };
    }

    // Consulta el precio oficial y actualiza el registro persistido.
    static async actualizarPrecioMercado() {

        /*
         * Primero se consulta y valida la fuente oficial.
         * Si falla la consulta, el proceso termina antes de modificar
         * cualquier registro de la base de datos.
         */
        const publicado = await this.consultarPrecioOficial();

        const existente = await prisma.precioMercado.findFirst({
            orderBy: {
                actualizadoEn: "desc",
            },
        });

        const ahora = new Date();

        // Si todavía no existe un precio guardado, crea el primer registro.
        if (!existente) {
            return prisma.precioMercado.create({
                data: {
                    precioLitro: publicado.precioLitro,
                    precioLitroPrevio: 0,
                    anio: publicado.anio,
                    mes: publicado.mes,
                    ultimaConsulta: ahora,
                    fuente: URL_PRECIO_MERCADO,
                },
            });
        }

        const precioAnterior = Number(existente.precioLitro);

        const cambioPrecio =
            precioAnterior !== publicado.precioLitro;

        const cambioPeriodo =
            existente.mes !== publicado.mes ||
            existente.anio !== publicado.anio;

        /*
         * Si cambia el importe, conserva el valor anterior.
         * Si cambia solamente el período, mantiene el precio anterior
         * sin modificarlo.
         *
         * ultimaConsulta se actualiza siempre que la consulta oficial
         * haya sido exitosa, incluso cuando no cambió el precio.
         */
        return prisma.precioMercado.update({
            where: {
                idPrecioMercado: existente.idPrecioMercado,
            },
            data: {
                ...(cambioPrecio
                    ? {
                        precioLitro: publicado.precioLitro,
                        precioLitroPrevio: existente.precioLitro,
                    }
                    : {}),

                ...(cambioPeriodo
                    ? {
                        mes: publicado.mes,
                        anio: publicado.anio,
                    }
                    : {}),

                ultimaConsulta: ahora,
                fuente: URL_PRECIO_MERCADO,
            },
        });
    }

    // Devuelve el último precio válido guardado sin consultar Internet.
    static async obtenerPrecioMercado() {

        const registro = await prisma.precioMercado.findFirst({
            orderBy: {
                actualizadoEn: "desc",
            },
        });

        if (
            !registro ||
            !Number.isFinite(Number(registro.precioLitro)) ||
            Number(registro.precioLitro) <= 0
        ) {
            throw new AppError(
                "El precio nacional de mercado todavía no está disponible",
                503
            );
        }

        return {
            precioLitro: Number(registro.precioLitro),
            mes: registro.mes,
            anio: registro.anio,
            ultimaConsulta: registro.ultimaConsulta,
        };
    }
}
