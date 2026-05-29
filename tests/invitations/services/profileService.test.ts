import { beforeEach, describe, expect, it, vi } from 'vitest';
import profileService from '../../../src/services/profileService';

const { prismaMock } = vi.hoisted(() => ({
    prismaMock: {
        invitacionOrganizacion: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        invitacionEstablecimiento: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        usuario: {
            findUnique: vi.fn(),
        },
        organizacionUsuario: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        establecimiento_OrganizacionUsuario: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock('../../../src/lib/prisma', () => ({
    prisma: prismaMock,
}));

describe('ProfileService invitation responses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('acepta una invitación de organización y la persiste', async () => {
        prismaMock.invitacionOrganizacion.findUnique.mockResolvedValue({
            idInvitacion: 'org-inv-1',
            idOrganizacion: 'org-1',
            correo: 'user@example.com',
            expiraEn: new Date(Date.now() + 60_000),
            respondidaEn: null,
        });
        prismaMock.usuario.findUnique.mockResolvedValue({
            correo: 'user@example.com',
        });

        const txMock = {
            organizacionUsuario: {
                create: vi.fn().mockResolvedValue({ idOrganizacionUsuario: 'org-user-1' }),
            },
            invitacionOrganizacion: {
                update: vi.fn().mockResolvedValue({ idInvitacion: 'org-inv-1' }),
            },
        };

        prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));

        const result = await profileService.respondOrganizationInvitation('org-inv-1', 'aceptada', 'user-1', 'ORG_ADMIN');

        expect(prismaMock.invitacionOrganizacion.findUnique).toHaveBeenCalledWith({
            where: { idInvitacion: 'org-inv-1' },
        });
        expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
            where: { idUsuario: 'user-1' },
        });
        expect(txMock.organizacionUsuario.create).toHaveBeenCalledWith({
            data: {
                idOrganizacion: 'org-1',
                idUsuario: 'user-1',
                rol: 'ORG_ADMIN',
            },
        });
        expect(txMock.invitacionOrganizacion.update).toHaveBeenCalledWith({
            where: { idInvitacion: 'org-inv-1' },
            data: {
                estado: 'aceptada',
                respondidaEn: expect.any(Date),
            },
        });
        expect(result).toEqual({ response: 'aceptada' });
    });

    it('acepta una invitación de establecimiento y la añade al establecimiento', async () => {
        prismaMock.invitacionEstablecimiento.findUnique.mockResolvedValue({
            idInvitacion: 'est-inv-1',
            idEstablecimiento: 'est-1',
            correo: 'user@example.com',
            expiraEn: new Date(Date.now() + 60_000),
            respondidaEn: null,
            establecimiento: {
                idOrganizacion: 'org-1',
            },
        });
        prismaMock.usuario.findUnique.mockResolvedValue({
            correo: 'user@example.com',
        });

        const txMock = {
            organizacionUsuario: {
                findUnique: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ idOrganizacionUsuario: 'org-user-1' }),
            },
            establecimiento_OrganizacionUsuario: {
                findUnique: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ idEstablecimiento: 'est-1' }),
            },
            invitacionEstablecimiento: {
                update: vi.fn().mockResolvedValue({ idInvitacion: 'est-inv-1' }),
            },
        };

        prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));

        const result = await profileService.respondEstablishmentInvitation('est-inv-1', 'aceptada', 'user-1', 'ADMIN');

        expect(prismaMock.invitacionEstablecimiento.findUnique).toHaveBeenCalledWith({
            where: { idInvitacion: 'est-inv-1' },
            include: {
                establecimiento: {
                    include: { organizacion: true },
                },
            },
        });
        expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
            where: { idUsuario: 'user-1' },
        });
        expect(txMock.organizacionUsuario.findUnique).toHaveBeenCalledWith({
            where: {
                idOrganizacion_idUsuario: {
                    idOrganizacion: 'org-1',
                    idUsuario: 'user-1',
                },
            },
        });
        expect(txMock.organizacionUsuario.create).toHaveBeenCalledWith({
            data: {
                idOrganizacion: 'org-1',
                idUsuario: 'user-1',
                rol: 'MEMBER',
            },
        });
        expect(txMock.establecimiento_OrganizacionUsuario.findUnique).toHaveBeenCalledWith({
            where: {
                idEstablecimiento_idOrganizacionUsuario: {
                    idEstablecimiento: 'est-1',
                    idOrganizacionUsuario: 'org-user-1',
                },
            },
        });
        expect(txMock.establecimiento_OrganizacionUsuario.create).toHaveBeenCalledWith({
            data: {
                idOrganizacionUsuario: 'org-user-1',
                idEstablecimiento: 'est-1',
                rol: 'ADMIN',
            },
        });
        expect(txMock.invitacionEstablecimiento.update).toHaveBeenCalledWith({
            where: { idInvitacion: 'est-inv-1' },
            data: {
                estado: 'aceptada',
                respondidaEn: expect.any(Date),
            },
        });
        expect(result).toEqual({ response: 'aceptada' });
    });

    it('rechaza una invitación de organización', async () => {
        prismaMock.invitacionOrganizacion.findUnique.mockResolvedValue({
            idInvitacion: 'org-inv-1',
            idOrganizacion: 'org-1',
            correo: 'user@example.com',
            expiraEn: new Date(Date.now() + 60_000),
            respondidaEn: null,
        });
        prismaMock.usuario.findUnique.mockResolvedValue({
            correo: 'user@example.com',
        });

        const result = await profileService.respondOrganizationInvitation('org-inv-1', 'rechazada', 'user-1', 'ORG_ADMIN');

        expect(prismaMock.invitacionOrganizacion.findUnique).toHaveBeenCalledWith({
            where: { idInvitacion: 'org-inv-1' },
        });
        expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
            where: { idUsuario: 'user-1' },
        });
        expect(prismaMock.invitacionOrganizacion.update).toHaveBeenCalledWith({
            where: { idInvitacion: 'org-inv-1' },
            data: {
                estado: 'rechazada',
                respondidaEn: expect.any(Date),
            },
        });
        expect(result).toEqual({ response: 'rechazada' });
    });

    it('rechaza una invitación de establecimiento', async () => {
        prismaMock.invitacionEstablecimiento.findUnique.mockResolvedValue({
            idInvitacion: 'est-inv-1',
            idEstablecimiento: 'est-1',
            correo: 'user@example.com',
            expiraEn: new Date(Date.now() + 60_000),
            respondidaEn: null,
            establecimiento: {
                idOrganizacion: 'org-1',
            },
        });
        prismaMock.usuario.findUnique.mockResolvedValue({
            correo: 'user@example.com',
        });

        const result = await profileService.respondEstablishmentInvitation('est-inv-1', 'rechazada', 'user-1', 'ADMIN');

        expect(prismaMock.invitacionEstablecimiento.findUnique).toHaveBeenCalledWith({
            where: { idInvitacion: 'est-inv-1' },
            include: {
                establecimiento: {
                    include: { organizacion: true },
                },
            },
        });
        expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
            where: { idUsuario: 'user-1' },
        });
        expect(prismaMock.invitacionEstablecimiento.update).toHaveBeenCalledWith({
            where: { idInvitacion: 'est-inv-1' },
            data: {
                estado: 'rechazada',
                respondidaEn: expect.any(Date),
            },
        });
        expect(result).toEqual({ response: 'rechazada' });
    });
});
