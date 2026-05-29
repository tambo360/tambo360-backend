// Suite de pruebas de aislamiento multitenant.
// Se valida que el middleware impida el acceso entre organizaciones y
// establecimientos, y que solo asigne contexto cuando el vínculo existe.
import { RolEstablecimiento, RolOrganizacion } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  establecimientoRequireOrgAccess,
  estContext,
  orgContext,
  requireOrgAccess,
} from '../../src/middleware/orgMiddleware';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    organizacionUsuario: {
      findFirst: vi.fn(),
    },
    establecimiento_OrganizacionUsuario: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../../src/lib/prisma', () => ({
  prisma: prismaMock,
}));

function buildResponse() {
  return {
    sendStatus: vi.fn(),
  } as any;
}

function buildJsonResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as any;
}

describe('orgMiddleware multitenant access', () => {
  beforeEach(() => {
    prismaMock.organizacionUsuario.findFirst.mockReset();
    prismaMock.establecimiento_OrganizacionUsuario.findFirst.mockReset();
  });

  it('permite el acceso cuando el usuario pertenece a la organización', async () => {
    prismaMock.organizacionUsuario.findFirst.mockResolvedValue({
      idOrganizacionUsuario: 'org-user-link-1',
      idUsuario: 'user-1',
      idOrganizacion: 'org-1',
      rol: RolOrganizacion.ORG_OWNER,
      estado: true,
    });

    const req = {
      user: { id: 'user-1' },
      orgId: 'org-1',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await requireOrgAccess(req, res, next);

    expect(prismaMock.organizacionUsuario.findFirst).toHaveBeenCalledWith({
      where: {
        idUsuario: 'user-1',
        idOrganizacion: 'org-1',
      },
      select: {
        idOrganizacionUsuario: true,
        idUsuario: true,
        idOrganizacion: true,
        rol: true,
        estado: true,
      },
    });
    expect(req.orgAccess).toEqual({
      idOrganizacionUsuario: 'org-user-link-1',
      idUsuario: 'user-1',
      idOrganizacion: 'org-1',
      rol: RolOrganizacion.ORG_OWNER,
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it('deniega cuando el usuario no pertenece a la organización', async () => {
    prismaMock.organizacionUsuario.findFirst.mockResolvedValue(null);

    const req = {
      user: { id: 'user-1' },
      orgId: 'org-1',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await requireOrgAccess(req, res, next);

    expect(prismaMock.organizacionUsuario.findFirst).toHaveBeenCalled();
    expect(req.orgAccess).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('deniega accesos cruzados entre tenants', async () => {
    prismaMock.organizacionUsuario.findFirst.mockResolvedValue(null);

    const req = {
      user: { id: 'user-1' },
      orgId: 'tenant-b-org',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await requireOrgAccess(req, res, next);

    expect(prismaMock.organizacionUsuario.findFirst).toHaveBeenCalledWith({
      where: {
        idUsuario: 'user-1',
        idOrganizacion: 'tenant-b-org',
      },
      select: {
        idOrganizacionUsuario: true,
        idUsuario: true,
        idOrganizacion: true,
        rol: true,
        estado: true,
      },
    });
    expect(req.orgAccess).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('deniega cuando la organización está desactivada', async () => {
    prismaMock.organizacionUsuario.findFirst.mockResolvedValue({
      idOrganizacionUsuario: 'org-user-link-1',
      idUsuario: 'user-1',
      idOrganizacion: 'org-1',
      rol: RolOrganizacion.MEMBER,
      estado: false,
    });

    const req = {
      user: { id: 'user-1' },
      orgId: 'org-1',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await requireOrgAccess(req, res, next);

    expect(req.orgAccess).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('deniega cuando no hay usuario en la request', async () => {
    prismaMock.organizacionUsuario.findFirst.mockResolvedValue(null);

    const req = {
      orgId: 'org-1',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await requireOrgAccess(req, res, next);

    expect(prismaMock.organizacionUsuario.findFirst).toHaveBeenCalledWith({
      where: {
        idUsuario: undefined,
        idOrganizacion: 'org-1',
      },
      select: {
        idOrganizacionUsuario: true,
        idUsuario: true,
        idOrganizacion: true,
        rol: true,
        estado: true,
      },
    });
    expect(req.orgAccess).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('rechaza orgContext cuando la cabecera falta', () => {
    const req = {
      headers: {},
    } as any;
    const res = buildJsonResponse();
    const next = vi.fn();

    orgContext(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Falta organización' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza orgContext cuando la cabecera llega como array', () => {
    const req = {
      headers: {
        'x-organizacion-id': ['org-1'],
      },
    } as any;
    const res = buildJsonResponse();
    const next = vi.fn();

    orgContext(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Falta organización' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza estContext cuando la cabecera falta', () => {
    const req = {
      headers: {},
    } as any;
    const res = buildJsonResponse();
    const next = vi.fn();

    estContext(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Falta establecimiento' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza estContext cuando la cabecera llega como array', () => {
    const req = {
      headers: {
        'x-establecimiento-id': ['est-1'],
      },
    } as any;
    const res = buildJsonResponse();
    const next = vi.fn();

    estContext(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Falta establecimiento' });
    expect(next).not.toHaveBeenCalled();
  });

  it('permite el acceso cuando el establecimiento está vinculado al orgAccess activo', async () => {
    prismaMock.establecimiento_OrganizacionUsuario.findFirst.mockResolvedValue({
      idEstablecimientoOrganizacionUsuario: 'est-org-link-1',
      idEstablecimiento: 'est-1',
      idOrganizacionUsuario: 'org-user-link-1',
      rol: RolEstablecimiento.OWNER,
      estado: true,
    });

    const req = {
      orgAccess: {
        idOrganizacionUsuario: 'org-user-link-1',
      },
      estId: 'est-1',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await establecimientoRequireOrgAccess(req, res, next);

    expect(prismaMock.establecimiento_OrganizacionUsuario.findFirst).toHaveBeenCalledWith({
      where: {
        idOrganizacionUsuario: 'org-user-link-1',
        idEstablecimiento: 'est-1',
      },
    });
    expect(req.estAccess).toEqual({
      idEstablecimientoOrganizacionUsuario: 'est-org-link-1',
      idEstablecimiento: 'est-1',
      rol: RolEstablecimiento.OWNER,
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it('deniega cuando el vínculo de establecimiento está desactivado', async () => {
    prismaMock.establecimiento_OrganizacionUsuario.findFirst.mockResolvedValue({
      idEstablecimientoOrganizacionUsuario: 'est-org-link-1',
      idEstablecimiento: 'est-1',
      idOrganizacionUsuario: 'org-user-link-1',
      rol: RolEstablecimiento.OWNER,
      estado: false,
    });

    const req = {
      orgAccess: {
        idOrganizacionUsuario: 'org-user-link-1',
      },
      estId: 'est-1',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await establecimientoRequireOrgAccess(req, res, next);

    expect(req.estAccess).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('deniega cuando el establecimiento pertenece a otro tenant', async () => {
    prismaMock.establecimiento_OrganizacionUsuario.findFirst.mockResolvedValue(null);

    const req = {
      orgAccess: {
        idOrganizacionUsuario: 'org-user-link-1',
      },
      estId: 'est-from-other-tenant',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await establecimientoRequireOrgAccess(req, res, next);

    expect(req.estAccess).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('deniega cuando no hay orgAccess válido para consultar el establecimiento', async () => {
    prismaMock.establecimiento_OrganizacionUsuario.findFirst.mockResolvedValue(null);

    const req = {
      estId: 'est-1',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await establecimientoRequireOrgAccess(req, res, next);

    expect(prismaMock.establecimiento_OrganizacionUsuario.findFirst).toHaveBeenCalledWith({
      where: {
        idOrganizacionUsuario: undefined,
        idEstablecimiento: 'est-1',
      },
    });
    expect(req.estAccess).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('deniega cuando el establecimiento no existe o no está vinculado', async () => {
    prismaMock.establecimiento_OrganizacionUsuario.findFirst.mockResolvedValue(null);

    const req = {
      orgAccess: {
        idOrganizacionUsuario: 'org-user-link-1',
      },
      estId: 'est-ghost',
    } as any;
    const res = buildResponse();
    const next = vi.fn();

    await establecimientoRequireOrgAccess(req, res, next);

    expect(prismaMock.establecimiento_OrganizacionUsuario.findFirst).toHaveBeenCalledWith({
      where: {
        idOrganizacionUsuario: 'org-user-link-1',
        idEstablecimiento: 'est-ghost',
      },
    });
    expect(req.estAccess).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });
});
