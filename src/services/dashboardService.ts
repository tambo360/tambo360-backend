import { prisma } from "../lib/prisma";
import { Categoria, CostosDirecto, Merma } from "@prisma/client";
import { InfoMes, Metrica, SummaryResult } from "../types";
import { meses } from "../utils/data";

export class DashboardService {
    static async listarPorMes(userId: string) {
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
                    establecimiento: { idUsuario: userId },
                    fechaProduccion: { gte: fechaInicio, lte: fechaFin }
                },
                include: { mermas: true, costosDirectos: true, producto: true }
            }),
            prisma.loteProduccion.findMany({
                where: {
                    establecimiento: { idUsuario: userId },
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

    static async graficoProduccion(userId: string, producto: Categoria, metrica: Metrica) {
        const hoy = new Date()
        const anio = hoy.getFullYear()
        const mes = hoy.getMonth()

        const inicioPeriodo = new Date(anio, mes - 6, 1)
        const finPeriodo = new Date(anio, mes + 1, 0, 23, 59, 59, 999)

        const lotes = await prisma.loteProduccion.findMany({
            where: {
                establecimiento: { idUsuario: userId },
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

        if(!lotes.length){
            return {resultado: [], Lote: false}
        }
        console.log("lotes", lotes)

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

        return {resultado, Lote: true}

    }
}




