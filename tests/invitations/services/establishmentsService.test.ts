import { beforeEach, describe, expect, it, vi } from 'vitest';
import establishmentsService from '../../../src/services/establishmentsService';

const { prismaMock, sendInvitationEmailMock, generateTokenMock, hashTokenMock } = vi.hoisted(() => ({
    prismaMock: {
        invitacionEstablecimiento: {
            findFirst: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
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
