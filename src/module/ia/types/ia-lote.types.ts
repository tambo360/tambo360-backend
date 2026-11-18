import { Prisma, TipoRodeo, AmbitoPromedioProductivo, PromedioProductivoLote } from "@prisma/client";

export type PromedioProductivoLotesParams = {
    lote: {
        cantidad: Prisma.Decimal,
        cantAnimales: number,
    },
    idPromedioProductivo: string,
    idLote: string,
    idPromedioProductivoLote: string,
    creadoEn: Date,
}

export type UpdatePromedioProductivoParams = {
    idEstablecimiento: string,
    ambitoPromedio: AmbitoPromedioProductivo,
    LotesHistorial: PromedioProductivoLotesParams[],
    loteActual: {
        idLote: string,
        cantidad: number,
        cantAnimales: number
    }
}

export type CheckEventCreationParams = {
    idEstablecimiento: string,
    lote: {
        idLote: string,
        cantidad: number,
        cantAnimales: number
    },
    tipoRodeo: TipoRodeo | null
}