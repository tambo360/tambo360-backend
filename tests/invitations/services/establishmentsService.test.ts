import { beforeEach, describe, expect, it, vi } from 'vitest';
import establishmentsService from '../../../src/services/establishmentsService';
import { TipoOrdenie, VentaLeche, Categoria, TipoSeguimiento, TipoRodeo } from '@prisma/client';

const { prismaMock, sendInvitationEmailMock, generateTokenMock, hashTokenMock } = vi.hoisted(() => ({
    prismaMock: {
        invitacionEstablecimiento: {
            findFirst: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
        $transaction: vi.fn(),
    },
    sendInvitationEmailMock: vi.fn(),
    generateTokenMock: vi.fn(),
    hashTokenMock: vi.fn(),
}));

vi.mock('../../../src/lib/prisma', () => ({
    prisma: prismaMock,
}));

vi.mock('../../../src/services/mailService', () => ({
    sendInvitationEmail: sendInvitationEmailMock,
}));

vi.mock('../../../src/utils/token', () => ({
    generateToken: generateTokenMock,
    hashToken: hashTokenMock,
}));

describe('EstablishmentsService.deleteInvitation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('elimina una invitación pendiente del establecimiento actual', async () => {
        prismaMock.invitacionEstablecimiento.findUnique.mockResolvedValue({
            idInvitacion: 'est-invitation-1',
            idEstablecimiento: 'est-1',
            correo: 'user@example.com',
            estado: 'pendiente',
            respondidaEn: null,
        });

        prismaMock.invitacionEstablecimiento.delete.mockResolvedValue({
            idInvitacion: 'est-invitation-1',
        });

        const result = await establishmentsService.deleteInvitation('est-invitation-1', 'est-1');

        expect(prismaMock.invitacionEstablecimiento.findUnique).toHaveBeenCalledWith({
            where: { idInvitacion: 'est-invitation-1' },
        });
        expect(prismaMock.invitacionEstablecimiento.delete).toHaveBeenCalledWith({
            where: { idInvitacion: 'est-invitation-1' },
        });
        expect(result).toEqual({
            idInvitacion: 'est-invitation-1',
            idEstablecimiento: 'est-1',
            correo: 'user@example.com',
            estado: 'pendiente',
        });
    });

    it('rechaza eliminar una invitación ya procesada', async () => {
        prismaMock.invitacionEstablecimiento.findUnique.mockResolvedValue({
            idInvitacion: 'est-invitation-1',
            idEstablecimiento: 'est-1',
            correo: 'user@example.com',
            estado: 'rechazada',
            respondidaEn: new Date(),
        });

        await expect(establishmentsService.deleteInvitation('est-invitation-1', 'est-1')).rejects.toMatchObject({
            message: 'La invitación ya ha sido procesada',
            statusCode: 400,
        });

        expect(prismaMock.invitacionEstablecimiento.delete).not.toHaveBeenCalled();
    });

    it('rechaza eliminar una invitación que no pertenece al establecimiento actual', async () => {
        prismaMock.invitacionEstablecimiento.findUnique.mockResolvedValue({
            idInvitacion: 'est-invitation-1',
            idEstablecimiento: 'est-2',
            correo: 'user@example.com',
            estado: 'pendiente',
            respondidaEn: null,
        });

        await expect(establishmentsService.deleteInvitation('est-invitation-1', 'est-1')).rejects.toMatchObject({
            message: 'No tienes permiso para eliminar esta invitación',
            statusCode: 403,
        });

        expect(prismaMock.invitacionEstablecimiento.delete).not.toHaveBeenCalled();
    });
});

describe('EstablishmentsService.sendInvitation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.FRONTEND_URL = 'http://localhost:3000';
    });

    it('crea y envía una invitación cuando no existe una activa', async () => {
        generateTokenMock.mockReturnValue('raw-token');
        hashTokenMock.mockReturnValue('hashed-token');
        prismaMock.invitacionEstablecimiento.findFirst.mockResolvedValue(null);
        prismaMock.invitacionEstablecimiento.create.mockResolvedValue({
            invitador: { nombre: 'Invitador' },
            establecimiento: { nombre: 'Establecimiento' },
            rol: 'ADMIN',
            expiraEn: new Date('2026-06-10T10:00:00.000Z'),
        });

        const result = await establishmentsService.sendInvitation('org-1', 'est-1', 'user-1', 'user@example.com', 'ADMIN');

        expect(generateTokenMock).toHaveBeenCalled();
        expect(hashTokenMock).toHaveBeenCalledWith('raw-token');
        expect(prismaMock.invitacionEstablecimiento.findFirst).toHaveBeenCalledWith({
            where: {
                idEstablecimiento: 'est-1',
                correo: 'user@example.com',
                expiraEn: { gt: expect.any(Date) },
                estado: 'pendiente',
            },
        });
        expect(prismaMock.invitacionEstablecimiento.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                idEstablecimiento: 'est-1',
                idInvitador: 'user-1',
                correo: 'user@example.com',
                codigo: 'hashed-token',
                rol: 'ADMIN',
            }),
            select: {
                invitador: { select: { nombre: true } },
                establecimiento: { select: { nombre: true } },
                rol: true,
                expiraEn: true,
            },
        });
        expect(sendInvitationEmailMock).toHaveBeenCalledWith(
            'user@example.com',
            'Invitador',
            'Establecimiento',
            'el establecimiento',
            'Administrador del establecimiento',
            'http://localhost:3000/invitaciones',
            '2026-06-10'
        );
        expect(result).toEqual({
            invitador: { nombre: 'Invitador' },
            establecimiento: { nombre: 'Establecimiento' },
            rol: 'ADMIN',
            expiraEn: expect.any(Date),
        });
    });

    it('rechaza si ya existe una invitación activa para ese correo', async () => {
        prismaMock.invitacionEstablecimiento.findFirst.mockResolvedValue({
            idInvitacion: 'existing-invitation',
        });

        await expect(establishmentsService.sendInvitation('org-1', 'est-1', 'user-1', 'user@example.com', 'ADMIN')).rejects.toThrow('Ya existe una invitación activa para este correo');

        expect(prismaMock.invitacionEstablecimiento.create).not.toHaveBeenCalled();
        expect(sendInvitationEmailMock).not.toHaveBeenCalled();
    });
});

