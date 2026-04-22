import { PrismaClient, Categoria } from "@prisma/client"

type Merma = {
    cantidad: number
}

type Lote = {
    idLote: string
    numeroLote: number
    producto: string
    categoria: Categoria
    cantidad: number
    unidad: string
    mermas: Merma[]
}

type InputData = {
    idEstablecimiento: string
    lotes: Lote[]
}

const THRESHOLDS = {
    bajo: 3,
    medio: 5
}

// -------------------------------------------------
// SEED
// -------------------------------------------------
export async function seedCategoryAverages(
    data: InputData,
    db: PrismaClient
) {
    const categoryTotals: Record<string, any> = {}
    const lotMermaTotals: Record<string, number> = {}
    const lotMermaPcts: Record<string, number> = {}
    const categoryAvgPct: Record<string, number> = {}

    const outliers: any[] = []

    // 1. ACUMULAR
    for (const lote of data.lotes) {
        const mermaTotal = lote.mermas.reduce(
            (sum, m) => sum + Number(m.cantidad),
            0
        )

        const pct =
            lote.cantidad > 0
                ? (mermaTotal / Number(lote.cantidad)) * 100
                : 0

        if (!categoryTotals[lote.categoria]) {
            categoryTotals[lote.categoria] = {
                merma: 0,
                produccion: 0,
                cantidadLotes: 0,
            }
        }

        categoryTotals[lote.categoria].merma += mermaTotal
        categoryTotals[lote.categoria].produccion += Number(lote.cantidad)
        categoryTotals[lote.categoria].cantidadLotes += 1

        lotMermaTotals[lote.idLote] = mermaTotal
        lotMermaPcts[lote.idLote] = pct
    }

    // 2. PROMEDIOS + DB (ACUMULANDO BIEN)
    for (const categoria in categoryTotals) {
        const totals = categoryTotals[categoria]

        const record = await db.promedioCategoria.findUnique({
            where: {
                idEstablecimiento_categoria: {
                    idEstablecimiento: data.idEstablecimiento,
                    categoria: categoria as Categoria,
                },
            },
        })

        let newMerma = totals.merma
        let newProduccion = totals.produccion
        let newCantidadLotes = totals.cantidadLotes

        if (record) {
            newMerma += Number(record.mermaAcumulada)
            newProduccion += Number(record.produccionAcumulada)
            newCantidadLotes += record.cantidadLotes
        }

        const avgPct =
            newProduccion > 0
                ? (newMerma / newProduccion) * 100
                : 0

        categoryAvgPct[categoria] = avgPct

        if (!record) {
            await db.promedioCategoria.create({
                data: {
                    idEstablecimiento: data.idEstablecimiento,
                    categoria: categoria as Categoria,
                    produccionAcumulada: newProduccion,
                    mermaAcumulada: newMerma,
                    pctMermaPromedio: avgPct,
                    cantidadLotes: newCantidadLotes,
                },
            })
        } else {
            await db.promedioCategoria.update({
                where: {
                    idEstablecimiento_categoria: {
                        idEstablecimiento: data.idEstablecimiento,
                        categoria: categoria as Categoria,
                    },
                },
                data: {
                    produccionAcumulada: newProduccion,
                    mermaAcumulada: newMerma,
                    pctMermaPromedio: avgPct,
                    cantidadLotes: newCantidadLotes,
                },
            })
        }
    }

    // 3. OUTLIERS
    for (const lote of data.lotes) {
        const total = lotMermaTotals[lote.idLote]
        const pct = lotMermaPcts[lote.idLote]
        const avgPct = categoryAvgPct[lote.categoria]

        if (!avgPct || avgPct === 0) continue

        const pctOver = ((pct - avgPct) / avgPct) * 100
        if (pctOver <= 0) continue

        let nivel: "bajo" | "medio" | "alto" = "bajo"

        if (pctOver <= THRESHOLDS.bajo) nivel = "bajo"
        else if (pctOver <= THRESHOLDS.medio) nivel = "medio"
        else nivel = "alto"

        outliers.push({
            idLote: lote.idLote,
            numeroLote: lote.numeroLote,
            producto: lote.producto,
            categoria: lote.categoria,
            merma_total: Number(total.toFixed(2)),
            pct_merma_lote: Number(pct.toFixed(2)),
            promedio_categoria_pct: Number(avgPct.toFixed(2)),
            porcentaje_sobre_promedio: Number(pctOver.toFixed(1)),
            nivel,
        })
    }

    return outliers
}

// -------------------------------------------------
// SINGLE LOTE
// -------------------------------------------------
export async function evaluateSingleLote(
    data: InputData,
    db: PrismaClient
) {
    const lote = data.lotes[0]

    const mermaTotal = lote.mermas.reduce(
        (sum, m) => sum + Number(m.cantidad),
        0
    )

    const pct =
        lote.cantidad > 0
            ? (mermaTotal / Number(lote.cantidad)) * 100
            : 0

    const record = await db.promedioCategoria.findUnique({
        where: {
            idEstablecimiento_categoria: {
                idEstablecimiento: data.idEstablecimiento,
                categoria: lote.categoria,
            },
        },
    })

    let outliers: any[] = []

    // Inicialización
    if (!record) {
        await db.promedioCategoria.create({
            data: {
                idEstablecimiento: data.idEstablecimiento,
                categoria: lote.categoria,
                produccionAcumulada: Number(lote.cantidad),
                mermaAcumulada: mermaTotal,
                pctMermaPromedio: pct,
                cantidadLotes: 1,
            },
        })

        return []
    }

    const avgPct = record.pctMermaPromedio

    // Evaluación
    if (avgPct > 0) {
        const pctOver = ((pct - avgPct) / avgPct) * 100

        if (pctOver > 0) {
            let nivel: "bajo" | "medio" | "alto" = "bajo"

            if (pctOver <= THRESHOLDS.bajo) nivel = "bajo"
            else if (pctOver <= THRESHOLDS.medio) nivel = "medio"
            else nivel = "alto"

            outliers.push({
                idLote: lote.idLote,
                numeroLote: lote.numeroLote,
                producto: lote.producto,
                categoria: lote.categoria,
                unidad: lote.unidad,
                merma_total: mermaTotal,
                pct_merma_lote: pct,
                promedio_categoria_pct: avgPct,
                porcentaje_sobre_promedio: pctOver,
                nivel,
            })
        }
    }

    // Update acumulado
    const newMerma = Number(record.mermaAcumulada) + mermaTotal
    const newProduccion =
        Number(record.produccionAcumulada) + Number(lote.cantidad)

    const newPct =
        newProduccion > 0
            ? (newMerma / newProduccion) * 100
            : 0

    await db.promedioCategoria.update({
        where: {
            idEstablecimiento_categoria: {
                idEstablecimiento: data.idEstablecimiento,
                categoria: lote.categoria,
            },
        },
        data: {
            mermaAcumulada: newMerma,
            produccionAcumulada: newProduccion,
            cantidadLotes: record.cantidadLotes + 1,
            pctMermaPromedio: newPct,
        },
    })

    return outliers
}