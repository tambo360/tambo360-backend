import { prisma } from "../lib/prisma";
import { InfoMes, Metrica, SummaryResult } from "../types";
import { meses } from "../utils/data";

import { Categoria, Unidad, CostosDirecto, Merma } from "@prisma/client";
import { calcularLitrosLibres } from "../utils/litrosLibres";
import { AppError } from "../utils/AppError";


export class DashboardService {

    static async costosPorCategoria(idEstablecimiento: string) {

        // Fechas del mes actual
        const hoy = new Date()
        const anio = hoy.getFullYear()
        const mes = hoy.getMonth() + 1 // 0-11, por eso +1

        const inicio = new Date(anio, mes - 1, 1)
        const fin = new Date(anio, mes, 0, 23, 59, 59, 999)

        const costos = await prisma.costosDirecto.groupBy({
            by: ["tipoCosto", "moneda"],
            where: {
                lote: {
                    idEstablecimiento: idEstablecimiento,
                    fechaProduccion: {
                        gte: inicio,
                        lte: fin
                    }
                }
            },
            _sum: {
                monto: true
            }
        })

        return costos.map(c => ({
            categoria: c.tipoCosto,
            moneda: c.moneda,
            total: Number(c._sum.monto || 0)
        }))

    }

    // =====================================================
    // GET /dashboard/mes-actual
    // Actualizado al patrón multi-tenant actual: se filtra por
    // idEstablecimiento (via req.estAccess) en vez de idUsuario,
    // que ya no existe como relación directa de Establecimiento.
    // =====================================================
    static async listarPorMes(idEstablecimiento: string) {
        // Fechas del mes actual
        const hoy = new Date()
        const anio = hoy.getFullYear()
        const mes = hoy.getMonth() + 1 // 0-11, por eso +1

        const fechaInicio = new Date(anio, mes - 1, 1)
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59, 999)

        // Fechas del mes anterior
        const mesAnterior = mes - 1
        const anioAnterior = mesAnterior === 0 ? anio - 1 : anio
        const mesAnteriorNormalizado = mesAnterior === 0 ? 12 : mesAnterior

        const fechaInicioMesAnterior = new Date(anioAnterior, mesAnteriorNormalizado - 1, 1)
        const fechaFinMesAnterior = new Date(anioAnterior, mesAnteriorNormalizado, 0, 23, 59, 59, 999)

        // Consultas en paralelo
        const [resultActual, resultPrev] = await Promise.all([
            prisma.loteProduccion.findMany({
                where: {
                    idEstablecimiento,
                    fechaProduccion: { gte: fechaInicio, lte: fechaFin }
                },
                include: { mermas: true, costosDirectos: true, producto: true }
            }),
            prisma.loteProduccion.findMany({
                where: {
                    idEstablecimiento,
                    fechaProduccion: { gte: fechaInicioMesAnterior, lte: fechaFinMesAnterior }
                },
                include: { mermas: true, costosDirectos: true, producto: true }
            })
        ])


        // Función para armar resumen
        const buildSummary = (result: InfoMes) => {
            const summary = result.reduce<SummaryResult>((acc, lote) => {
                const category = lote.producto.categoria
                if (!acc[category]) {
                    acc[category] = { cantidad: 0, costos: 0, mermas: 0 }
                }
                acc[category].cantidad += Number(lote.cantidad)
                acc[category].costos += lote.costosDirectos.reduce((sum: number, costo: CostosDirecto) => sum + Number(costo.monto), 0)
                acc[category].mermas += lote.mermas.reduce((sum: number, merma: Merma) => sum + Number(merma.cantidad), 0)
                return acc
            }, {})


            const totalMermas = Object.values(summary).reduce((sum, cat: any) => sum + cat.mermas, 0)
            const totalCostos = Object.values(summary).reduce((sum, cat: any) => sum + cat.costos, 0)

            return {
                leches: summary.leches?.cantidad || 0,
                quesos: summary.quesos?.cantidad || 0,
                mermas: totalMermas,
                costos: totalCostos
            }
        }

        const actual = buildSummary(resultActual)
        const prev = buildSummary(resultPrev)

        // Función para calcular variación porcentual
        const variacion = (actual: number, anterior: number): number | null => {
            if (anterior === 0) return null // no hay mes previo
            return ((actual - anterior) / anterior) * 100
        }

