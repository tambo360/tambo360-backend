import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppError } from '../../src/utils/AppError';
import profileService from '../../src/services/profileService';

const { prismaMock, comparePasswordMock, sendVerificationEmailMock } = vi.hoisted(() => ({
    prismaMock: {
        usuario: { findUnique: vi.fn(), update: vi.fn() },
        verificarToken: { deleteMany: vi.fn(), create: vi.fn() },
        $transaction: vi.fn(),
    },
    comparePasswordMock: vi.fn(),
    sendVerificationEmailMock: vi.fn(),
}));

vi.mock('../../src/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('../../src/utils/password', () => ({ comparePassword: comparePasswordMock }));
vi.mock('../../src/utils/token', () => ({
    generateToken: () => 'token-raw',
    hashToken: () => 'token-hash',
}));
vi.mock('../../src/services/mailService', () => ({
    sendVerificationEmail: sendVerificationEmailMock,
}));

const ID_USUARIO = 'user-123';

const usuarioMock = {
    idUsuario: ID_USUARIO,
    nombre: 'Usuario de Prueba',
    correo: 'usuario@test.com',
    contrasena: 'hash',
    verificado: true,
};

describe('ProfileService.actualizarPerfil', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        prismaMock.$transaction.mockImplementation((fn: any) => fn(prismaMock));
    });

    it('actualiza solo el nombre sin tocar verificado ni mandar mail', async () => {
        prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);
        prismaMock.usuario.update.mockResolvedValue({ ...usuarioMock, nombre: 'Nuevo Nombre' });

        const r = await profileService.actualizarPerfil(ID_USUARIO, { nombre: 'Nuevo Nombre' });

        expect(r.nombre).toBe('Nuevo Nombre');
        expect(prismaMock.usuario.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { nombre: 'Nuevo Nombre' } })
        );
        expect(prismaMock.verificarToken.create).not.toHaveBeenCalled();
        expect(sendVerificationEmailMock).not.toHaveBeenCalled();
    });

    it('lanza 404 si el usuario no existe', async () => {
        prismaMock.usuario.findUnique.mockResolvedValue(null);

        await expect(
            profileService.actualizarPerfil(ID_USUARIO, { nombre: 'Nuevo Nombre' })
        ).rejects.toBeInstanceOf(AppError);
    });

    it('lanza error si la contraseña actual es incorrecta', async () => {
        prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);
        comparePasswordMock.mockResolvedValue(false);

        await expect(
            profileService.actualizarPerfil(ID_USUARIO, { correo: 'nuevo@test.com', contraseñaActual: 'mal' })
        ).rejects.toThrow('La contraseña actual es incorrecta');
        expect(prismaMock.usuario.update).not.toHaveBeenCalled();
    });

    it('lanza error si el correo ya está en uso', async () => {
        prismaMock.usuario.findUnique
            .mockResolvedValueOnce(usuarioMock)
            .mockResolvedValueOnce({ ...usuarioMock, idUsuario: 'otro' });
        comparePasswordMock.mockResolvedValue(true);

        await expect(
            profileService.actualizarPerfil(ID_USUARIO, { correo: 'ocupado@test.com', contraseñaActual: 'ok' })
        ).rejects.toThrow('El correo ya está en uso');
        expect(prismaMock.usuario.update).not.toHaveBeenCalled();
    });

    it('cambia el correo, deja verificado en false y manda el mail al correo nuevo', async () => {
        prismaMock.usuario.findUnique
            .mockResolvedValueOnce(usuarioMock)
            .mockResolvedValueOnce(null);
        comparePasswordMock.mockResolvedValue(true);
        prismaMock.usuario.update.mockResolvedValue({
            ...usuarioMock,
            correo: 'nuevo@test.com',
            verificado: false,
        });

        const r = await profileService.actualizarPerfil(ID_USUARIO, {
            correo: 'nuevo@test.com',
            contraseñaActual: 'ok',
        });

        expect(r.verificado).toBe(false);
        expect(prismaMock.usuario.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { correo: 'nuevo@test.com', verificado: false } })
        );
        expect(prismaMock.verificarToken.deleteMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.verificarToken.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ tokenHash: 'token-hash' }) })
        );
        expect(sendVerificationEmailMock).toHaveBeenCalledWith(
            'nuevo@test.com',
            expect.stringContaining('token-raw')
        );
    });

    it('si el correo es el mismo que el actual, no pide contraseña ni manda mail', async () => {
        prismaMock.usuario.findUnique.mockResolvedValue(usuarioMock);
        prismaMock.usuario.update.mockResolvedValue(usuarioMock);

        await profileService.actualizarPerfil(ID_USUARIO, {
            correo: 'usuario@test.com',
            contraseñaActual: 'x',
        });

        expect(comparePasswordMock).not.toHaveBeenCalled();
        expect(sendVerificationEmailMock).not.toHaveBeenCalled();
    });
});