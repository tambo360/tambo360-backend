import { AppError } from '../../src/utils/AppError';
import costoGeneralService from '../../src/services/costoGeneralService';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TipoCostoGeneral, TipoRodeo } from '@prisma/client';

const { prismaMock } = vi.hoisted(() => ({
    prismaMock: {
        costoGeneral: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            aggregate: vi.fn(),
        }, establecimiento: {
            findUnique: vi.fn(),
        },
        loteProduccion: {
            count: vi.fn(),
        },
    },
}));

vi.mock('../../src/lib/prisma', () => ({
    prisma: prismaMock,
}));

const ID_ESTABLECIMIENTO = 'est-123';
const ID_COSTO = 'costo-123';

const costoMock = {
    idCostoGeneral: ID_COSTO,
    idEstablecimiento: ID_ESTABLECIMIENTO,
    tipoCosto: TipoCostoGeneral.PERSONAL,
    descripcion: 'Sueldo encargado',
    monto: 150000,
    fecha: new Date('2026-07-01'),
    creadoEn: new Date(),
};

describe('CostoGeneralService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    // ─── crear ───────────────────────────────────────────────────────────────

    describe('crear', () => {
        it('crea un costo general correctamente', async () => {
            prismaMock.costoGeneral.create.mockResolvedValue(costoMock);

            const resultado = await costoGeneralService.crear(ID_ESTABLECIMIENTO, {
                tipoCosto: TipoCostoGeneral.PERSONAL,
                descripcion: 'Sueldo encargado',
                monto: 150000,
                fecha: new Date('2026-07-01'),
            });

            expect(prismaMock.costoGeneral.create).toHaveBeenCalledTimes(1);
            expect(resultado.tipoCosto).toBe(TipoCostoGeneral.PERSONAL);
        });
    });

    // ─── listar ──────────────────────────────────────────────────────────────

    describe('listar', () => {
        it('lista los costos del establecimiento', async () => {
            prismaMock.costoGeneral.findMany.mockResolvedValue([costoMock]);

            prismaMock.establecimiento.findUnique.mockResolvedValue({
                idEstablecimiento: ID_ESTABLECIMIENTO,
                configuracions: [],
            });


            const resultado = await costoGeneralService.listar(ID_ESTABLECIMIENTO, {
                fechaDesde: new Date('2026-07-01'),
                fechaHasta: new Date('2026-07-31'),
            }
            );

            expect(prismaMock.costoGeneral.findMany).toHaveBeenCalledTimes(1);
            expect(resultado).toHaveLength(2);
        });

        it('lanza 400 si no se indica el período de consulta', async () => {
            await expect(
                costoGeneralService.listar(ID_ESTABLECIMIENTO)
            ).rejects.toBeInstanceOf(AppError);
        });

    });
});

// ─── actualizar ──────────────────────────────────────────────────────────

describe('actualizar', () => {
    it('actualiza un costo existente del establecimiento', async () => {
        prismaMock.costoGeneral.findUnique.mockResolvedValue(costoMock);
        prismaMock.costoGeneral.update.mockResolvedValue({ ...costoMock, monto: 200000 });

        const resultado = await costoGeneralService.actualizar(ID_COSTO, ID_ESTABLECIMIENTO, { monto: 200000 });

        expect(resultado.monto).toBe(200000);
    });

    it('lanza 404 si el costo no existe', async () => {
        prismaMock.costoGeneral.findUnique.mockResolvedValue(null);

        await expect(
            costoGeneralService.actualizar(ID_COSTO, ID_ESTABLECIMIENTO, { monto: 200000 })
        ).rejects.toBeInstanceOf(AppError);
    });

    it('lanza 403 si el costo no pertenece al establecimiento', async () => {
        prismaMock.costoGeneral.findUnique.mockResolvedValue({ ...costoMock, idEstablecimiento: 'otro-est' });

        await expect(
            costoGeneralService.actualizar(ID_COSTO, ID_ESTABLECIMIENTO, { monto: 200000 })
        ).rejects.toBeInstanceOf(AppError);
    });
});

// ─── eliminar ────────────────────────────────────────────────────────────

describe('eliminar', () => {
    it('elimina un costo existente del establecimiento', async () => {
        prismaMock.costoGeneral.findUnique.mockResolvedValue(costoMock);
        prismaMock.costoGeneral.delete.mockResolvedValue(costoMock);

        await costoGeneralService.eliminar(ID_COSTO, ID_ESTABLECIMIENTO);

        expect(prismaMock.costoGeneral.delete).toHaveBeenCalledTimes(1);
    });

    it('lanza 404 si el costo no existe', async () => {
        prismaMock.costoGeneral.findUnique.mockResolvedValue(null);

        await expect(
            costoGeneralService.eliminar(ID_COSTO, ID_ESTABLECIMIENTO)
        ).rejects.toBeInstanceOf(AppError);
    });

    it('lanza 403 si el costo no pertenece al establecimiento', async () => {
        prismaMock.costoGeneral.findUnique.mockResolvedValue({ ...costoMock, idEstablecimiento: 'otro-est' });

        await expect(
            costoGeneralService.eliminar(ID_COSTO, ID_ESTABLECIMIENTO)
        ).rejects.toBeInstanceOf(AppError);
    });
});