        const variaciones = {
            leches: variacion(actual.leches, prev.leches),
            quesos: variacion(actual.quesos, prev.quesos),
            mermas: variacion(actual.mermas, prev.mermas),
            costos: variacion(actual.costos, prev.costos)
        }

        return { actual, variaciones, mesPrevio: meses[mesAnterior - 1] }
    }

    // =====================================================
    // GET /dashboard/grafico?producto=leches&metrica=cantidad
    // Actualizado al patrón multi-tenant actual: idEstablecimiento
    // en vez de idUsuario.
    // =====================================================
    static async graficoProduccion(idEstablecimiento: string, producto: Categoria, metrica: Metrica) {
        const hoy = new Date()
        const anio = hoy.getFullYear()
        const mes = hoy.getMonth()

        const inicioPeriodo = new Date(anio, mes - 6, 1)
        const finPeriodo = new Date(anio, mes + 1, 0, 23, 59, 59, 999)

        const lotes = await prisma.loteProduccion.findMany({
            where: {
                idEstablecimiento,
                fechaProduccion: {
                    gte: inicioPeriodo,
                    lte: finPeriodo
                }
            },
            include: {
                producto: true,
                mermas: true,
                costosDirectos: true
            }
        })

        if (!lotes.length) {
            return { resultado: [], Lote: false }
        }

        const mesesMap: Record<string, number> = {}

        for (let i = 6; i >= 0; i--) {
            const fecha = new Date(anio, mes - i, 1)
            const key = `${fecha.getFullYear()}-${fecha.getMonth()}`
            mesesMap[key] = 0
        }

        for (const lote of lotes) {

            if (lote.producto.categoria !== producto) continue

            const fecha = new Date(lote.fechaProduccion)
            const key = `${fecha.getFullYear()}-${fecha.getMonth()}`

            let valor = 0

            if (metrica === "cantidad") {
                valor = Number(lote.cantidad)
            }

            if (metrica === "mermas") {
                valor = lote.mermas.reduce(
                    (sum, m) => sum + Number(m.cantidad),
                    0
                )
            }

            if (metrica === "costos") {
                valor = lote.costosDirectos.reduce(
                    (sum, c) => sum + Number(c.monto),
                    0
                )
            }

            if (mesesMap[key] !== undefined) {
                mesesMap[key] += valor
            }
        }

        const resultado = Object.entries(mesesMap).map(([key, valor]) => {

            const [anio, mes] = key.split("-").map(Number)

            return {
                mes: meses[mes], // tu array de meses
                anio,
                valor
            }

        })

        return { resultado, Lote: true }

    }


    // =====================================================
    // GET /dashboard/litros-libres
    // Calcula los litros libres del mes actual.
    // Utiliza el precio vigente en la configuración.
    // =====================================================
    static async obtenerLitrosLibres(idEstablecimiento: string) {
        const hoy = new Date();

        const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

        // Consultar la configuración del establecimiento.
        const configuracion = await prisma.configuracion.findUnique({
            where: { idEstablecimiento },
            select: { precioLitro: true }
        });

        if (!configuracion || configuracion.precioLitro === null) {
            throw new AppError(
                "El establecimiento no tiene configurado el precio del litro de leche",
                400
            );
        }

        const precioLitro = Number(configuracion.precioLitro);

        // Sumar solamente la producción de leche registrada en litros.
        const produccion = await prisma.loteProduccion.aggregate({
            where: {
                idEstablecimiento,
                fechaProduccion: {
                    gte: fechaInicio,
                    lte: fechaFin
                },
                unidad: Unidad.litros,
                producto: {
                    categoria: Categoria.leches
                }
            },
            _sum: {
                cantidad: true
            }
        });

        const litrosProducidos = Number(
            produccion._sum.cantidad ?? 0
        );

        // Sumar los costos generales del mismo establecimiento y mes.
        const costos = await prisma.costoGeneral.aggregate({
            where: {
                idEstablecimiento,
                fecha: {
                    gte: fechaInicio,
                    lte: fechaFin
                }
            },
            _sum: {
                monto: true
            }
        });

        const costosGenerales = Number(costos._sum.monto ?? 0);

        const litrosLibres = calcularLitrosLibres(
            litrosProducidos,
            precioLitro,
            costosGenerales
        );

        return {
            periodo: {
                fechaDesde: fechaInicio,
                fechaHasta: fechaFin
            },
            litrosProducidos,
            precioLitro,
            costosGenerales,
            litrosLibres
        };
    }


