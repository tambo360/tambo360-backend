// Este archivo valida el comportamiento del middleware de autenticación.
// El objetivo es evitar cualquier bypass: un token inválido, expirado o
// asociado a un usuario inexistente no debe permitir continuar.
import jwt from 'jsonwebtoken';
import { AppError } from '../../src/utils/AppError';
import { authenticate } from '../../src/middleware/authMiddleware';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock de Prisma: el middleware consulta al usuario real para validar que el token
// pertenezca a un usuario existente. Así aislamos la lógica de autenticación del DB.
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    usuario: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../src/lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('authenticate middleware', () => {
  beforeEach(() => {
    // Reinicia el mock del usuario y evita que el estado de un test afecte al siguiente.
    prismaMock.usuario.findUnique.mockReset();
  });

  it('permite el paso con token válido y usuario existente', async () => {
    // El token se firma con el secreto del setup y el usuario se simula como existente.
    prismaMock.usuario.findUnique.mockResolvedValue({ idUsuario: 'user-123' });

    const token = jwt.sign(
      { user: { idUsuario: 'user-123' } },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const req = {
      cookies: { token },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { idUsuario: 'user-123' },
    });
    expect(req.user).toEqual({ id: 'user-123' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('rechaza un token inválido', async () => {
    // Un token corrupto debe fallar en la verificación criptográfica antes de tocar Prisma.
    const req = {
      cookies: { token: 'token-invalido' },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(prismaMock.usuario.findUnique).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Token inválido o expirado');
    expect(error.statusCode).toBe(401);
  });

  it('rechaza un token expirado', async () => {
    // El tiempo vencido del JWT debe causar rechazo inmediato.
    const expiredToken = jwt.sign(
      { user: { idUsuario: 'user-123' } },
      process.env.JWT_SECRET!,
      { expiresIn: '-1s' }
    );

    const req = {
      cookies: { token: expiredToken },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(prismaMock.usuario.findUnique).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Token inválido o expirado');
    expect(error.statusCode).toBe(401);
  });

  it('rechaza tokens cuyo usuario no existe', async () => {
    // Un JWT válido no basta: el usuario debe existir en la base.
    prismaMock.usuario.findUnique.mockResolvedValue(null);

    const token = jwt.sign(
      { user: { idUsuario: 'missing-user' } },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const req = {
      cookies: { token },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { idUsuario: 'missing-user' },
    });
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Usuario no autorizado');
    expect(error.statusCode).toBe(401);
  });

  it('rechaza requests sin token', async () => {
    // No hay cookie de sesión, así que el middleware debe abortar de inmediato.
    const req = {
      cookies: {},
    } as any;
    const res = {} as any;
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(prismaMock.usuario.findUnique).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('No autenticado');
    expect(error.statusCode).toBe(401);
  });

  it('rechaza un formato bearer inválido sin bypass', async () => {
    // El middleware no acepta headers malformados como sustituto del token de cookie.
    const req = {
      cookies: {},
      headers: {
        authorization: 'Bearer',
      },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(prismaMock.usuario.findUnique).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('No autenticado');
    expect(error.statusCode).toBe(401);
  });
});
