// Suite de pruebas del middleware de roles.
// Se valida que únicamente los roles autorizados avancen y que cualquier
// rol insuficiente o ausente quede bloqueado para evitar escalación.
import { RolEstablecimiento, RolOrganizacion } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { requireRoles } from '../../src/middleware/orgMiddleware';

function buildResponse() {
  return {
    sendStatus: vi.fn(),
  } as any;
}

describe('requireRoles middleware', () => {
  it('permite al dueño (ORG_OWNER) cuando tiene el rol requerido', () => {
    const req = {
      orgAccess: {
        rol: RolOrganizacion.ORG_OWNER,
      },
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    requireRoles({ org: [RolOrganizacion.ORG_OWNER] })(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it('permite al admin (ORG_ADMIN) cuando el rol permitido coincide', () => {
    const req = {
      orgAccess: {
        rol: RolOrganizacion.ORG_ADMIN,
      },
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    requireRoles({ org: [RolOrganizacion.ORG_ADMIN] })(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it('deniega a miembros cuando el rol no pertenece al conjunto permitido', () => {
    const req = {
      orgAccess: {
        rol: RolOrganizacion.MEMBER,
      },
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    requireRoles({ org: [RolOrganizacion.ORG_OWNER] })(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('deniega cuando el rol no existe o no está presente en la request', () => {
    const req = {
      orgAccess: {},
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    requireRoles({ org: [RolOrganizacion.ORG_OWNER] })(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('deniega cuando los permisos de establecimiento son insuficientes', () => {
    const req = {
      orgAccess: {
        rol: RolOrganizacion.ORG_OWNER,
      },
      estAccess: {
        rol: RolEstablecimiento.EMPLOYEE,
      },
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    requireRoles({
      org: [RolOrganizacion.ORG_OWNER],
      est: [RolEstablecimiento.OWNER],
    })(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });
});
