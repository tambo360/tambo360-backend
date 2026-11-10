import { AppError } from '../../src/utils/AppError';
import costoGeneralService from '../../src/services/costoGeneralService';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TipoCostoGeneral } from '@prisma/client';

const { prismaMock } = vi.hoisted(() => ({
    prismaMock: {
        costoGeneral: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            aggregate: vi.fn(),
            count: vi.fn(),
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
        const periodo = {
            fechaDesde: new Date('2026-07-01'),
            fechaHasta: new Date('2026-07-31'),
        };

        it('lista los costos del establecimiento con paginación', async () => {
            prismaMock.costoGeneral.count.mockResolvedValue(1);
            prismaMock.costoGeneral.findMany.mockResolvedValue([costoMock]);

            const resultado = await costoGeneralService.listar(ID_ESTABLECIMIENTO, periodo);

            expect(prismaMock.costoGeneral.findMany).toHaveBeenCalledTimes(1);
            expect(resultado.costos).toHaveLength(1);
            expect(resultado.totalCostos).toBe(1);
            expect(resultado.totalPaginas).toBe(1);
        });

        it('pagina de a 20 por defecto', async () => {
            prismaMock.costoGeneral.count.mockResolvedValue(45);
            prismaMock.costoGeneral.findMany.mockResolvedValue([]);

            const resultado = await costoGeneralService.listar(ID_ESTABLECIMIENTO, periodo);

            expect(resultado.limit).toBe(20);
            expect(resultado.totalPaginas).toBe(3);
            expect(prismaMock.costoGeneral.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 0, take: 20 })
            );
        });

        it('lanza 404 si la página pedida no existe', async () => {
            prismaMock.costoGeneral.count.mockResolvedValue(5);

            await expect(
                costoGeneralService.listar(ID_ESTABLECIMIENTO, { ...periodo, page: 2 })
            ).rejects.toBeInstanceOf(AppError);
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
// La alimentación es un costo general más (tipo ALIMENTACION): el service hace
// dos aggregate, primero el total de costos y después solo el de alimentación.

describe('resumenEconomico', () => {
    const FECHA_DESDE = new Date('2026-07-01');
    const FECHA_HASTA = new Date('2026-07-31');

    const mockearTotales = (total: number | null, alimentacion: number | null) => {
        prismaMock.costoGeneral.aggregate
            .mockResolvedValueOnce({ _sum: { monto: total } })
            .mockResolvedValueOnce({ _sum: { monto: alimentacion } });
    };

    it('calcula total, alimentación, otros gastos y prorrateo por lote', async () => {
        mockearTotales(3000, 1200);
        prismaMock.loteProduccion.count.mockResolvedValue(60);

        const resultado = await costoGeneralService.resumenEconomico(
            ID_ESTABLECIMIENTO,
            FECHA_DESDE,
            FECHA_HASTA
        );

        expect(resultado.gastoAlimentacion).toBe(1200);
        expect(resultado.gastoCostosGenerales).toBe(3000);
        // el total ya incluye la alimentación: no se suma dos veces
        expect(resultado.gastoTotal).toBe(3000);
        expect(resultado.gastoOtros).toBe(1800);
        expect(resultado.lotesCompletos).toBe(60);
        expect(resultado.prorrateoPromedio).toBeCloseTo(3000 / 60);
    });

    it('devuelve prorrateo 0 si no hay lotes completos en el período (evita división por cero)', async () => {
        mockearTotales(1000, 0);
        prismaMock.loteProduccion.count.mockResolvedValue(0);

        const resultado = await costoGeneralService.resumenEconomico(
            ID_ESTABLECIMIENTO,
            FECHA_DESDE,
            FECHA_HASTA
        );

        expect(resultado.lotesCompletos).toBe(0);
        expect(resultado.prorrateoPromedio).toBe(0);
    });

    it('sin gastos de alimentación, todo el total es "otros gastos"', async () => {
        mockearTotales(500, null);
        prismaMock.loteProduccion.count.mockResolvedValue(10);

        const resultado = await costoGeneralService.resumenEconomico(
            ID_ESTABLECIMIENTO,
            FECHA_DESDE,
            FECHA_HASTA
        );

        expect(resultado.gastoAlimentacion).toBe(0);
        expect(resultado.gastoOtros).toBe(500);
        expect(resultado.gastoTotal).toBe(500);
    });

    it('trata costos generales sin registros como 0 (aggregate sin monto)', async () => {
        mockearTotales(null, null);
        prismaMock.loteProduccion.count.mockResolvedValue(5);

        const resultado = await costoGeneralService.resumenEconomico(
            ID_ESTABLECIMIENTO,
            FECHA_DESDE,
            FECHA_HASTA
        );

        expect(resultado.gastoCostosGenerales).toBe(0);
        expect(resultado.gastoOtros).toBe(0);
    });

    it('solo cuenta lotes con estado COMPLETO en el conteo de lotesCompletos', async () => {
        mockearTotales(0, 0);
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