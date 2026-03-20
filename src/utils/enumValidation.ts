import { Categoria } from "@prisma/client";

export function isValidEnum(value: string): value is Categoria {
  return Object.values(Categoria).includes(value as Categoria);
}