static async obtenerGraficoCostosGenerales(
    idEstablecimiento: string,
    periodo: string = "6meses"
) {
    if (!idEstablecimiento || !idEstablecimiento.trim()) {
        throw new AppError("El establecimiento es obligatorio", 400);
    }

    const periodosValidos = ["7dias", "1mes", "6meses"];

    if (!periodosValidos.includes(periodo)) {
        throw new AppError(
            "El período debe ser 7dias, 1mes o 6meses",
            400
        );
    }

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();

    let fechaInicio: Date;
    let fechaFin: Date;

    if (periodo === "7dias") {
        // Hoy y los seis días anteriores.
        fechaInicio = new Date(anioActual, mesActual, hoy.getDate() - 6);
        fechaInicio.setHours(0, 0, 0, 0);

        fechaFin = new Date(hoy);
        fechaFin.setHours(23, 59, 59, 999);
    } else if (periodo === "1mes") {
        // Mes calendario actual completo, hasta el momento de la consulta.
        fechaInicio = new Date(anioActual, mesActual, 1);
        fechaFin = new Date(hoy);
        fechaFin.setHours(23, 59, 59, 999);
    } else {
        // Seis meses calendario anteriores, excluyendo el mes actual.
        fechaInicio = new Date(anioActual, mesActual - 6, 1);
        fechaFin = new Date(anioActual, mesActual, 0, 23, 59, 59, 999);
    }

    const costos = await prisma.costoGeneral.findMany({
        where: {
            idEstablecimiento,
            fecha: {
                gte: fechaInicio,
                lte: fechaFin
            }
        },
        select: {
            fecha: true,
            tipoCosto: true,
            monto: true
        },
        orderBy: {
            fecha: "asc"
        }
    });

    // Preparar todos los períodos, incluso si no tienen costos.
    
    const periodos: {
        clave: string;
        etiqueta: string;
        anio: number;
    }[] = [];

    if (periodo === "7dias") {
        for (let i = 6; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - i);

            const clave = [
                fecha.getFullYear(),
                String(fecha.getMonth() + 1).padStart(2, "0"),
                String(fecha.getDate()).padStart(2, "0")
            ].join("-");

            periodos.push({
                clave,
                etiqueta: fecha.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit"
                }),
                anio: fecha.getFullYear()
            });
        }
    } else {
        const cantidadMeses = periodo === "1mes" ? 1 : 6;

        for (let i = cantidadMeses; i >= 1; i--) {
            // 1mes incluye el mes actual; 6meses excluye el actual.
            const desplazamiento = periodo === "1mes" ? 0 : -i;
            const fecha = new Date(
                anioActual,
                mesActual + desplazamiento,
                1
            );

            const clave = `${fecha.getFullYear()}-${String(
                fecha.getMonth() + 1
            ).padStart(2, "0")}`;

            periodos.push({
                clave,
                etiqueta: fecha.toLocaleDateString("es-AR", {
                    month: "long"
                }),
                anio: fecha.getFullYear()
            });
        }
    }

    const categorias = [...new Set(
        costos.map(costo => costo.tipoCosto)
    )].sort();

    const datosPorPeriodo = new Map<
        string,
        Record<string, string | number>
    >();

    for (const item of periodos) {
        const fila: Record<string, string | number> = {
            periodo: item.etiqueta,
            clave: item.clave,
            anio: item.anio,
            total: 0
        };

        for (const categoria of categorias) {
            fila[categoria] = 0;
        }

        datosPorPeriodo.set(item.clave, fila);
    }

    for (const costo of costos) {
        const fecha = new Date(costo.fecha);

        const clave = periodo === "7dias"
            ? [
                fecha.getFullYear(),
                String(fecha.getMonth() + 1).padStart(2, "0"),
                String(fecha.getDate()).padStart(2, "0")
            ].join("-")
            : `${fecha.getFullYear()}-${String(
                fecha.getMonth() + 1
            ).padStart(2, "0")}`;

        const fila = datosPorPeriodo.get(clave);

        if (!fila) continue;

        const monto = Number(costo.monto);

        if (!Number.isFinite(monto)) {
            throw new AppError(
                "Se encontró un monto de costo general inválido",
                500
            );
        }

        fila[costo.tipoCosto] =
            Number(fila[costo.tipoCosto] ?? 0) + monto;

        fila.total = Number(fila.total) + monto;
    }

    return {
        periodo,
        fechaInicio,
        fechaFin,
        categorias,
        datos: [...datosPorPeriodo.values()]
    };
}


}