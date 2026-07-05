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

            const resultado = await costoGeneralService.listar(ID_ESTABLECIMIENTO);

            expect(prismaMock.costoGeneral.findMany).toHaveBeenCalledTimes(1);
            expect(resultado).toHaveLength(1);
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
});