// ─── resumenEconomico ────────────────────────────────────────────────────
// Épica: Costos Generales y Resumen Económico (issue #79)

describe('resumenEconomico', () => {
    const FECHA_DESDE = new Date('2026-07-01');
    const FECHA_HASTA = new Date('2026-07-31'); // 31 días de período

    const establecimientoConRodeosMock = {
        idEstablecimiento: ID_ESTABLECIMIENTO,
        configuracions: [
            {
                idConfiguracion: 'config-1',
                rodeos: [
                    { idRodeo: 'r1', tipoRodeo: TipoRodeo.ALTA_PRODUCCION, cantVacas: 100, costoRacion: 4.5 },
                    { idRodeo: 'r2', tipoRodeo: TipoRodeo.BAJA_PRODUCCION, cantVacas: 50, costoRacion: 2.8 },
                    { idRodeo: 'r3', tipoRodeo: TipoRodeo.VACAS_SECAS, cantVacas: 20, costoRacion: 1.5 },
                ],
            },
        ],
    };

    it('calcula el resumen económico combinando alimentación, costos generales y prorrateo', async () => {
        prismaMock.establecimiento.findUnique.mockResolvedValue(establecimientoConRodeosMock);
        prismaMock.costoGeneral.aggregate.mockResolvedValue({ _sum: { monto: 3000 } });
        prismaMock.loteProduccion.count.mockResolvedValue(60);

        const resultado = await costoGeneralService.resumenEconomico(
            ID_ESTABLECIMIENTO,
            FECHA_DESDE,
            FECHA_HASTA
        );

        // costo alimentacion = (100*4.5 + 50*2.8 + 20*1.5) * 31 dias
        //                    = (450 + 140 + 30) * 31 = 620 * 31 = 19220
        expect(resultado.gastoAlimentacion).toBe(19220);
        expect(resultado.gastoCostosGenerales).toBe(3000);
        expect(resultado.gastoTotal).toBe(22220);
        expect(resultado.lotesCompletos).toBe(60);
        expect(resultado.prorrateoPromedio).toBeCloseTo(22220 / 60);
    });

    it('devuelve prorrateo 0 si no hay lotes completos en el período (evita división por cero)', async () => {
        prismaMock.establecimiento.findUnique.mockResolvedValue(establecimientoConRodeosMock);
        prismaMock.costoGeneral.aggregate.mockResolvedValue({ _sum: { monto: 1000 } });
        prismaMock.loteProduccion.count.mockResolvedValue(0);

        const resultado = await costoGeneralService.resumenEconomico(
            ID_ESTABLECIMIENTO,
            FECHA_DESDE,
            FECHA_HASTA
        );

        expect(resultado.lotesCompletos).toBe(0);
        expect(resultado.prorrateoPromedio).toBe(0);
    });

    it('devuelve gastoAlimentacion 0 si el establecimiento no tiene configuración/rodeos', async () => {
        prismaMock.establecimiento.findUnique.mockResolvedValue({
            idEstablecimiento: ID_ESTABLECIMIENTO,
            configuracions: [],
        });
        prismaMock.costoGeneral.aggregate.mockResolvedValue({ _sum: { monto: 500 } });
        prismaMock.loteProduccion.count.mockResolvedValue(10);

        const resultado = await costoGeneralService.resumenEconomico(
            ID_ESTABLECIMIENTO,
            FECHA_DESDE,
            FECHA_HASTA
        );

        expect(resultado.gastoAlimentacion).toBe(0);
        expect(resultado.gastoTotal).toBe(500);
    });

    it('trata costos generales sin registros como 0 (aggregate sin monto)', async () => {
        prismaMock.establecimiento.findUnique.mockResolvedValue(establecimientoConRodeosMock);
        prismaMock.costoGeneral.aggregate.mockResolvedValue({ _sum: { monto: null } });
        prismaMock.loteProduccion.count.mockResolvedValue(5);

        const resultado = await costoGeneralService.resumenEconomico(
            ID_ESTABLECIMIENTO,
            FECHA_DESDE,
            FECHA_HASTA
        );

        expect(resultado.gastoCostosGenerales).toBe(0);
    });

    it('lanza 404 si el establecimiento no existe', async () => {
        prismaMock.establecimiento.findUnique.mockResolvedValue(null);

        await expect(
            costoGeneralService.resumenEconomico(ID_ESTABLECIMIENTO, FECHA_DESDE, FECHA_HASTA)
        ).rejects.toBeInstanceOf(AppError);
    });

    it('solo cuenta lotes con estado COMPLETO en el conteo de lotesCompletos', async () => {
        prismaMock.establecimiento.findUnique.mockResolvedValue(establecimientoConRodeosMock);
        prismaMock.costoGeneral.aggregate.mockResolvedValue({ _sum: { monto: 0 } });
        prismaMock.loteProduccion.count.mockResolvedValue(3);

        await costoGeneralService.resumenEconomico(ID_ESTABLECIMIENTO, FECHA_DESDE, FECHA_HASTA);

        expect(prismaMock.loteProduccion.count).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    estado: true,
                }),
            })
        );
    });
});
