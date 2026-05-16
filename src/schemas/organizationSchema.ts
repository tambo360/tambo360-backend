import { z } from "zod";
import { RolOrganizacion } from "@prisma/client";



export const createOrganizationSchema = z.object({
    nombre: z.string(),
    userId: z.string(),
    rol: z.nativeEnum(RolOrganizacion)
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;