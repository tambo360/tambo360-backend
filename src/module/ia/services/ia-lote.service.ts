import { AppError } from "../../../utils/AppError";
import { prisma } from "../../../lib/prisma";
import { Prisma, TipoRodeo, AmbitoPromedioProductivo, PromedioProductivoLote } from "@prisma/client";
import { findAmbitoPromedioProductivo } from "../utils";
import { PromedioProductivoLotesParams, UpdatePromedioProductivoParams, CheckEventCreationParams } from "../types/ia-lote.types";
import { crearEventoIA } from "./ia-eventService";


export class IALoteService {

    private MIN_LOTES = 15;
    private MAX_LOTES = 30;

    async checkEventCreation(data: CheckEventCreationParams) {
        const result = await prisma.$transaction(async (tx) => {

            const est = await tx.establecimiento.findUnique({
                where: {
                    idEstablecimiento: data.idEstablecimiento
                },
                include: {
                    configuracions: true
                }
            })

            if (!est) {
                throw new AppError("Establecimiento no encontrado", 404);
            }

            const tipoSeguimiento = est.configuracions[0].tipoSeguimiento

            const ambitoPromedio = findAmbitoPromedioProductivo(tipoSeguimiento, data.tipoRodeo)

            const promedioProductivo = await tx.promedioProductivo.findUnique({
                where: {
                    idEstablecimiento_ambito: {
                        idEstablecimiento: data.idEstablecimiento,
                        ambito: ambitoPromedio
                    }
                },
                include: {
                    promedioProductivoLotes: {
                        include: {
                            lote: {
                                select: {
                                    cantAnimales: true,
                                    cantidad: true
                                }
                            }
                        }
                    }
                }
            })

            if (!promedioProductivo) {
                throw new AppError("No se encontró el promedio productivo para el establecimiento y ámbito especificado", 404);
            }

            if (promedioProductivo.cantidadLotes < this.MIN_LOTES) {
                await this.updatePromedioProductivo(tx, {
                    idEstablecimiento: data.idEstablecimiento,
                    ambitoPromedio: ambitoPromedio,
                    LotesHistorial: promedioProductivo.promedioProductivoLotes,
                    loteActual: data.lote
                })
                console.log(`
                    Se ha actualizado el promedio productivo para el establecimiento ${data.idEstablecimiento} y ámbito ${ambitoPromedio} debido a que la cantidad de lotes es menor a ${this.MIN_LOTES}. 
                    Fecha: ${new Date().toISOString()}
                    Cantidad de lotes: ${promedioProductivo.cantidadLotes}
                `)
                return
            }

            await crearEventoIA(tx, {
                idEstablecimiento: data.idEstablecimiento,
                tipo: "LOT_CLOSED",
                claveIdempotencia: `LOT_CLOSED:${data.lote.idLote}`,
                idLote: data.lote.idLote
            })

            console.log(`
                Se ha creado un evento de IA para el lote ${data.lote.idLote} del establecimiento ${data.idEstablecimiento} y ámbito ${ambitoPromedio}. 
                Fecha: ${new Date().toISOString()}
            `)

            return
        })

        return 
    }

    async createPromedioProductivo(tx: Prisma.TransactionClient, idEstablecimiento: string, ambitoPromedio: AmbitoPromedioProductivo) {
        await tx.promedioProductivo.create({
            data: {
                idEstablecimiento: idEstablecimiento,
                ambito: ambitoPromedio,
                promedioLitrosPorAnimal: 0
            }
        })
    }

    async updatePromedioProductivo(tx: Prisma.TransactionClient, data: UpdatePromedioProductivoParams) {
        const { promedioLitrosPorAnimal, LIMITE_ALCANZADO, loteMasViejo, fechaDesde, fechaHasta } = await this.generateNewPromedioProductivo(data.LotesHistorial, data.loteActual)

        const promedioProductivo = await tx.promedioProductivo.update({
            where: {
                idEstablecimiento_ambito: {
                    idEstablecimiento: data.idEstablecimiento,
                    ambito: data.ambitoPromedio,
                }
            },
            data: {
                promedioLitrosPorAnimal: promedioLitrosPorAnimal,
                ...(LIMITE_ALCANZADO ? {} : { cantidadLotes: { increment: 1 } }),
                periodoDesde: fechaDesde,
                periodoHasta: fechaHasta
            }
        })

        if (LIMITE_ALCANZADO && loteMasViejo) {
            await tx.promedioProductivoLote.delete({
                where: {
                    idPromedioProductivoLote: loteMasViejo.idPromedioProductivoLote
                },
            });
        }

        await tx.promedioProductivoLote.create({
            data: {
                idLote: data.loteActual.idLote,
                idPromedioProductivo: promedioProductivo.idPromedioProductivo,
                creadoEn: fechaHasta
            }
        });
    }

    async generateNewPromedioProductivo(lotesHistorial: PromedioProductivoLotesParams[], loteActual: { cantidad: number, cantAnimales: number }) {

        let LIMITE_ALCANZADO = false;

        const resultado = lotesHistorial.reduce(
            (acc, lote) => {
                acc.totalLitros += Number(lote.lote.cantidad);
                acc.totalAnimales += lote.lote.cantAnimales;

                if (!acc.loteMasViejo || lote.creadoEn < acc.loteMasViejo.creadoEn) {

                    acc.segundoMasViejo = acc.loteMasViejo;
                    acc.loteMasViejo = lote;
                }
                else if (!acc.segundoMasViejo || lote.creadoEn < acc.segundoMasViejo.creadoEn) {
                    acc.segundoMasViejo = lote;
                }

                return acc;
            },
            {
                totalLitros: 0,
                totalAnimales: 0,
                loteMasViejo: null as PromedioProductivoLotesParams | null,
                segundoMasViejo: null as PromedioProductivoLotesParams | null
            }
        );

        let litros = resultado.totalLitros;
        let animales = resultado.totalAnimales;
        let loteMasViejo = resultado.loteMasViejo;

        if (lotesHistorial.length >= this.MAX_LOTES && loteMasViejo) {
            litros -= Number(loteMasViejo.lote.cantidad);
            animales -= loteMasViejo.lote.cantAnimales;
            LIMITE_ALCANZADO = true;

        }

        // agrego el nuevo lote
        litros += loteActual.cantidad;
        animales += loteActual.cantAnimales;
        const fechaDesde = LIMITE_ALCANZADO ? resultado.segundoMasViejo?.creadoEn : resultado.loteMasViejo?.creadoEn;
        const fechaHasta = new Date();

        const promedio = animales > 0 ? (litros / animales).toFixed(2) : "0";

        return {
            promedioLitrosPorAnimal: parseFloat(promedio),
            LIMITE_ALCANZADO,
            loteMasViejo: loteMasViejo,
            fechaDesde,
            fechaHasta
        }
    }
}

export default new IALoteService();