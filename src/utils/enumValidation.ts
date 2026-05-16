import { Categoria, RolEstablecimiento, RolOrganizacion } from "@prisma/client";
import { rolEstablecimientoLabel, rolOrganizacionLabel } from "../types";

export function isValidEnum(value: string): value is Categoria {
  return Object.values(Categoria).includes(value as Categoria);
}

export function getRoleLabel(
  role: RolOrganizacion | RolEstablecimiento,
  type: "organizacion" | "establecimiento"
): string {
  if (type === "organizacion") {
    return rolOrganizacionLabel[role as RolOrganizacion];
  }

  return rolEstablecimientoLabel[role as RolEstablecimiento];
}