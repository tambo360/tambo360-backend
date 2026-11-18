import { z } from "zod";
import { RolOrganizacion } from "@prisma/client";



export const createOrganizationSchema = z.object({
    nombre: z.string("El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder los 100 caracteres"),
    userId: z.string("El ID del usuario es requerido"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;