describe('EstablishmentsService.guardarCuestionario', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('guarda respuestas, reutiliza productos existentes y crea los personalizados en modo RODEO', async () => {
        const txMock = {
            establecimiento: {
                findUnique: vi.fn().mockResolvedValue({
                    idOrganizacion: 'org-1',
                    configuracions: [{ idConfiguracion: 'config-1' }],
                }),
                update: vi.fn().mockResolvedValue({}),
            },
            configuracion: {
                update: vi.fn().mockResolvedValue({}),
            },
            rodeo: {
                createMany: vi.fn().mockResolvedValue({ count: 3 }),
            },
            animal: {
                createMany: vi.fn().mockResolvedValue({ count: 0 }),
            },
            producto: {
                findMany: vi.fn().mockResolvedValue([
                    { idProducto: 'existing-product-1', nombreNormalizado: 'leche' },
                ]),
                create: vi.fn().mockResolvedValue({ idProducto: 'new-product-1' }),
            },
            establecimientoProducto: {
                deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
                createMany: vi.fn().mockResolvedValue({ count: 2 }),
            },
        };

        prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));

        const payload = {
            idEstablecimiento: 'est-1',
            TipoSeguimiento: TipoSeguimiento.RODEO,
            cantVacas: 30,
            productos: [
                { tipo: 'existente' as const, idProducto: 'existing-product-1', nombre: 'Leche' },
                { tipo: 'nuevo' as const, nombre: 'Queso', categoria: Categoria.quesos },
            ],
            rodeos: [
                { tipoRodeo: TipoRodeo.ALTA_PRODUCCION, cantVacas: 10, costoRacion: 100 },
                { tipoRodeo: TipoRodeo.BAJA_PRODUCCION, cantVacas: 10, costoRacion: 90 },
                { tipoRodeo: TipoRodeo.VACAS_SECAS, cantVacas: 10, costoRacion: 80 },
            ],
            cantOrdenie: 2,
            tipoOrdenie: TipoOrdenie.manual,
            promLitros: 18,
            ventaLeche: VentaLeche.usina,
            empleados: true,
            cantEmpleados: 5,
            ubicacion: {
                provincia: 'Córdoba',
                localidad: 'Río Cuarto',
            },
        };

        const result = await establishmentsService.guardarCuestionario(payload);

        expect(prismaMock.$transaction).toHaveBeenCalled();
        expect(txMock.establecimiento.update).toHaveBeenCalledWith({
            where: { idEstablecimiento: 'est-1' },
            data: {
                localidad: 'Río Cuarto',
                provincia: 'Córdoba',
                cuestionarioCompletado: true,
            },
        });
        expect(txMock.configuracion.update).toHaveBeenCalledWith({
            where: { idConfiguracion: 'config-1' },
            data: expect.objectContaining({
                cantVacas: 30,
                cantOrdenies: 2,
                promLitros: 18,
                tipoOrdenie: TipoOrdenie.manual,
                ventaLeche: VentaLeche.usina,
                empleados: true,
                cantEmpleados: 5,
                tipoSeguimiento: TipoSeguimiento.RODEO,
                modificadoEn: expect.any(Date),
            }),
        });
        expect(txMock.rodeo.createMany).toHaveBeenCalledWith({
            data: [
                {
                    tipoRodeo: 'ALTA_PRODUCCION',
                    cantVacas: 10,
                    costoRacion: 100,
                    idConfiguracion: 'config-1',
                },
                {
                    tipoRodeo: 'BAJA_PRODUCCION',
                    cantVacas: 10,
                    costoRacion: 90,
                    idConfiguracion: 'config-1',
                },
                {
                    tipoRodeo: 'VACAS_SECAS',
                    cantVacas: 10,
                    costoRacion: 80,
                    idConfiguracion: 'config-1',
                },
            ],
        });
        expect(txMock.producto.findMany).toHaveBeenCalledWith({
            where: {
                nombreNormalizado: {
                    in: ['queso'],
                },
                OR: [
                    { idOrganizacion: null },
                    { idOrganizacion: 'org-1' },
                ],
            },
        });
        expect(txMock.producto.create).toHaveBeenCalledWith({
            data: {
                nombre: 'Queso',
                nombreNormalizado: 'queso',
                idOrganizacion: 'org-1',
                esSistema: false,
                categoria: Categoria.quesos,
            },
            select: {
                idProducto: true,
            },
        });
        expect(txMock.establecimientoProducto.deleteMany).toHaveBeenCalledWith({
            where: {
                idEstablecimiento: 'est-1',
            },
        });
        expect(txMock.establecimientoProducto.createMany).toHaveBeenCalledWith({
            data: [
                { idEstablecimiento: 'est-1', idProducto: 'existing-product-1' },
                { idEstablecimiento: 'est-1', idProducto: 'new-product-1' },
            ],
        });
        expect(result).toEqual({ status: 'success' });
    });
});
