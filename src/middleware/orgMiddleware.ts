import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

interface JwtPayload {
  orgId: {
    idUsuario: string;
  };
}

export function orgContext(req: Request, res: Response, next: NextFunction) {
  const orgId = req.headers["x-organizacion-id"];

  if (!orgId || Array.isArray(orgId)) {
    return res.status(400).json({ error: "Falta organización" });
  }

  req.orgId = orgId;
  next();
}

export function estContext(req: Request, res: Response, next: NextFunction) {
  const estId = req.headers["x-establecimiento-id"];

  if (!estId || Array.isArray(estId)) {
    return res.status(400).json({ error: "Falta establecimiento" });
  }

  req.estId = estId;
  next();
}

export async function requireOrgAccess(req: Request, res: Response, next: NextFunction) {
  const access = await prisma.organizacionUsuario.findFirst({
    where: {
      idUsuario: req.user?.id,
      idOrganizacion: req.orgId
    },
    select: {
      idOrganizacionUsuario: true,
      idUsuario: true,
      idOrganizacion: true,
      rol: true,
      estado: true
    }
  });



  if (!access || !access.estado) {
    return res.sendStatus(403);
  }

  req.orgAccess = {
    idOrganizacionUsuario: access.idOrganizacionUsuario,
    idUsuario: access.idUsuario,
    idOrganizacion: access.idOrganizacion,
    rol: access.rol
  };

  next();
}


export async function establecimientoRequireOrgAccess(req: Request, res: Response, next: NextFunction) {
  const access = await prisma.establecimiento_OrganiacionUsuario.findFirst({
    where: {
      idOrganizacionUsuario: req.orgAccess?.idOrganizacionUsuario,
      idEstablecimiento: req.estId
    }
  });



  if (!access || !access.estado) {
    return res.sendStatus(403);
  }

  req.estAccess = {
    idEstablecimientoOrganizacionUsuario: access.idEstablecimientoOrganizacionUsuario,
    idEstablecimiento: access.idEstablecimiento,
    rol: access.rol
  };

  next();
}