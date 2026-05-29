import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileController } from '../../../src/controllers/profileController';

const { profileServiceMock } = vi.hoisted(() => ({
    profileServiceMock: {
        respondOrganizationInvitation: vi.fn(),
        respondEstablishmentInvitation: vi.fn(),
    },
}));

vi.mock('../../../src/services/profileService', () => ({
    default: profileServiceMock,
}));

describe('ProfileController invitation responses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('respondOrganizationInvitation rechaza usuario no autenticado', async () => {
        const req = {
            user: undefined,
            body: {
                idInvitacion: '550e8400-e29b-41d4-a716-446655440000',
                accion: 'aceptada',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await ProfileController.respondOrganizationInvitation(req, res, next);

        expect(profileServiceMock.respondOrganizationInvitation).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('Usuario no autenticado');
        expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('respondOrganizationInvitation rechaza datos inválidos', async () => {
        const req = {
            user: { id: 'user-1' },
            body: {
                idInvitacion: 'invalid',
                accion: 'aceptada',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await ProfileController.respondOrganizationInvitation(req, res, next);

        expect(profileServiceMock.respondOrganizationInvitation).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('Datos inválidos');
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('respondOrganizationInvitation responde correctamente', async () => {
        profileServiceMock.respondOrganizationInvitation.mockResolvedValue({ response: 'aceptada' });

        const req = {
            user: { id: 'user-1' },
            body: {
                idInvitacion: '550e8400-e29b-41d4-a716-446655440000',
                accion: 'aceptada',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await ProfileController.respondOrganizationInvitation(req, res, next);

        expect(profileServiceMock.respondOrganizationInvitation).toHaveBeenCalledWith(
            '550e8400-e29b-41d4-a716-446655440000',
            'aceptada',
            'user-1',
            'ORG_ADMIN'
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Invitaciones respondidas correctamente',
            data: { response: 'aceptada' },
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('respondEstablishmentInvitation rechaza datos inválidos', async () => {
        const req = {
            user: { id: 'user-1' },
            body: {
                idInvitacion: 'invalid',
                accion: 'aceptada',
                rol: 'ADMIN',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await ProfileController.respondEstablishmentInvitation(req, res, next);

        expect(profileServiceMock.respondEstablishmentInvitation).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].message).toBe('Datos inválidos');
        expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('respondEstablishmentInvitation responde correctamente', async () => {
        profileServiceMock.respondEstablishmentInvitation.mockResolvedValue({ response: 'aceptada' });

        const req = {
            user: { id: 'user-1' },
            body: {
                idInvitacion: '550e8400-e29b-41d4-a716-446655440000',
                accion: 'aceptada',
                rol: 'ADMIN',
            },
        } as any;
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        } as any;
        const next = vi.fn();

        await ProfileController.respondEstablishmentInvitation(req, res, next);

        expect(profileServiceMock.respondEstablishmentInvitation).toHaveBeenCalledWith(
            '550e8400-e29b-41d4-a716-446655440000',
            'aceptada',
            'user-1',
            'ADMIN'
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Invitaciones respondidas correctamente',
            data: { response: 'aceptada' },
        }));
        expect(next).not.toHaveBeenCalled();
    });
});
