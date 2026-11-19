import { Prisma } from '@prisma/client';

export const includeLote = Prisma.validator<Prisma.AiAnalysisEventInclude>()({
    establecimiento: {
        select: {
            idEstablecimiento: true,
            configuracions: { select: { tipoSeguimiento: true } },
        },
    },
    lote: {
        select: {
            idLote: true,
            cantidad: true,
            cantAnimales: true,
            fechaProduccion: true,
            rodeo: { select: { tipoRodeo: true } },
            produccionesIndividuales: {
                select: { idAnimal: true, litros: true },
            },
        },
    },
});

export const includeMes = Prisma.validator<Prisma.AiAnalysisEventInclude>()({
    establecimiento: {
        select: {
            idEstablecimiento: true,
            configuracions: { select: { tipoSeguimiento: true } },
        },
    },
    resumenMensual: {
        select: {
            idResumenMensual: true,
            anio: true,
            mes: true,
            fechaDesde: true,
            fechaHasta: true,
            cantidadLotes: true,
            litrosProduccion: true,
            litrosMermas: true,
            litrosTotales: true,
            litrosLibres: true,
            costosTotales: true,
            costoPorLitro: true,
            costosPorCategoria: {
                select: {
                    idResumenCostoCategoria: true,
                    categoria: true,
                    monto: true,
                },
            },
        },
    },
});

// Tipos exportados para usar en cualquier parte de tu app
export type EventoLote = Prisma.AiAnalysisEventGetPayload<{ include: typeof includeLote }>;
export type EventoMes = Prisma.AiAnalysisEventGetPayload<{ include: typeof includeMes }>;
